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
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Liquidacion(Base):
    __tablename__ = "liquidaciones"

    __table_args__ = (
        CheckConstraint(
            "mes >= 1 AND mes <= 12",
            name="chk_liquidaciones_mes",
        ),
        CheckConstraint(
            "total_gastos >= 0",
            name="chk_liquidaciones_total",
        ),
        UniqueConstraint(
            "consorcio_id",
            "mes",
            "anio",
            name="uq_liquidacion_periodo",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    consorcio_id: Mapped[int] = mapped_column(
        ForeignKey(
            "consorcios.id",
            name="fk_liquidaciones_consorcio",
        ),
        nullable=False,
        index=True,
    )

    mes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    anio: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    total_gastos: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    fecha_generacion: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="GENERADA",
        server_default="GENERADA",
    )