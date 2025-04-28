from sqlalchemy import Column, String, Integer,ForeignKey,Date,Time,Text,Float

from database import Base

class usuario(Base):
    __tablename__ ='usuario'
    usuarioId = Column(Integer, primary_key=True, index=True)
    nombre= Column(String(300), index=True)
    correo= Column(String(200), index=True, unique=True)
    contrasena = Column(String(30), index = True)
    rol= Column(String(30), index=True)
    rut= Column(String(30), index = True, unique=True)


class paciente(Base):
    __tablename__ ='paciente'
    pacienteId = Column(Integer, primary_key=True, index=True)
    usuarioId = Column(Integer, ForeignKey("usuario.usuarioId"), index=True)
    edad= Column(Integer, index=True)
    telefono= Column(Integer, index=True)

class profesional(Base):
    __tablename__ ='profesional'
    profesionalId = Column(Integer, primary_key=True, index=True)
    usuarioId = Column(Integer, ForeignKey("usuario.usuarioId"), index=True)
    especialidad= Column(String(30), index=True, unique=True)

class sesion(Base):
    __tablename__ ='sesion'
    sesionId = Column(Integer, primary_key=True, index=True)
    PacienteId = Column(Integer, ForeignKey("paciente.pacienteId"), index=True)
    ProfesionalId = Column(Integer, ForeignKey("profesional.profesionalId"), index=True)
    fecha= Column(Date, index=True)
    hora= Column(Time, index=True)
    notas= Column(Text)

class articulacion(Base):
    __tablename__ ='articulacion'
    articulacionId = Column(Integer, primary_key=True, index=True)
    nombre= Column(String(30), index=True)
    imagen_path = Column(String(255), nullable=True) 


class movimiento(Base):
    __tablename__ ='movimiento'
    movimientoId = Column(Integer, primary_key=True, index=True)
    ArticulacionId = Column(Integer, ForeignKey("articulacion.articulacionId"), index=True)
    nombre= Column(String(100), index=True)
    anguloMinReal= Column(Float, index=True)
    angulaMaxReal= Column(Float, index=True)
    descripcion= Column(Text)
    imagen_path = Column(String(255), nullable=True) 


class ejercicio(Base):
    __tablename__ ='ejercicio'
    ejercicioId = Column(Integer, primary_key=True, index=True)
    MovimientoId = Column(Integer, ForeignKey("movimiento.movimientoId"), index=True)
    nombre= Column(String(100), index=True)

class medicion(Base):
    __tablename__ ='medicion'
    medicionId = Column(Integer, primary_key=True, index=True)
    SesionId = Column(Integer, ForeignKey("sesion.sesionId"), index=True)
    EjercicioId = Column(Integer, ForeignKey("ejercicio.ejercicioId"), index=True)
    MovimientoId = Column(Integer, ForeignKey("movimiento.movimientoId"), index=True)
    anguloMin= Column(Float, index=True)
    angulaMax= Column(Float, index=True)
    fecha= Column(Date, index=True)
