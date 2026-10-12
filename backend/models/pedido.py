from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


if TYPE_CHECKING:
    from models.comercio import Comercio
    from models.pedido_item import PedidoItem
    from models.usuario import Usuario


class Pedido(Base):
    __tablename__ = "pedidos"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=False
    )

    comercio_id: Mapped[int] = mapped_column(
        ForeignKey("comercios.id"),
        nullable=False
    )

    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PENDIENTE",
        server_default="PENDIENTE"
    )

    tipo_entrega: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="RETIRO",
        server_default="RETIRO"
    )

    total: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0,
        server_default=text("0")
    )

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("CURRENT_TIMESTAMP")
    )

    usuario: Mapped["Usuario"] = relationship(
        "Usuario",
        back_populates="pedidos"
    )

    comercio: Mapped["Comercio"] = relationship(
        "Comercio",
        back_populates="pedidos"
    )

    items: Mapped[list["PedidoItem"]] = relationship(
        "PedidoItem",
        back_populates="pedido",
        cascade="all, delete-orphan"
    )