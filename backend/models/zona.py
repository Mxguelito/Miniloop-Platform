from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Zona(Base):
    __tablename__ = "zonas"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    nombre: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True
    )

    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVA",
        server_default="ACTIVA"
    )