from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import func

from models.ingreso import Ingreso


class IngresoRepository:

    def __init__(self, db: Session):
        self.db = db

        # =========================
    # REGISTRAR INGRESO
    # =========================

    def crear(
        self,
        consorcio_id: int,
        concepto: str,
        monto: Decimal,
        fecha: date,
        commit: bool = True
    ) -> Ingreso:

        ingreso = Ingreso(
            consorcio_id=consorcio_id,
            concepto=concepto,
            monto=monto,
            fecha=fecha
        )

        self.db.add(ingreso)

        if commit:
            self.db.commit()
            self.db.refresh(ingreso)
        else:
            self.db.flush()

        return ingreso

    # =========================
    # LISTAR INGRESOS
    # =========================

    def listar_por_consorcio(
        self,
        consorcio_id: int
    ) -> list[Ingreso]:

        return (
            self.db.query(Ingreso)
            .filter(
                Ingreso.consorcio_id == consorcio_id
            )
            .order_by(Ingreso.fecha.desc())
            .all()
        )

    # =========================
# TOTAL DE INGRESOS
# =========================

    def obtener_total(
           self,
           consorcio_id: int
           ):
      total = (
        self.db.query(
            func.coalesce(
                func.sum(Ingreso.monto),
                0
            )
        )
        .filter(
            Ingreso.consorcio_id == consorcio_id
        )
        .scalar()
    )

      return total