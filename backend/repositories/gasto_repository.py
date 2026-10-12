from datetime import date
from decimal import Decimal
from sqlalchemy import extract,func

from sqlalchemy.orm import Session

from models.gasto import Gasto


class GastoRepository:

    def __init__(self, db: Session):
        self.db = db

    def crear(
        self,
        consorcio_id: int,
        concepto: str,
        monto: Decimal,
        fecha: date
    ) -> Gasto:

        gasto = Gasto(
            consorcio_id=consorcio_id,
            concepto=concepto,
            monto=monto,
            fecha=fecha
        )

        self.db.add(gasto)
        self.db.commit()
        self.db.refresh(gasto)

        return gasto

    def listar_por_consorcio(
        self,
        consorcio_id: int
    ) -> list[Gasto]:

        return (
            self.db.query(Gasto)
            .filter(
                Gasto.consorcio_id == consorcio_id
            )
            .order_by(Gasto.fecha.desc())
            .all()
        )

    # =========================
# TOTAL DE GASTOS
# =========================

    def obtener_total(
     self,
    consorcio_id: int
    ):
     total = (
        self.db.query(
            func.coalesce(
                func.sum(Gasto.monto),
                0
            )
        )
        .filter(
            Gasto.consorcio_id == consorcio_id
        )
        .scalar()
    )

     return total

    # =========================
# TOTAL DE GASTOS POR PERÍODO
# =========================

    def obtener_total_por_periodo(
    self,
    consorcio_id: int,
    mes: int,
    anio: int
):
     return (
        self.db.query(
            func.coalesce(
                func.sum(Gasto.monto),
                0
            )
        )
        .filter(
            Gasto.consorcio_id == consorcio_id,
            extract("month", Gasto.fecha) == mes,
            extract("year", Gasto.fecha) == anio
        )
        .scalar()
    )