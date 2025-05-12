from sqlalchemy.orm import Session
from models import usuario as UsuarioDB  # Asegúrate de que el modelo se llame correctamente
from models import paciente as PacienteDB  # Ajusta el nombre si lo tienes diferente
from models import movimiento as MovimientoDB  # Asegúrate de que el modelo esté correctamente importado
from models import medicion as MedicionDB
from models import sesion as SesionDB
from models import profesional as ProfesionalDB
from schemas import usuarioData, PacienteCreate, PacienteWithUsuario, ArticulacionCreate,MovimientoCreate, Movimiento,MedicionCreate,SesionCreate
from schemas import ProfesionalCreate,ProfesionalWithUsuario
from passlib.context import CryptContext

import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
        rut=usuario.rut 
    )
    db.add(new_usuario)
    db.commit()  # Realiza la transacción
    db.refresh(new_usuario)  # Actualiza el objeto con los datos de la base de datos (por ejemplo, ID generado)
    return new_usuario

# ===========================
# PACIENTE
# ===========================

def create_profesional_with_usuario(db: Session, data: ProfesionalWithUsuario):
    # Crear el usuario primero
    nuevo_usuario = UsuarioDB(
        nombre=data.nombre,
        correo=data.correo,
        contrasena=data.contrasena + "#fake",  # o aplicar hash real
        rol=data.rol,
        rut=data.rut  
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    # Crear profesional vinculado al usuario
    nuevo_profesional = ProfesionalDB(
        usuarioId=nuevo_usuario.usuarioId,
        especialidad=data.especialidad
    )
    db.add(nuevo_profesional)
    db.commit()
    db.refresh(nuevo_profesional)

    return {
        "usuario": nuevo_usuario,
        "profesional": nuevo_profesional
    }

def create_profesional(db: Session, profesional: ProfesionalCreate):
    db_profesional = ProfesionalDB(
        usuarioId=profesional.usuarioId,
        especialidad=profesional.especialidad
    )
    db.add(db_profesional)
    db.commit()
    db.refresh(db_profesional)
    return db_profesional

def get_profesionales(db: Session):
    return db.query(ProfesionalDB).all()

def get_profesional_by_id(db: Session, profesional_id: int):
    return db.query(ProfesionalDB).filter(ProfesionalDB.profesionalId == profesional_id).first()

def delete_profesional(db: Session, profesional_id: int):
    db_profesional = db.query(ProfesionalDB).filter(ProfesionalDB.profesionalId == profesional_id).first()
    if db_profesional:
        db.delete(db_profesional)
        db.commit()
        return db_profesional
    return None

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
    anguloMaxReal=movimiento.anguloMaxReal,
    imagen_path=movimiento.imagen_path,
    descripcion=movimiento.descripcion
    )
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento

def get_movimiento_by_id(db: Session, movimiento_id: int):
    return db.query(MovimientoDB).filter(MovimientoDB.movimientoId == movimiento_id).first()


def delete_movimiento(db: Session, movimiento_id: int):
    db_movimiento = db.query(models.movimiento).filter(models.movimiento.movimientoId == movimiento_id).first()
    if db_movimiento:
        db.delete(db_movimiento)
        db.commit()
        return db_movimiento
    return None

# ===========================
# SESION
# ===========================

def create_sesion(db: Session, sesion: SesionCreate):
    db_sesion = SesionDB(
        PacienteId=sesion.PacienteId,
        ProfesionalId=sesion.ProfecionalId,
        fecha=sesion.fecha,
        hora=sesion.hora,
        notas=sesion.notas
    )
    db.add(db_sesion)
    db.commit()
    db.refresh(db_sesion)
    return db_sesion

def get_sesiones(db: Session):
    return db.query(SesionDB).all()

def get_sesion_by_id(db: Session, sesion_id: int):
    return db.query(SesionDB).filter(SesionDB.sesionId == sesion_id).first()

def delete_sesion(db: Session, sesion_id: int):
    db_sesion = db.query(SesionDB).filter(SesionDB.sesionId == sesion_id).first()
    if db_sesion:
        db.delete(db_sesion)
        db.commit()
        return db_sesion
    return None

# ===========================
# MEDICION
# ===========================

def get_mediciones(db: Session):
    return db.query(models.medicion).all()

def get_medicion_by_id(db: Session, medicion_id: int):
    return db.query(models.medicion).filter(models.medicion.medicionId == medicion_id).first()

def create_medicion(db: Session, medicion: MedicionCreate):
    db_medicion = MedicionDB(
        SesionId=medicion.SesionId,
        EjercicioId=medicion.EjercicioId,
        MovimientoId=medicion.MovimientoId,
        anguloMin=medicion.anguloMin,
        anguloMax=medicion.anguloMax,
        fecha=medicion.fecha
    )
    db.add(db_medicion)
    db.commit()
    db.refresh(db_medicion)
    return db_medicion

def delete_medicion(db: Session, medicion_id: int):
    medicion = db.query(models.medicion).filter(models.medicion.medicionId == medicion_id).first()
    if medicion:
        db.delete(medicion)
        db.commit()
        return {"message": "Medición eliminada correctamente"}
    return {"error": "Medición no encontrada"}

def verificar_login(correo: str, contrasena: str, db: Session):
    # Buscar usuario por correo
    usuario = db.query(UsuarioDB).filter(UsuarioDB.correo == correo).first()

    if not usuario:
        return None  # Usuario no encontrado
    
    # Verificar si la contraseña ingresada coincide con la almacenada (comparación directa en texto plano)
    if contrasena != usuario.contrasena:
        return None  # Contraseña incorrecta

    return usuario  # Usuario encontrado y contraseña correcta
