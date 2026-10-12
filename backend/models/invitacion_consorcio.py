from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class InvitacionConsorcio(Base):
    __tablename__ = "invitaciones_consorcios"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    consorcio_id: Mapped[int] = mapped_column(
        ForeignKey(
            "consorcios.id",
            name="fk_invitacion_consorcio",
        ),
        nullable=False,
    )

    creada_por: Mapped[int] = mapped_column(
        ForeignKey(
            "usuarios.id",
            name="fk_invitacion_usuario",
        ),
        nullable=False,
    )

    codigo: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
    )

    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVA",
        server_default="ACTIVA",
    )

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
        server_default=text("CURRENT_TIMESTAMP"),
    )