from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import crud
from database import engine, localSession
from schemas import usuarioData, usuarioId
from models import Base

# ⚠️ CORRECCIÓN: Es .create_all, no .create.all
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
@app.get('/api/usuarios/', response_model=list[usuarioId])
def get_usuario(db: Session = Depends(get_db)):
    return crud.get_usuario(db=db)  # ⚠️ Asegúrate de que la función en crud se llame igual
