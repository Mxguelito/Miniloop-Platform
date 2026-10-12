from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class GananciaRepartidor(Base):
    __tablename__ = "ganancias_repartidores"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    repartidor_id: Mapped[int] = mapped_column(
        ForeignKey("repartidores.id"),
        nullable=False,
        index=True
    )

    entrega_id: Mapped[int] = mapped_column(
        ForeignKey("entregas.id"),
        nullable=False,
        unique=True,
        index=True
    )

    monto: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )