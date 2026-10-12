from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(
        primary_key=True,
       
    )

    comercio_id: Mapped[int] = mapped_column(
        ForeignKey("comercios.id"),
        nullable=False
    )

    nombre: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    precio: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    stock: Mapped[int] = mapped_column(
    Integer,
    nullable=False,
    default=0,
    server_default="0"
)

    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVO"
    )