"""
SQLAlchemy declarative base. All models import Base from here so Alembic's
autogenerate can discover them via a single metadata object.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass