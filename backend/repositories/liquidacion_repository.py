from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from models.liquidacion import Liquidacion


class LiquidacionRepository:

    def __init__(self, db: Session):
        self.db = db

    # =========================
    # BUSCAR POR PERÍODO
    # =========================

    def buscar_por_periodo(
        self,
        consorcio_id: int,
        mes: int,
        anio: int
    ) -> Liquidacion | None:

        return (
            self.db.query(Liquidacion)
            .filter(
                Liquidacion.consorcio_id == consorcio_id,
                Liquidacion.mes == mes,
                Liquidacion.anio == anio
            )
            .first()
        )

    # =========================
    # CREAR LIQUIDACIÓN
    # =========================

    def crear(
        self,
        consorcio_id: int,
        mes: int,
        anio: int,
        total_gastos: Decimal
    ) -> Liquidacion:

        liquidacion = Liquidacion(
            consorcio_id=consorcio_id,
            mes=mes,
            anio=anio,
            total_gastos=total_gastos,
            fecha_generacion=date.today(),
            estado="GENERADA"
        )

        self.db.add(liquidacion)

        # No hacemos commit todavía.
        # El Service generará también las expensas.
        self.db.flush()

        return liquidacion

        # =========================
    # LISTAR POR CONSORCIO
    # =========================

    def listar_por_consorcio(
        self,
        consorcio_id: int
    ) -> list[Liquidacion]:

        return (
            self.db.query(Liquidacion)
            .filter(
                Liquidacion.consorcio_id
                == consorcio_id
            )
            .order_by(
                Liquidacion.anio.desc(),
                Liquidacion.mes.desc()
            )
            .all()
        )

        # =========================
    # BUSCAR POR ID
    # =========================

    def buscar_por_id(
        self,
        liquidacion_id: int
    ) -> Liquidacion | None:

        return (
            self.db.query(Liquidacion)
            .filter(
                Liquidacion.id == liquidacion_id
            )
            .first()
        )