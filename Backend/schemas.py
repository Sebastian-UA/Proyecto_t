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
class Sesion(SesionData):
    sesionId: int 
    class Config:
        orm_mode = True

# ===========================
# ARTICULACION
# ===========================
class ArticulacionData(BaseModel):
    especialidad: str
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
class Medicion(MedicionData):
    medicionId: int
    class Config:
        orm_mode = True