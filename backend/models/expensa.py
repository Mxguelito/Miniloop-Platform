from datetime import date
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from database import Base


class Expensa(Base):
    __tablename__ = "expensas"

    __table_args__ = (
        UniqueConstraint(
            "liquidacion_id",
            "unidad_id",
            name="uq_expensa_liquidacion_unidad",
        ),
        CheckConstraint(
            "monto >= 0",
            name="chk_expensas_monto",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    # =========================
    # LIQUIDACIÓN
    # =========================

    liquidacion_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "liquidaciones.id",
            name="fk_expensas_liquidacion",
        ),
        nullable=True,
        index=True,
    )

    # =========================
    # UNIDAD
    # =========================

    unidad_id: Mapped[int] = mapped_column(
        ForeignKey(
            "unidades.id",
            name="fk_expensas_unidad",
        ),
        nullable=False,
        index=True,
    )

    unidad = relationship(
        "Unidad"
    )

    # =========================
    # PERÍODO
    # =========================

    mes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    anio: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    # =========================
    # EXPENSA
    # =========================

    monto: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PENDIENTE",
        server_default="PENDIENTE",
    )

    # =========================
    # PAGO
    # =========================

    fecha_pago: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )