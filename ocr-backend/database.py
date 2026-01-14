import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# Configuration de la base de données
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://etiquettes:etiquettes_secure_pwd@localhost:5432/etiquettes_db"
)

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Modèles SQLAlchemy
class Domain(Base):
    __tablename__ = "domains"
    
    id = Column(Integer, primary_key=True)
    domain_name = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    users = relationship("User", back_populates="domain")


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    domain_id = Column(Integer, ForeignKey("domains.id"))
    full_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    domain = relationship("Domain", back_populates="users")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_or_create_user(email: str, db) -> User:
    """Récupère ou crée un utilisateur basé sur son email"""
    # Vérifier si l'utilisateur existe
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        return user
    
    # Extraire le domaine de l'email
    domain_name = email.split("@")[1]
    
    # Vérifier ou créer le domaine
    domain = db.query(Domain).filter(Domain.domain_name == domain_name).first()
    if not domain:
        domain = Domain(domain_name=domain_name)
        db.add(domain)
        db.commit()
        db.refresh(domain)
    
    # Créer l'utilisateur
    user = User(
        email=email,
        domain_id=domain.id,
        full_name=email.split("@")[0]  # Utiliser la partie avant @ comme nom
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user
