from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

URL_CONNECTION='mysql+pymysql://root:12345678@localhost:3306/gonio'
# = "mysql+mysqlconnector://usuario:password@localhost/nombre_base_datos"

engine = create_engine(URL_CONNECTION)

localSession = sessionmaker(autoflush=False, autocommit=False, bind=engine)

Base = declarative_base()