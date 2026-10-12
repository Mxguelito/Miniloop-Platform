from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class IncidenciaEntrega(Base):
    __tablename__ = "incidencias_entrega"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    entrega_id: Mapped[int] = mapped_column(
        ForeignKey(
            "entregas.id",
            name="fk_incidencias_entrega_entrega"
        ),
        nullable=False,
        index=True
    )

    usuario_id: Mapped[int] = mapped_column(
        ForeignKey(
            "usuarios.id",
            name="fk_incidencias_entrega_usuario"
        ),
        nullable=False,
        index=True
    )

    tipo: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    descripcion: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ABIERTA",
        server_default="ABIERTA"
    )

    resolucion: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("CURRENT_TIMESTAMP")
    )

    fecha_resolucion: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )