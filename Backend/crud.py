from sqlalchemy.orm import Session
from models import usuario as UsuarioDB  # Asegúrate de que el modelo se llame correctamente
from models import paciente as PacienteDB  # Ajusta el nombre si lo tienes diferente
from models import movimiento as MovimientoDB  # Asegúrate de que el modelo esté correctamente importado
from schemas import usuarioData, PacienteCreate, PacienteWithUsuario, ArticulacionCreate,MovimientoCreate, Movimiento # Este sigue siendo el esquema de Pydantic para la validación
import models

# ===========================
# USUARIO
# ===========================
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
        rol=usuario.rol,
        rut=usuario.rut  # <--- NUEVO CAMPO AÑADIDO
    )
    db.add(new_usuario)
    db.commit()  # Realiza la transacción
    db.refresh(new_usuario)  # Actualiza el objeto con los datos de la base de datos (por ejemplo, ID generado)
    return new_usuario

# ===========================
# PACIENTE
# ===========================
def get_pacientes(db: Session):
    return db.query(PacienteDB).all()

def get_paciente_id(db: Session, id: int):
    return db.query(PacienteDB).filter(PacienteDB.pacienteId == id).first()

def create_paciente(db: Session, paciente: PacienteCreate):
    new_paciente = PacienteDB(
        usuarioId=paciente.usuarioId,
        edad=paciente.edad,
        telefono=paciente.telefono
    )
    db.add(new_paciente)
    db.commit()
    db.refresh(new_paciente)
    return new_paciente

def create_paciente_with_usuario(db: Session, data: PacienteWithUsuario):
    # Crear usuario primero
    nuevo_usuario = UsuarioDB(
        nombre=data.nombre,
        correo=data.correo,
        contrasena=data.contrasena + "#fake",  # Ejemplo simple
        rol=data.rol,
        rut=data.rut
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    # Luego crear paciente usando el usuarioId
    nuevo_paciente = PacienteDB(
        usuarioId=nuevo_usuario.usuarioId,
        edad=data.edad,
        telefono=data.telefono
    )
    db.add(nuevo_paciente)
    db.commit()
    db.refresh(nuevo_paciente)

    return {
        "usuario": nuevo_usuario,
        "paciente": nuevo_paciente
    }

def delete_articulacion(db: Session, articulacion_id: int):
    articulacion = db.query(models.articulacion).filter(models.articulacion.articulacionId == articulacion_id).first()
    if articulacion:
        db.delete(articulacion)
        db.commit()
        return {"message": "Articulación eliminada exitosamente"}
    else:
        return {"error": "Articulación no encontrada"}


def get_pacientes_con_datos_usuario(db: Session):
    return (
        db.query(
            models.paciente.pacienteId,
            models.usuario.nombre,
            models.usuario.rut,
            models.paciente.edad,
            models.paciente.telefono
        )
        .join(models.paciente, models.usuario.usuarioId == models.paciente.usuarioId)
        .filter(models.usuario.rol == "paciente")
        .all()
    )

# ===========================
# ARTICULACION
# ===========================

def create_articulacion(db: Session, articulacion: ArticulacionCreate):
    db_articulacion = models.articulacion(
        nombre=articulacion.nombre,
        imagen_path=articulacion.imagen_path
    )
    db.add(db_articulacion)
    db.commit()
    db.refresh(db_articulacion)
    return db_articulacion

def get_articulaciones(db: Session):
    return db.query(models.articulacion).all()

# ===========================
# MOVIMIENTOS
# ===========================

def get_movimientos(db: Session):
    return db.query(MovimientoDB).all()

def get_movimientos_by_articulacion(db: Session, articulacion_id: int):
    return db.query(models.movimiento).filter(models.movimiento.ArticulacionId == articulacion_id).all()

def create_movimiento(db: Session, movimiento: MovimientoCreate):
    db_movimiento = MovimientoDB(
    ArticulacionId=movimiento.ArticulacionId,  # Asegúrate de usar el nombre correcto
    nombre=movimiento.nombre,
    anguloMinReal=movimiento.anguloMinReal,
    angulaMaxReal=movimiento.angulaMaxReal,
    imagen_path=movimiento.imagen_path,
    descripcion=movimiento.descripcion
    )
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento

def delete_movimiento(db: Session, movimiento_id: int):
    db_movimiento = db.query(models.movimiento).filter(models.movimiento.movimientoId == movimiento_id).first()
    if db_movimiento:
        db.delete(db_movimiento)
        db.commit()
        return db_movimiento
    return None