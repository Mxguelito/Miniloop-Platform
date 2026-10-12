from decimal import Decimal

from sqlalchemy.orm import Session

from models.expensa import Expensa
from models.unidad import Unidad


class ExpensaRepository:

    def __init__(self, db: Session):
        self.db = db

    

        # =========================
    # CREAR EXPENSA MANUAL
    # =========================

    def crear_manual(
        self,
        unidad_id: int,
        mes: int,
        anio: int,
        monto: Decimal
    ) -> Expensa:

        expensa = Expensa(
            unidad_id=unidad_id,
            mes=mes,
            anio=anio,
            monto=monto,
            estado="PENDIENTE",
            liquidacion_id=None
            
        )

        self.db.add(expensa)
        self.db.commit()
        self.db.refresh(expensa)

        return expensa

        # =========================
    # BUSCAR POR UNIDAD Y PERÍODO
    # =========================

    def buscar_por_unidad_periodo(
        self,
        unidad_id: int,
        mes: int,
        anio: int
    ) -> Expensa | None:

        return (
            self.db.query(Expensa)
            .filter(
                Expensa.unidad_id == unidad_id,
                Expensa.mes == mes,
                Expensa.anio == anio
            )
            .first()
        )

        # =========================
    # LISTAR POR CONSORCIO Y PERÍODO
    # =========================

    def listar_por_consorcio_periodo(
        self,
        consorcio_id: int,
        mes: int,
        anio: int
    ) -> list[Expensa]:

        return (
            self.db.query(Expensa)
            .join(
                Unidad,
                Expensa.unidad_id == Unidad.id
            )
            .filter(
                Unidad.consorcio_id == consorcio_id,
                Expensa.mes == mes,
                Expensa.anio == anio
            )
            .order_by(
                Unidad.identificador.asc()
            )
            .all()
        )

        # =========================
    # BUSCAR POR ID
    # =========================

    def buscar_por_id(
        self,
        expensa_id: int
    ) -> Expensa | None:

        return (
            self.db.query(Expensa)
            .filter(
                Expensa.id == expensa_id
            )
            .first()
        )


    # =========================
    # MARCAR COMO PAGADA
    # =========================

    def marcar_pagada(
        self,
        expensa: Expensa
    ) -> Expensa:

        expensa.estado = "PAGADA"

        self.db.flush()

        return expensa

    # =========================
    # LISTAR POR LIQUIDACIÓN
    # =========================

    def listar_por_liquidacion(
        self,
        liquidacion_id: int
    ) -> list[Expensa]:

        return (
            self.db.query(Expensa)
            .filter(
                Expensa.liquidacion_id
                == liquidacion_id
            )
            .order_by(Expensa.unidad_id.asc())
            .all()
        )

    # =========================
# LISTAR POR UNIDAD
# =========================

    def listar_por_unidad(
    self,
    unidad_id: int
    ) -> list[Expensa]:

     return (
        self.db.query(Expensa)
        .filter(
            Expensa.unidad_id == unidad_id
        )
        .order_by(
            Expensa.id.desc()
        )
        .all()
    )