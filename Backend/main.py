from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import crud, schemas
from schemas import LoginRequest
from crud import verificar_login
from database import engine, localSession
from schemas import usuarioData, UsuarioCreate, PacienteCreate, Paciente,ArticulacionCreate, Articulacion,MovimientoCreate,MedicionCreate, Medicion,SesionCreate, Sesion
from schemas import ProfesionalCreate, Profesional,ProfesionalWithUsuario  
from abduccion_video import abduccion_video
from pys_video import pys_video
from flexion_video import flexion_video
import shutil
import uuid
import cv2
import uuid
import subprocess
import os

from fastapi import Form
from fastapi import UploadFile, File
from models import Base
from fastapi.staticfiles import StaticFiles


# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear la instancia de FastAPI
app = FastAPI()

# Montar carpeta 'img' para servir imágenes estáticas
app.mount("/img", StaticFiles(directory=os.path.join(os.getcwd(), "img")), name="img")

# Configurar CORS para permitir solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permitir solicitudes desde el frontend
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los encabezados
)

@app.post("/analizar_video/")
async def analizar_video(
    file: UploadFile = File(...),
    movimiento: str = Form(...),
    lado: str = Form(...),
):
    #print(f"Recibido archivo: {file.filename}, Tamaño: {len(await file.read())} bytes")
    print(f"Movimiento: {movimiento}")
    
    # Guardar el video temporal
    original_path = f"videos/{file.filename}"
    with open(original_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Convertir a mp4 si no es mp4 usando ffmpeg
    ext = os.path.splitext(original_path)[1].lower()
    if ext != ".mp4":
        mp4_path = f"videos/{uuid.uuid4()}.mp4"
        
        try:
            # Usar ffmpeg para convertir el video a mp4
            subprocess.run(
                f'ffmpeg -i "{original_path}" -vcodec libx264 -acodec aac "{mp4_path}"',
                shell=True,
                check=True,
            )

            os.remove(original_path)  # Eliminar el archivo original después de la conversión
        except subprocess.CalledProcessError:
            raise HTTPException(status_code=400, detail="Error al convertir el video.")
    else:
        mp4_path = original_path

    # Elegir el modelo según el tipo de movimiento
    if movimiento.lower() == "abducción":
        print("Ejecutando modelo de Abducción")
        resultado = abduccion_video(mp4_path,lado=lado)
    elif movimiento.lower() == "pronación y supinación":
        print("Ejecutando modelo de p y s")
        resultado = pys_video(mp4_path,lado=lado)
    elif movimiento.lower() == "flexión":
        print("Ejecutando modelo de flexion")
        resultado = flexion_video(mp4_path,lado=lado)
    else:
        os.remove(mp4_path,lado=lado)
        raise HTTPException(status_code=400, detail="Movimiento no reconocido")

    os.remove(mp4_path)
    return resultado

# Función para obtener una sesión de base de datos
def get_db():
    db = localSession()
    try:
        yield db
    finally:
        db.close()

# Ruta raíz de prueba
@app.get('/')
def root():
    return {'message': 'Hola desde el back'}

# Ruta para obtener todos los usuarios
@app.get("/usuarios/", response_model=list[usuarioData])
def read_usuarios(db: Session = Depends(get_db)):
    return crud.get_usuario(db)

# Ruta para crear un nuevo usuario
@app.post("/usuarios/", response_model=usuarioData)
def create_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    return crud.create_usuario(db=db, usuario=usuario)

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    usuario = verificar_login(request.correo, request.contrasena, db)
    if not usuario:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    
    profesional = None
    paciente = None
    
    if usuario.rol == "profesional":
        profesional = crud.get_profesional_by_usuario_id(db, usuario.usuarioId)
    elif usuario.rol == "paciente":
        paciente = crud.get_paciente_by_usuario_id(db, usuario.usuarioId)
    
    response = {
        "id_usuario": usuario.usuarioId,
        "nombre": usuario.nombre,
        "correo": usuario.correo,
        "rol": usuario.rol,
        "rut": usuario.rut,
    }

    if profesional:
        response["id"] = profesional.profesionalId
    if paciente:
        response["id"] = paciente.pacienteId

    return response


# ===========================
# PACIENTE
# ===========================
@app.post("/pacientes/", response_model=schemas.Paciente)
def crear_paciente(paciente: schemas.PacienteCreate, db: Session = Depends(get_db)):
    return crud.create_paciente(db, paciente)

@app.get("/pacientes/", response_model=list[schemas.Paciente])
def listar_pacientes(db: Session = Depends(get_db)):
    return crud.get_pacientes(db)

@app.get("/pacientes/detalle", response_model=list[schemas.PacienteUsuarioOut])
def obtener_detalle_pacientes(db: Session = Depends(get_db)):
    return crud.get_pacientes_con_datos_usuario(db)

@app.get("/pacientes/{id}", response_model=schemas.Paciente)
def obtener_paciente(id: int, db: Session = Depends(get_db)):
    paciente = crud.get_paciente_id(db, id)
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return paciente

@app.post("/paciente_con_usuario/")
def create_paciente_con_usuario(data: schemas.PacienteWithUsuario, db: Session = Depends(get_db)):
    return crud.create_paciente_with_usuario(db=db, data=data)

# ===========================
# PROFESIONAL
# ===========================
@app.post("/profesional_con_usuario/")
def create_profesional_con_usuario(data: ProfesionalWithUsuario, db: Session = Depends(get_db)):
    return crud.create_profesional_with_usuario(db=db, data=data)

@app.post("/profesionales/", response_model=Profesional)
def crear_profesional(profesional: ProfesionalCreate, db: Session = Depends(get_db)):
    return crud.create_profesional(db=db, profesional=profesional)

@app.get("/profesionales/", response_model=list[Profesional])
def listar_profesionales(db: Session = Depends(get_db)):
    return crud.get_profesionales(db)

@app.get("/profesionales/{profesional_id}", response_model=Profesional)
def obtener_profesional(profesional_id: int, db: Session = Depends(get_db)):
    profesional = crud.get_profesional_by_id(db, profesional_id)
    if not profesional:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")
    return profesional

@app.delete("/profesionales/{profesional_id}", response_model=Profesional)
def eliminar_profesional(profesional_id: int, db: Session = Depends(get_db)):
    profesional = crud.delete_profesional(db, profesional_id)
    if not profesional:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")
    return profesional
# ===========================
# ARTICULACION
# ===========================

@app.post("/articulaciones/", response_model=Articulacion)
def crear_articulacion(articulacion: ArticulacionCreate, db: Session = Depends(get_db)):
    return crud.create_articulacion(db, articulacion)

@app.get("/articulaciones/", response_model=list[Articulacion])
def listar_articulaciones(db: Session = Depends(get_db)):
    return crud.get_articulaciones(db)

@app.delete("/articulaciones/{articulacion_id}", response_model=dict)
def eliminar_articulacion(articulacion_id: int, db: Session = Depends(get_db)):
    return crud.delete_articulacion(db, articulacion_id)

# ===========================
# MOVIMIENTO
# ===========================

@app.post("/movimientos/", response_model=schemas.Movimiento)
def crear_movimiento(movimiento: schemas.MovimientoCreate, db: Session = Depends(get_db)):
    return crud.create_movimiento(db=db, movimiento=movimiento)

# Ruta para obtener todos los movimientos
@app.get("/movimientos/", response_model=list[schemas.Movimiento])
def listar_movimientos(db: Session = Depends(get_db)):
    return crud.get_movimientos(db)

@app.get("/movimientos/{movimiento_id}", response_model=schemas.Movimiento)
def obtener_movimiento(movimiento_id: int, db: Session = Depends(get_db)):
    db_movimiento = crud.get_movimiento_by_id(db, movimiento_id)
    if not db_movimiento:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    return db_movimiento


# Ruta para obtener movimientos por ArticulacionId
@app.get("/movimientos/articulacion/{articulacion_id}", response_model=list[schemas.Movimiento])
def obtener_movimientos_por_articulacion(articulacion_id: int, db: Session = Depends(get_db)):
    movimientos = crud.get_movimientos_by_articulacion(db, articulacion_id)
    if not movimientos:
        raise HTTPException(status_code=404, detail="Movimientos no encontrados para esta articulación")
    return movimientos

@app.delete("/movimientos/{movimiento_id}", response_model=schemas.Movimiento)
def eliminar_movimiento(movimiento_id: int, db: Session = Depends(get_db)):
    db_movimiento = crud.delete_movimiento(db=db, movimiento_id=movimiento_id)
    if not db_movimiento:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    return db_movimiento

# ===========================
# SESIONES
# ===========================

@app.post("/sesiones/", response_model=Sesion)
def crear_sesion(sesion: SesionCreate, db: Session = Depends(get_db)):
    return crud.create_sesion(db=db, sesion=sesion)

@app.get("/sesiones/", response_model=list[Sesion])
def listar_sesiones(db: Session = Depends(get_db)):
    return crud.get_sesiones(db)

@app.get("/sesiones/{sesion_id}", response_model=Sesion)
def obtener_sesion(sesion_id: int, db: Session = Depends(get_db)):
    sesion = crud.get_sesion_by_id(db, sesion_id)
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return sesion

@app.delete("/sesiones/{sesion_id}", response_model=Sesion)
def eliminar_sesion(sesion_id: int, db: Session = Depends(get_db)):
    sesion = crud.delete_sesion(db, sesion_id)
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return sesion

# ===========================
# MEDICIONES
# ===========================

@app.post("/mediciones/", response_model=Medicion)
def crear_medicion(medicion: MedicionCreate, db: Session = Depends(get_db)):
    return crud.create_medicion(db=db, medicion=medicion)

@app.get("/mediciones/", response_model=list[Medicion])
def listar_mediciones(db: Session = Depends(get_db)):
    return crud.get_mediciones(db)

@app.get("/mediciones/{medicion_id}", response_model=Medicion)
def obtener_medicion(medicion_id: int, db: Session = Depends(get_db)):
    medicion = crud.get_medicion_by_id(db, medicion_id)
    if not medicion:
        raise HTTPException(status_code=404, detail="Medición no encontrada")
    return medicion

@app.post("/sesiones_con_medicion/", response_model=schemas.SesionConMedicionResponse)
def crear_sesion_con_medicion(data: schemas.SesionWithMedicion, db: Session = Depends(get_db)):
    result = crud.create_sesion_with_medicion(db=db, data=data)
    return {
        "sesion": result["sesion"],
        "medicion": result["medicion"]
    }