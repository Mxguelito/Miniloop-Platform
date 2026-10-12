from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


if TYPE_CHECKING:
    from models.pedido import Pedido


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    nombre: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVO"
    )

    # =========================
    # ROL GLOBAL DE PLATAFORMA
    # =========================
    #
    # USUARIO:
    # usuario normal de MiniLoop.
    #
    # SUPER_ADMIN:
    # administrador global de la plataforma.
    #
    # Este rol no reemplaza los roles de
    # comercio o repartidor.

    rol_global: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="USUARIO",
        server_default="USUARIO"
    )

    pedidos: Mapped[list["Pedido"]] = relationship(
        "Pedido",
        back_populates="usuario"
    )