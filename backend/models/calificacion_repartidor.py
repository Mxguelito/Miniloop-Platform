from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class CalificacionRepartidor(Base):
    __tablename__ = "calificaciones_repartidores"

    __table_args__ = (
        UniqueConstraint(
            "entrega_id",
            name="uq_calificacion_repartidor_entrega"
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    entrega_id: Mapped[int] = mapped_column(
        ForeignKey("entregas.id"),
        nullable=False,
        index=True
    )

    repartidor_id: Mapped[int] = mapped_column(
        ForeignKey("repartidores.id"),
        nullable=False,
        index=True
    )

    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=False,
        index=True
    )

    puntuacion: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    comentario: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("CURRENT_TIMESTAMP")
    )