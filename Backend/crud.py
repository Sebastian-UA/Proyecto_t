from sqlalchemy.orm import Session
from models import usuario as UsuarioDB  # Asegúrate de que el modelo se llame correctamente
from models import paciente as PacienteDB  # Ajusta el nombre si lo tienes diferente
from models import movimiento as MovimientoDB  # Asegúrate de que el modelo esté correctamente importado
from models import medicion as MedicionDB
from models import sesion as SesionDB
from models import profesional as ProfesionalDB
from schemas import usuarioData, PacienteCreate, PacienteWithUsuario, ArticulacionCreate,MovimientoCreate, Movimiento,MedicionCreate,SesionCreate
from schemas import ProfesionalCreate,ProfesionalWithUsuario,SesionWithMedicion,ProfesionalUsuarioOut,PacienteUsuarioOut,PacienteUpdate,PacienteWithUsuarioUpdate
from passlib.context import CryptContext
from typing import Optional
from sqlalchemy.orm import aliased

import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ===========================
# USUARIO
# ===========================
usuario_paciente = aliased(UsuarioDB)
usuario_profesional = aliased(UsuarioDB)


def get_usuario(db: Session):
    return db.query(UsuarioDB).all()

def get_usuario_id(db: Session, id: int):
    return db.query(UsuarioDB).filter(UsuarioDB.usuarioId == id).first()

def create_usuario(db: Session, usuario: usuarioData):
    fake_password = usuario.contrasena, # Añadimos el sufijo a la contraseña
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

def update_paciente(db: Session, paciente_id: int, paciente_update: PacienteUpdate):
    db_paciente = db.query(PacienteDB).filter(PacienteDB.pacienteId == paciente_id).first()
    if not db_paciente:
        return None

    if paciente_update.edad is not None:
        db_paciente.edad = paciente_update.edad
    if paciente_update.telefono is not None:
        db_paciente.telefono = paciente_update.telefono
    if paciente_update.genero is not None:
        db_paciente.genero = paciente_update.genero

    db.commit()
    db.refresh(db_paciente)
    return db_paciente


# ===========================
# PROFESIONAL
# ===========================

def create_profesional_with_usuario(db: Session, data: ProfesionalWithUsuario):
    # Crear el usuario primero
    nuevo_usuario = UsuarioDB(
        nombre=data.nombre,
        correo=data.correo,
        contrasena=data.contrasena, # o aplicar hash real
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
        telefono=paciente.telefono,
        genero=paciente.genero
    )
    db.add(new_paciente)
    db.commit()
    db.refresh(new_paciente)
    return new_paciente

def update_paciente_with_usuario(db: Session, paciente_id: int, data: PacienteWithUsuarioUpdate):
    paciente = db.query(PacienteDB).filter(PacienteDB.pacienteId == paciente_id).first()
    if not paciente:
        return None

    usuario = db.query(UsuarioDB).filter(UsuarioDB.usuarioId == paciente.usuarioId).first()
    if not usuario:
        return None

    # Actualizar campos del usuario
    if data.nombre is not None:
        usuario.nombre = data.nombre
    if data.correo is not None:
        usuario.correo = data.correo
    if data.rut is not None:
        usuario.rut = data.rut
    if data.contrasena is not None:
        usuario.contrasena = data.contrasena

    # Actualizar campos del paciente
    if data.edad is not None:
        paciente.edad = data.edad
    if data.telefono is not None:
        paciente.telefono = data.telefono
    if data.genero is not None:
        paciente.genero = data.genero

    db.commit()
    db.refresh(paciente)
    db.refresh(usuario)

    # Retornar el esquema que espera FastAPI
    return PacienteUsuarioOut(
        pacienteId=paciente.pacienteId,
        nombre=usuario.nombre,
        rut=usuario.rut,
        correo=usuario.correo,
        edad=paciente.edad,
        telefono=paciente.telefono,
        genero=paciente.genero,
        profesionalId=paciente.profesionalId 
    )


def create_paciente_with_usuario(db: Session, data: PacienteWithUsuario):
    # Crear usuario primero
    nuevo_usuario = UsuarioDB(
        nombre=data.nombre,
        correo=data.correo,
        contrasena=data.contrasena ,  # Ejemplo simple
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
        telefono=data.telefono,
        genero=data.genero,
        profesionalId=data.profesionalId
    )
    db.add(nuevo_paciente)
    db.commit()
    db.refresh(nuevo_paciente)

    return {
        "usuario": nuevo_usuario,
        "paciente": nuevo_paciente
    }


def get_pacientes_por_profesional_con_usuario(db: Session, profesional_id: int):
    return (
        db.query(
            PacienteDB.pacienteId,
            UsuarioDB.nombre,
            UsuarioDB.rut,
            UsuarioDB.correo,
            PacienteDB.edad,
            PacienteDB.telefono,
            PacienteDB.genero
        )
        .join(UsuarioDB, UsuarioDB.usuarioId == PacienteDB.usuarioId)
        .filter(PacienteDB.profesionalId == profesional_id)
        .all()
    )

def delete_articulacion(db: Session, articulacion_id: int):
    articulacion = db.query(models.articulacion).filter(models.articulacion.articulacionId == articulacion_id).first()
    if articulacion:
        db.delete(articulacion)
        db.commit()
        return {"message": "Articulación eliminada exitosamente"}
    else:
        return {"error": "Articulación no encontrada"}

def get_pacientes_por_profesional(db: Session, profesional_id: int):
    resultados = (
        db.query(
            models.paciente.pacienteId,
            models.usuario.nombre,
            models.usuario.rut,
            models.usuario.correo,
            models.paciente.edad,
            models.paciente.telefono,
            models.paciente.genero,
            models.paciente.profesionalId,
        )
        .join(models.usuario, models.usuario.usuarioId == models.paciente.usuarioId)
        .filter(models.paciente.profesionalId == profesional_id)
        .filter(models.usuario.rol == "paciente")
        .all()
    )
    
    # convertir tuplas a dicts para que FastAPI pueda serializar
    pacientes = []
    for r in resultados:
        paciente = {
            "pacienteId": r.pacienteId,
            "nombre": r.nombre,
            "rut": r.rut,
            "correo": r.correo,
            "edad": r.edad,
            "telefono": r.telefono,
            "genero": r.genero,
            "profesionalId": r.profesionalId,
        }
        pacientes.append(paciente)
    return pacientes



def get_pacientes_con_datos_usuario(db: Session):
    return (
        db.query(
            models.paciente.pacienteId,
            models.usuario.nombre,
            models.usuario.rut,
            models.usuario.correo,
            models.paciente.edad,
            models.paciente.telefono,
            models.paciente.genero,
            models.paciente.profesionalId
        )
        .join(models.paciente, models.usuario.usuarioId == models.paciente.usuarioId)
        .filter(models.usuario.rol == "paciente")
        .all()
    )

def get_paciente_con_datos_usuario_por_id(db: Session, paciente_id: int):
    result = (
        db.query(
            models.paciente.pacienteId.label("pacienteId"),
            models.usuario.nombre.label("nombre"),
            models.usuario.rut.label("rut"),
            models.usuario.correo.label("correo"),
            models.paciente.edad.label("edad"),
            models.paciente.telefono.label("telefono"),
            models.paciente.genero.label("genero"),
            models.paciente.profesionalId.label("profesionalId"),
        )
        .join(models.usuario, models.usuario.usuarioId == models.paciente.usuarioId)
        .filter(models.paciente.pacienteId == paciente_id)
        .first()
    )

    if result is None:
        return None

    return dict(result._mapping)



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
        ProfesionalId=sesion.ProfesionalId,
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

def get_profesional_by_usuario_id(db: Session, usuario_id: int):
    return db.query(models.profesional).filter(models.profesional.usuarioId == usuario_id).first()

def get_paciente_by_usuario_id(db: Session, usuario_id: int):
    return db.query(models.paciente).filter(models.paciente.usuarioId == usuario_id).first()


def verificar_login_con_rol(correo: str, contrasena: str, db: Session) -> Optional[dict]:
    # Buscar usuario por correo
    usuario = db.query(UsuarioDB).filter(UsuarioDB.correo == correo).first()
    if not usuario:
        return None  # Usuario no encontrado
    
    # Validar contraseña (aquí comparación simple, mejor usar hash)
    if contrasena != usuario.contrasena:
        return None  # Contraseña incorrecta

    # Según el rol, buscar datos relacionados
    profesional = None
    paciente = None

    if usuario.rol == "profesional":
        profesional_db = db.query(ProfesionalDB).filter(ProfesionalDB.usuarioId == usuario.usuarioId).first()
        if profesional_db:
            profesional = ProfesionalUsuarioOut(
                profesionalId=profesional_db.profesionalId,
                nombre=usuario.nombre,
                correo=usuario.correo,
                rol=usuario.rol,
                especialidad=profesional_db.especialidad
            )
    elif usuario.rol == "paciente":
        paciente_db = db.query(PacienteDB).filter(PacienteDB.usuarioId == usuario.usuarioId).first()
        if paciente_db:
            paciente = PacienteUsuarioOut(
                pacienteId=paciente_db.pacienteId,
                nombre=usuario.nombre,
                rut=usuario.rut,
                correo=usuario.correo,
                edad=paciente_db.edad,
                telefono=paciente_db.telefono,
                genero=paciente_db.genero
            )
    
    # Construir dict con datos del usuario y datos rol
    return {
        "usuarioId": usuario.usuarioId,
        "nombre": usuario.nombre,
        "correo": usuario.correo,
        "rol": usuario.rol,
        "rut": usuario.rut,
        "profesional": profesional,
        "paciente": paciente
    }
def create_sesion_with_medicion(db: Session, data: SesionWithMedicion):
    # 1. Crear sesión
    nueva_sesion = SesionDB(
        PacienteId=data.pacienteId,
        ProfesionalId=data.profesionalId,
        fecha=data.fecha,
        hora=data.hora,
        notas=data.notas,
    )
    db.add(nueva_sesion)
    db.commit()
    db.refresh(nueva_sesion)

    # 2. Crear medición asociada
    nueva_medicion = MedicionDB(
        SesionId=nueva_sesion.sesionId,
        EjercicioId=data.ejercicioId,
        MovimientoId=data.movimientoId,
        anguloMin=data.anguloMin,
        anguloMax=data.anguloMax,
        lado=data.lado,
    )
    db.add(nueva_medicion)
    db.commit()
    db.refresh(nueva_medicion)

    return {
        "sesion": nueva_sesion,
        "medicion": nueva_medicion
    }

def get_medicion_completa(db: Session, medicion_id: int):
    # 1. Obtener la medición
    medicion = db.query(MedicionDB).filter(MedicionDB.medicionId == medicion_id).first()
    if not medicion:
        return None

    # 2. Obtener la sesión relacionada
    sesion = db.query(SesionDB).filter(SesionDB.sesionId == medicion.SesionId).first()
    if not sesion:
        return None

    # 3. Obtener el paciente
    paciente = db.query(PacienteDB).filter(PacienteDB.pacienteId == sesion.PacienteId).first()
    usuario_paciente = db.query(UsuarioDB).filter(UsuarioDB.usuarioId == paciente.usuarioId).first()

    # 4. Obtener el profesional
    profesional = db.query(ProfesionalDB).filter(ProfesionalDB.profesionalId == sesion.ProfesionalId).first()
    usuario_profesional = db.query(UsuarioDB).filter(UsuarioDB.usuarioId == profesional.usuarioId).first()

    return {
        "medicionId": medicion.medicionId,
        "anguloMin": medicion.anguloMin,
        "anguloMax": medicion.anguloMax,
        "lado": medicion.lado,
        "MovimientoId": medicion.MovimientoId,
        "EjercicioId": medicion.EjercicioId,

        "sesionId": sesion.sesionId,
        "fecha": sesion.fecha,
        "hora": sesion.hora,
        "notas": sesion.notas,

        "paciente": {
            "pacienteId": paciente.pacienteId,
            "nombre": usuario_paciente.nombre,
            "rut": usuario_paciente.rut,
            "edad": paciente.edad,
            "telefono": paciente.telefono,
            "genero":paciente.genero
        },
        "profesional": {
            "profesionalId": profesional.profesionalId,
            "nombre": usuario_profesional.nombre,
            "correo": usuario_profesional.correo,
            "rol": usuario_profesional.rol,
            "especialidad": profesional.especialidad
        }
    }

def get_mediciones_por_paciente_completas(db: Session, paciente_id: int):
    usuario_paciente = aliased(UsuarioDB)
    usuario_profesional = aliased(UsuarioDB)

    resultados = (
        db.query(
            MedicionDB,
            SesionDB,
            PacienteDB,
            usuario_paciente,
            ProfesionalDB,
            usuario_profesional,
            MovimientoDB,
            models.articulacion
        )
        .join(SesionDB, MedicionDB.SesionId == SesionDB.sesionId)
        .join(PacienteDB, SesionDB.PacienteId == PacienteDB.pacienteId)
        .join(usuario_paciente, PacienteDB.usuarioId == usuario_paciente.usuarioId)
        .outerjoin(ProfesionalDB, SesionDB.ProfesionalId == ProfesionalDB.profesionalId)
        .outerjoin(usuario_profesional, ProfesionalDB.usuarioId == usuario_profesional.usuarioId)
        .join(MovimientoDB, MedicionDB.MovimientoId == MovimientoDB.movimientoId)
        .join(models.articulacion, MovimientoDB.ArticulacionId == models.articulacion.articulacionId)
        .filter(PacienteDB.pacienteId == paciente_id)
        .all()
    )

    resultados_formateados = []

    for medicion, sesion, paciente, usuario_paciente, profesional, usuario_profesional, movimiento, articulacion in resultados:
        resultados_formateados.append({
            "medicionId": medicion.medicionId,
            "anguloMin": medicion.anguloMin,
            "anguloMax": medicion.anguloMax,
            "lado": medicion.lado,
            "MovimientoId": medicion.MovimientoId,
            "EjercicioId": medicion.EjercicioId,

            "sesion": {
                "sesionId": sesion.sesionId,
                "fecha": sesion.fecha,
                "hora": sesion.hora,
                "notas": sesion.notas,
            },

            "paciente": {
                "pacienteId": paciente.pacienteId,
                "nombre": usuario_paciente.nombre,
                "rut": usuario_paciente.rut,
                "edad": paciente.edad,
                "telefono": paciente.telefono,
                "genero":paciente.genero,
                "correo": usuario_paciente.correo,
                "profesionalId": paciente.profesionalId,
            },

            "profesional": {
                "profesionalId": profesional.profesionalId if profesional else None,
                "nombre": usuario_profesional.nombre if usuario_profesional else None,
                "correo": usuario_profesional.correo if usuario_profesional else None,
                "rol": usuario_profesional.rol if usuario_profesional else None,
                "especialidad": profesional.especialidad if profesional else None,
            },

            "movimiento": {
                "movimientoId": movimiento.movimientoId,
                "nombre": movimiento.nombre,
                "descripcion": movimiento.descripcion,
                "anguloMinReal": movimiento.anguloMinReal,
                "anguloMaxReal": movimiento.anguloMaxReal,
                "imagen_path": movimiento.imagen_path,
                "ArticulacionId": articulacion.articulacionId,
                "artnombre":articulacion.nombre,
            }
        })

    return resultados_formateados
