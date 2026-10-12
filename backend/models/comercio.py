from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


if TYPE_CHECKING:
    from models.pedido import Pedido
    from models.zona import Zona


class Comercio(Base):
    __tablename__ = "comercios"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    nombre: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    categoria: Mapped[str] = mapped_column(
        String(80),
        nullable=False
    )

    direccion: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    zona_id: Mapped[int | None] = mapped_column(
        ForeignKey("zonas.id", name="fk_comercios_zona"),
        nullable=True,
        index=True
    )

    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVO"
    )

    zona: Mapped["Zona | None"] = relationship(
        "Zona"
    )

    pedidos: Mapped[list["Pedido"]] = relationship(
        "Pedido",
        back_populates="comercio"
    )

    disponibilidad_pedidos: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="RECIBIENDO_PEDIDOS",
        server_default="RECIBIENDO_PEDIDOS"
    )