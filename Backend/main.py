from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import crud, schemas
from database import engine, localSession
from schemas import usuarioData  # Asegúrate de que este esquema esté definido correctamente
from models import Base

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI()

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
