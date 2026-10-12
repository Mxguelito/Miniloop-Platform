from sqlalchemy.orm import Session

from models.entrega import Entrega
from models.pedido import Pedido


class EntregaRepository:

    def __init__(self, db: Session):
        self.db = db

    # =========================
    # CREAR ENTREGA
    # =========================

    def crear(
        self,
        pedido_id: int,
        zona_id: int,
        destino: str,
        costo_delivery,
        ganancia_repartidor,
        codigo_llegada: str,
        codigo_retiro: str,
        codigo_final: str,
        codigo_devolucion: str
    ) -> Entrega:

        entrega = Entrega(
            pedido_id=pedido_id,
            zona_id=zona_id,
            destino=destino,
            costo_delivery=costo_delivery,
            ganancia_repartidor=ganancia_repartidor,

            codigo_llegada=codigo_llegada,
            intentos_codigo_llegada=0,

            codigo_retiro=codigo_retiro,
            intentos_codigo_retiro=0,

            codigo_final=codigo_final,
            intentos_codigo_final=0,

            codigo_devolucion=codigo_devolucion,
            intentos_codigo_devolucion=0,

            estado="PENDIENTE"
        )

        self.db.add(entrega)
        self.db.flush()

        return entrega

    # =========================
    # BUSCAR POR ID
    # =========================

    def buscar_por_id(
        self,
        entrega_id: int
    ) -> Entrega | None:

        return (
            self.db.query(Entrega)
            .filter(Entrega.id == entrega_id)
            .first()
        )

    # =========================
    # BUSCAR POR PEDIDO
    # =========================

    def buscar_por_pedido(
        self,
        pedido_id: int
    ) -> Entrega | None:

        return (
            self.db.query(Entrega)
            .filter(Entrega.pedido_id == pedido_id)
            .first()
        )

    # =========================
    # LISTAR PENDIENTES POR ZONA
    # =========================

    def listar_pendientes_por_zona(
        self,
        zona_id: int
    ):

        return (
            self.db.query(Entrega)
            .join(
                Pedido,
                Pedido.id == Entrega.pedido_id
            )
            .filter(
                Entrega.zona_id == zona_id,
                Entrega.estado == "PENDIENTE",
                Entrega.repartidor_id.is_(None),
                Pedido.estado.in_({
                    "PREPARANDO",
                    "LISTO"
                })
            )
            .order_by(Entrega.id.asc())
            .all()
        )

    # =========================
    # TOMAR PARA ACEPTACIÓN
    # =========================

    def buscar_para_aceptar(
        self,
        entrega_id: int
    ) -> Entrega | None:

        return (
            self.db.query(Entrega)
            .filter(
                Entrega.id == entrega_id
            )
            .with_for_update()
            .first()
        )

    # =========================
    # ENTREGA ACTIVA DEL REPARTIDOR
    # =========================

    def buscar_activa_por_repartidor(
        self,
        repartidor_id: int
    ) -> Entrega | None:

        estados_finalizados = {
            "ENTREGADO",
            "CANCELADA",
            "CANCELADO",
            "DEVUELTO",
            "CONVERTIDA_A_RETIRO"
        }

        return (
            self.db.query(Entrega)
            .filter(
                Entrega.repartidor_id == repartidor_id,
                Entrega.estado.notin_(estados_finalizados)
            )
            .order_by(
                Entrega.id.desc()
            )
            .first()
        )

    # =========================
    # TOMAR PARA CONFIRMAR LLEGADA
    # =========================

    def buscar_para_confirmar_llegada(
        self,
        entrega_id: int
    ) -> Entrega | None:

        return (
            self.db.query(Entrega)
            .filter(
                Entrega.id == entrega_id
            )
            .with_for_update()
            .first()
        )

    # =========================
    # TOMAR PARA CONFIRMAR RETIRO
    # =========================

    def buscar_para_confirmar_retiro(
        self,
        entrega_id: int
    ) -> Entrega | None:

        return (
            self.db.query(Entrega)
            .filter(
                Entrega.id == entrega_id
            )
            .with_for_update()
            .first()
        )

    # =========================
    # TOMAR PARA CONFIRMAR ENTREGA FINAL
    # =========================

    def buscar_para_confirmar_final(
        self,
        entrega_id: int
    ) -> Entrega | None:

        return (
            self.db.query(Entrega)
            .filter(
                Entrega.id == entrega_id
            )
            .with_for_update()
            .first()
        )

    # =========================
    # TOMAR PARA LIBERAR ENTREGA
    # =========================

    def buscar_para_liberar(
        self,
        entrega_id: int
    ) -> Entrega | None:

        return (
            self.db.query(Entrega)
            .filter(
                Entrega.id == entrega_id
            )
            .with_for_update()
            .first()
        )

        # =========================
    # TOMAR PARA CONFIRMAR DEVOLUCIÓN
    # =========================

    def buscar_para_confirmar_devolucion(
        self,
        entrega_id: int
    ) -> Entrega | None:

        return (
            self.db.query(Entrega)
            .filter(
                Entrega.id == entrega_id
            )
            .with_for_update()
            .first()
        )

    def buscar_para_regenerar_codigo(
        self,
        entrega_id: int
    ):
        return (
            self.db.query(Entrega)
            .filter(Entrega.id == entrega_id)
            .with_for_update()
            .first()
        )