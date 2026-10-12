from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class UsuarioConsorcio(Base):
    __tablename__ = "usuarios_consorcios"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=False,
    )

    consorcio_id: Mapped[int] = mapped_column(
        ForeignKey("consorcios.id"),
        nullable=False,
    )

    unidad_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "unidades.id",
            name="fk_usuarios_consorcios_unidad",
        ),
        nullable=True,
    )

    rol: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )