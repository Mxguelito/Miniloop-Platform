from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Gasto(Base):
    __tablename__ = "gastos"

    id: Mapped[int] = mapped_column(
        primary_key=True,

    )

    consorcio_id: Mapped[int] = mapped_column(
    ForeignKey(
        "consorcios.id",
        name="fk_gastos_consorcio",
        ondelete="CASCADE"
    ),
    nullable=False,
    index=True
    )

    concepto: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    monto: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    fecha: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )