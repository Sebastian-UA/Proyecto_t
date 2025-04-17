from sqlalchemy.orm import Session
from models import usuario as UsuarioDB  # Asegúrate de que el modelo se llame correctamente
from schemas import usuarioData  # Este sigue siendo el esquema de Pydantic para la validación

def get_usuario(db: Session):
    return db.query(UsuarioDB).all()

def get_usuario_id(db: Session, id: int):
    return db.query(UsuarioDB).filter(UsuarioDB.usuarioId == id).first()

def create_usuario(db: Session, usuario: usuarioData):
    fake_password = usuario.contrasena + '#fake'  # Añadimos el sufijo a la contraseña
    # Aquí instanciamos el modelo SQLAlchemy, no el esquema Pydantic
    new_usuario = UsuarioDB(
        nombre=usuario.nombre, 
        correo=usuario.correo, 
        contrasena=fake_password, 
        rol=usuario.rol
    )
    db.add(new_usuario)
    db.commit()  # Realiza la transacción
    db.refresh(new_usuario)  # Actualiza el objeto con los datos de la base de datos (por ejemplo, ID generado)
    return new_usuario
