from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class UsuarioComercio(Base):
    __tablename__ = "usuarios_comercios"

    id: Mapped[int] = mapped_column(primary_key=True)

    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=False
    )

    comercio_id: Mapped[int] = mapped_column(
        ForeignKey("comercios.id"),
        nullable=False
    )

    rol: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )