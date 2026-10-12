from decimal import Decimal

from sqlalchemy.orm import Session

from models.ganancia_repartidor import GananciaRepartidor


class GananciaRepartidorRepository:

    def __init__(self, db: Session):
        self.db = db

    # =========================
    # CREAR GANANCIA
    # =========================

    def crear(
        self,
        repartidor_id: int,
        entrega_id: int,
        monto: Decimal
    ) -> GananciaRepartidor:

        ganancia = GananciaRepartidor(
            repartidor_id=repartidor_id,
            entrega_id=entrega_id,
            monto=monto
        )

        self.db.add(ganancia)

        # No hacemos commit acá.
        # La entrega y la ganancia deben confirmarse juntas.
        self.db.flush()

        return ganancia

    # =========================
    # BUSCAR POR ENTREGA
    # =========================

    def buscar_por_entrega(
        self,
        entrega_id: int
    ) -> GananciaRepartidor | None:

        return (
            self.db.query(GananciaRepartidor)
            .filter(
                GananciaRepartidor.entrega_id == entrega_id
            )
            .first()
        )

        # =========================
    # LISTAR POR REPARTIDOR
    # =========================

    def listar_por_repartidor(
        self,
        repartidor_id: int
    ) -> list[GananciaRepartidor]:

        return (
            self.db.query(GananciaRepartidor)
            .filter(
                GananciaRepartidor.repartidor_id
                == repartidor_id
            )
            .order_by(
                GananciaRepartidor.fecha_creacion.desc()
            )
            .all()
        )