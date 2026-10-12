from sqlalchemy.orm import Session, selectinload

from models.pedido import Pedido
from models.pedido_item import PedidoItem


class PedidoRepository:

    def __init__(self, db: Session):
        self.db = db

    # =========================
    # CREAR PEDIDO
    # =========================

    def crear_pedido(
        self,
        usuario_id: int,
        comercio_id: int,
        tipo_entrega: str
    ) -> Pedido:

        pedido = Pedido(
            usuario_id=usuario_id,
            comercio_id=comercio_id,
            tipo_entrega=tipo_entrega,
            estado="PENDIENTE",
            total=0
        )

        self.db.add(pedido)
        self.db.flush()

        return pedido

    # =========================
    # CREAR ITEM
    # =========================

    def crear_item(
        self,
        pedido_id: int,
        producto_id: int,
        cantidad: int,
        precio_unitario,
        subtotal
    ) -> PedidoItem:

        item = PedidoItem(
            pedido_id=pedido_id,
            producto_id=producto_id,
            cantidad=cantidad,
            precio_unitario=precio_unitario,
            subtotal=subtotal
        )

        self.db.add(item)

        return item

    # =========================
    # BUSCAR PEDIDO COMPLETO
    # =========================

    def buscar_por_id(
        self,
        pedido_id: int
    ) -> Pedido | None:

        return (
            self.db.query(Pedido)
            .options(
                selectinload(Pedido.usuario),
                selectinload(Pedido.comercio),
                selectinload(Pedido.items)
                .selectinload(PedidoItem.producto)
            )
            .filter(Pedido.id == pedido_id)
            .first()
        )

    # =========================
    # PEDIDOS DEL CLIENTE
    # =========================

    def listar_por_usuario(
        self,
        usuario_id: int
    ) -> list[Pedido]:

        return (
            self.db.query(Pedido)
            .options(
                selectinload(Pedido.usuario),
                selectinload(Pedido.comercio)
            )
            .filter(
                Pedido.usuario_id == usuario_id
            )
            .order_by(
                Pedido.id.desc()
            )
            .all()
        )

    # =========================
    # PEDIDOS DEL COMERCIO
    # =========================

    def listar_por_comercio(
        self,
        comercio_id: int
    ) -> list[Pedido]:

        return (
            self.db.query(Pedido)
            .options(
                selectinload(Pedido.usuario),
                selectinload(Pedido.comercio)
            )
            .filter(
                Pedido.comercio_id == comercio_id
            )
            .order_by(
                Pedido.id.desc()
            )
            .all()
        )

    # =========================
    # GUARDAR CAMBIOS
    # =========================

    def guardar(self):
        self.db.commit()