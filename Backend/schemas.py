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
    ProfesionalId: int
    fecha: date
    hora: time
    notas: Optional[str]
class SesionCreate(SesionData):
    pass
class Sesion(SesionData):
    sesionId: int 
    class Config:
        orm_mode = True
class SesionOut(BaseModel):
    sesionId: int
    fecha: date
    hora: time
    notas: Optional[str]

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

class ArticulacionOut(BaseModel):
    articulacionId: int
    nombre: str
    imagen_path: Optional[str] = None

    class Config:
        orm_mode = True

# ===========================
# MOVIMIENTO
# ===========================
class MovimientoCreate(BaseModel):
    ArticulacionId: int
    nombre: str
    anguloMinReal: float
    anguloMaxReal: float
    imagen_path: Optional[str] = None 
    descripcion: Optional[str]

class Movimiento(MovimientoCreate):
    movimientoId: int
    class Config:
        orm_mode = True

class MovimientoG(BaseModel):
    movimientoId: int
    nombre: str
    descripcion: Optional[str]
    imagen_path: Optional[str] = None
    anguloMinReal: float
    anguloMaxReal: float

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
    EjercicioId: Optional[int] = None 
    MovimientoId: int
    anguloMin: float
    anguloMax: float
    lado:str
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
    pacienteId: int
    nombre: str
    rut: str
    edad: int
    telefono: int

    class Config:
        orm_mode = True

class ProfesionalWithUsuario(BaseModel):
    nombre: str
    correo: str
    contrasena: str
    rol: str
    especialidad: str
    rut :str


    class Config:
        orm_mode = True

class ProfesionalUsuarioOut(BaseModel):
    profesionalId: int
    nombre: str
    correo: str
    rol: str
    especialidad: str

    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    correo: str
    contrasena: str

class LoginResponse(BaseModel):
    usuarioId: int
    nombre: str
    correo: str
    rol: str
    rut: str

    profesional: Optional[ProfesionalUsuarioOut] = None
    paciente: Optional[PacienteUsuarioOut] = None

    class Config:
        orm_mode = True

class SesionWithMedicion(BaseModel):
    PacienteId: int
    ProfesionalId: int
    fecha: date
    hora: time
    notas: Optional[str] = None

    # Datos de la medición
    EjercicioId: Optional[int] = None
    MovimientoId: int
    anguloMin: float
    anguloMax: float
    lado: str

class SesionConMedicionResponse(BaseModel):
    sesion: Sesion
    medicion: Medicion

    class Config:
        orm_mode = True


class MedicionConSesionCompleta(BaseModel):
    medicionId: int
    anguloMin: float
    anguloMax: float
    lado: str

    movimiento: MovimientoG

    sesion: SesionOut

    paciente: PacienteUsuarioOut
    profesional: ProfesionalUsuarioOut

    class Config:
        orm_mode = True

from typing import List

class MedicionPacienteOut(BaseModel):
    paciente: PacienteUsuarioOut
    mediciones: List[MedicionConSesionCompleta]

    class Config:
        orm_mode = True