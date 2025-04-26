from pydantic import BaseModel
from typing import Optional
from datetime import date, time

# ===========================
# USUARIO
# ===========================
class usuarioData(BaseModel):
    nombre: str
    correo: str
    contrasena: str
    rol: str

class UsuarioCreate(usuarioData):
    pass
# Esquema para los usuarios que se devuelven
class usuarioData(BaseModel):
    usuarioId: int
    nombre: str
    correo: str
    rol: str
    rut: str  # Si es opcional

    class Config:
        orm_mode = True  # Permite la conversión entre objetos de SQLAlchemy y modelos Pydantic
        
class usuarioId(usuarioData):
    usuarioId: int
    class Config:
        orm_mode = True

# ===========================
# PACIENTE
# ===========================
class PacienteData(BaseModel):
    usuarioId: int
    edad: int
    telefono: int
class PacienteCreate(PacienteData):
    pass
class Paciente(PacienteData):
    pacienteId: int
    class Config:
        orm_mode = True

# ===========================
# PROFESIONAL
# ===========================
class ProfesionalData(BaseModel):
    usuarioId: int
    especialidad: str
class ProfesionalCreate(ProfesionalData):
    pass
class Profesional(ProfesionalData):
    profesionalId: int
    class Config:
        orm_mode = True

# ===========================
# SESION
# ===========================
class SesionData(BaseModel):
    PacienteId: int
    ProfecionalId: int
    fecha: date
    hora: time
    notas: Optional[str]
class SesionCreate(SesionData):
    pass
class Sesion(SesionData):
    sesionId: int 
    class Config:
        orm_mode = True

# ===========================
# ARTICULACION
# ===========================
class ArticulacionData(BaseModel):
    nombre: str
    imagen_path: Optional[str] = None 
class ArticulacionCreate(ArticulacionData):
    pass
class Articulacion(ArticulacionData):
    articulacionId: int
    class Config:
        orm_mode = True

# ===========================
# MOVIMIENTO
# ===========================
class MovimientoData(BaseModel):
    ArticulacionId: int
    nombre: str
    anguloMin: float
    angulaMax: float
    descripcion: Optional[str]
class MovimientoCreate(MovimientoData):
    pass
class Movimiento(MovimientoData):
    movimientoId: int
    class Config:
        orm_mode = True

# ===========================
# EJERCICIO
# ===========================
class EjercicioData(BaseModel):
    MovimientoId: int
    nombre: str
class EjercicioCreate(EjercicioData):
    pass
class Ejercicio(EjercicioData):
    ejercicioId: int
    class Config:
        orm_mode = True

# ===========================
# MEDICION
# ===========================
class MedicionData(BaseModel):
    SesionId: int
    EjercicioId: int
    MovimientoId: int
    anguloReal: float
    fecha: date
class MedicionCreate(MedicionData):
    pass
class Medicion(MedicionData):
    medicionId: int
    class Config:
        orm_mode = True


# ===========================
# OTRO
# ===========================
class PacienteWithUsuario(BaseModel):
    nombre: str
    correo: str
    contrasena: str
    rol: str
    edad: int
    telefono: int
    rut :str

class PacienteUsuarioOut(BaseModel):
    nombre: str
    rut: str
    edad: int
    telefono: int

    class Config:
        orm_mode = True