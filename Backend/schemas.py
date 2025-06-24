from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, time
from datetime import datetime

import re

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
    profesionalId: int 
    edad: int
    telefono: int
    genero: str
class PacienteCreate(PacienteData):
    pass
class Paciente(PacienteData):
    pacienteId: int
    class Config:
        orm_mode = True
        
class PacienteUpdate(BaseModel):
    edad: Optional[int] = None
    telefono: Optional[str] = None
    genero: Optional[str] = None

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
    ProfesionalId: Optional[int] = None
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
    ArticulacionId: int
    artnombre:str

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
    genero: str
    rut :str
    profesionalId: int  

    @field_validator("nombre", "genero")
    @classmethod
    def solo_letras(cls, v, info):
        if not v.replace(" ", "").isalpha():
            raise ValueError(f"{info.field_name.capitalize()} solo debe contener letras")
        return v

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, v):
        if v <= 0 or len(str(v)) > 9:
            raise ValueError("Teléfono debe ser un número positivo de máximo 9 dígitos")
        return v

    @field_validator("edad")
    @classmethod
    def validar_edad(cls, v):
        if v <= 0:
            raise ValueError("Edad debe ser un número positivo")
        return v

    @field_validator("rut")
    @classmethod
    def validar_rut(cls, v):
        if not re.match(r"^\d{7,8}-[\dkK]$", v):
            raise ValueError("Formato de RUT inválido. Ejemplo válido: 12345678-9")
        return v

class PacienteWithUsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    correo: Optional[str] = None
    contrasena: Optional[str] = None
    edad: Optional[int] = None
    telefono: Optional[int] = None
    genero: Optional[str] = None
    rut: Optional[str] = None
    contrasena: Optional[str] = None

    @field_validator("nombre", "genero")
    @classmethod
    def solo_letras(cls, v, info):
        if v is not None and not v.replace(" ", "").isalpha():
            raise ValueError(f"{info.field_name.capitalize()} solo debe contener letras")
        return v

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, v):
        if v is not None and (v <= 0 or len(str(v)) > 9):
            raise ValueError("Teléfono debe ser un número positivo de máximo 9 dígitos")
        return v

    @field_validator("edad")
    @classmethod
    def validar_edad(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Edad debe ser un número positivo")
        return v

    @field_validator("rut")
    @classmethod
    def validar_rut(cls, v):
        if v is not None and not re.match(r"^\d{7,8}-[\dkK]$", v):
            raise ValueError("Formato de RUT inválido. Ejemplo válido: 12345678-9")
        return v

class PacienteUsuarioOut(BaseModel):
    pacienteId: int
    nombre: str
    rut: str
    edad: int
    telefono: int
    genero: str
    correo: str
    profesionalId: Optional[int]

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

    @field_validator("nombre")
    @classmethod
    def solo_letras(cls, v):
        if not v.replace(" ", "").isalpha():
            raise ValueError("Nombre solo debe contener letras")
        return v

    @field_validator("rut")
    @classmethod
    def validar_rut(cls, v):
        if not re.match(r"^\d{7,8}-[\dkK]$", v):
            raise ValueError("Formato de RUT inválido. Ejemplo válido: 12345678-9")
        return v

class ProfesionalUsuarioOut(BaseModel):
    profesionalId: Optional[int] = None
    nombre: Optional[str] = None
    correo: Optional[str] = None
    rol: Optional[str] = None
    especialidad: Optional[str] = None

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
    pacienteId: int
    profesionalId:Optional[int] = None
    fecha: date
    hora: time
    notas: Optional[str] = None

    # Datos de la medición
    ejercicioId: Optional[int] = None
    movimientoId: int
    anguloMin: float
    anguloMax: float
    lado: str

    @field_validator("fecha", mode='before')
    @classmethod
    def parse_fecha(cls, v):
        if isinstance(v, str):
            return datetime.strptime(v, '%Y-%m-%d').date()
        return v

    @field_validator("hora", mode='before')
    @classmethod
    def parse_hora(cls, v):
        if isinstance(v, str):
            return datetime.strptime(v, '%H:%M:%S').time()
        return v

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