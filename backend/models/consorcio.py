from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Consorcio(Base):
    __tablename__ = "consorcios"

    id: Mapped[int] = mapped_column(primary_key=True)

    nombre: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    direccion: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVO"
    )