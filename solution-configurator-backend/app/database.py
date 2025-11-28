from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SSL_CERT_PATH = os.getenv("SSL_CERT_PATH")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in environment variables")

if not SSL_CERT_PATH:
    raise RuntimeError("SSL_CERT_PATH not set in environment variables")

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "sslmode": "verify-full",
        "sslrootcert": SSL_CERT_PATH
    },
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()