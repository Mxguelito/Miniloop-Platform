from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Entrega(Base):

    __tablename__ = "entregas"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    # Un pedido puede tener una sola entrega
    pedido_id: Mapped[int] = mapped_column(
        ForeignKey(
            "pedidos.id",
            name="fk_entregas_pedido"
        ),
        nullable=False,
        unique=True
    )

    # Puede estar sin repartidor mientras espera aceptación
    repartidor_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "repartidores.id",
            name="fk_entregas_repartidor"
        ),
        nullable=True,
        index=True
    )

    zona_id: Mapped[int] = mapped_column(
        ForeignKey(
            "zonas.id",
            name="fk_entregas_zona"
        ),
        nullable=False,
        index=True
    )

    # =========================
    # ESTADO
    # =========================

    estado: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="PENDIENTE",
        server_default="PENDIENTE"
    )

    # Dirección histórica del pedido
    destino: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # =========================
    # ECONOMÍA
    # =========================

    # Precio histórico cobrado al cliente
    costo_delivery: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0,
        server_default=text("0")
    )

    # Ganancia histórica del repartidor
    ganancia_repartidor: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0,
        server_default=text("0")
    )

    # =========================
    # LIBERACIONES
    # =========================

    cantidad_liberaciones: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0")
    )

    motivo_ultima_liberacion: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    # =========================
    # CÓDIGO DE LLEGADA
    # =========================

    codigo_llegada: Mapped[str | None] = mapped_column(
        String(6),
        nullable=True
    )

    intentos_codigo_llegada: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0")
    )

    # =========================
    # CÓDIGO DE RETIRO
    # =========================

    codigo_retiro: Mapped[str | None] = mapped_column(
        String(6),
        nullable=True
    )

    intentos_codigo_retiro: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0")
    )

    # =========================
    # CÓDIGO FINAL
    # =========================

    codigo_final: Mapped[str | None] = mapped_column(
        String(6),
        nullable=True
    )

    intentos_codigo_final: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0")
    )

    # =========================
    # CÓDIGO DE DEVOLUCIÓN
    # =========================

    codigo_devolucion: Mapped[str | None] = mapped_column(
        String(6),
        nullable=True
    )

    intentos_codigo_devolucion: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0")
    )

    # =========================
    # FECHAS / TRAZABILIDAD
    # =========================

        # =========================
    # EXTENSIÓN DE LLEGADA
    # =========================

    # Indica si el repartidor ya utilizó
    # su única extensión de 15 minutos
    # para llegar al comercio.
    extension_llegada_usada: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0")
    )

    # Momento en que se crea la entrega.
    # Todavía puede no estar publicada.
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("CURRENT_TIMESTAMP")
    )

    # Momento en que la entrega se publica
    # para que los repartidores puedan aceptarla.
    #
    # NULL significa que todavía no comenzó
    # la ventana de aceptación.
    fecha_publicacion: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Momento en que un repartidor acepta la entrega
    fecha_asignacion: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Momento en que el repartidor informa
    # que llegó al comercio
    fecha_llegada_comercio: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Momento en que el comercio confirma la llegada
    fecha_llegada_confirmada: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Momento en que el comercio entrega
    # físicamente el pedido
    fecha_retiro: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Momento en que el repartidor
    # comienza el viaje al cliente
    fecha_en_camino: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Momento en que el repartidor
    # llega al destino
    fecha_llegada_cliente: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Momento en que la entrega
    # termina correctamente
    fecha_entregado: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )