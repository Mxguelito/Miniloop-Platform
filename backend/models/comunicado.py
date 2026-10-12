from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Comunicado(Base):
    __tablename__ = "comunicados"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    consorcio_id: Mapped[int] = mapped_column(
        ForeignKey(
            "consorcios.id",
            name="fk_comunicado_consorcio",
        ),
        nullable=False,
    )

    autor_id: Mapped[int] = mapped_column(
        ForeignKey(
            "usuarios.id",
            name="fk_comunicado_autor",
        ),
        nullable=False,
    )

    titulo: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    mensaje: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
    )