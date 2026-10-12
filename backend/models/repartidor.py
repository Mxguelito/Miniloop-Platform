from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


if TYPE_CHECKING:
    from models.usuario import Usuario
    from models.zona import Zona


class Repartidor(Base):

    __tablename__ = "repartidores"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    usuario_id: Mapped[int] = mapped_column(
        ForeignKey(
            "usuarios.id",
            name="fk_repartidores_usuario"
        ),
        nullable=False,
        unique=True
    )

    zona_id: Mapped[int] = mapped_column(
        ForeignKey(
            "zonas.id",
            name="fk_repartidores_zona"
        ),
        nullable=False,
        index=True
    )

    transporte: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    disponibilidad: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="NO_DISPONIBLE",
        server_default="NO_DISPONIBLE"
    )

    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVO",
        server_default="ACTIVO"
    )

    # =========================
    # BONO DELIVERY
    # =========================

    bono_pendiente: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=Decimal("0.00"),
        server_default="0.00"
    )

    usuario: Mapped["Usuario"] = relationship(
        "Usuario"
    )

    zona: Mapped["Zona"] = relationship(
        "Zona"
    )