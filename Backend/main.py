from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import crud, schemas
from database import engine, localSession
from schemas import usuarioData, UsuarioCreate, PacienteCreate, Paciente  # Asegúrate de que este esquema esté definido correctamente
from models import Base

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear la instancia de FastAPI
app = FastAPI()

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

@app.get("/pacientes/{id}", response_model=schemas.Paciente)
def obtener_paciente(id: int, db: Session = Depends(get_db)):
    paciente = crud.get_paciente_id(db, id)
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return paciente

@app.post("/paciente_con_usuario/")
def create_paciente_con_usuario(data: schemas.PacienteWithUsuario, db: Session = Depends(get_db)):
    return crud.create_paciente_with_usuario(db=db, data=data)
