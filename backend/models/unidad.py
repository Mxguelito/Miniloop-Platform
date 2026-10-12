from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Unidad(Base):
    __tablename__ = "unidades"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    consorcio_id: Mapped[int] = mapped_column(
        ForeignKey(
            "consorcios.id",
            name="fk_unidades_consorcio",
        ),
        nullable=False,
        index=True,
    )

    identificador: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    metros_cuadrados: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )