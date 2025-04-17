from sqlalchemy.orm import Session
from models import usuario
from schemas import usuarioData

def get_usuario(db:Session):
    return db.query(usuario).all()

def get_usuario_id(db:Session, id:int):
    return db.query(usuario).filter(usuario.usuarioId == id).first()

def create_usuario(db:Session, usuario:usuarioData):
    fake_password = usuario.contrasena + '#fake'
    new_usuario = usuario(nombre=usuario.nombre,correo=usuario.correo , contrasena=fake_password, rol=usuario.rol)
    db.add(new_usuario)
    db.commit()
    db.flush(new_usuario)
    return new_usuario 