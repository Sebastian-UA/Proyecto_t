from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import crud, schemas
from database import engine, localSession
from schemas import usuarioData, UsuarioCreate, PacienteCreate, Paciente,ArticulacionCreate, Articulacion,MovimientoCreate

from models import Base
from fastapi.staticfiles import StaticFiles
import os


# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear la instancia de FastAPI
app = FastAPI()

# 🚀 Montar carpeta 'img' para servir imágenes estáticas
app.mount("/img", StaticFiles(directory=os.path.join(os.getcwd(), "img")), name="img")

# Configurar CORS para permitir solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permitir solicitudes desde el frontend
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los encabezados
)

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

