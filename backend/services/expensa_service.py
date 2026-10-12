from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from datetime import date

from repositories.ingreso_repository import IngresoRepository

from models.expensa import Expensa
from models.usuario import Usuario

from repositories.consorcio_repository import ConsorcioRepository
from repositories.unidad_repository import UnidadRepository
from repositories.expensa_repository import ExpensaRepository

from schemas.expensa import ExpensaCreate


class ExpensaService:

    def __init__(self, db: Session):
        self.db = db

        self.consorcio_repository = ConsorcioRepository(db)
        self.unidad_repository = UnidadRepository(db)
        self.expensa_repository = ExpensaRepository(db)
        self.ingreso_repository = IngresoRepository(db)

    # =========================
    # CREAR EXPENSA MANUAL
    # =========================

    def crear(
        self,
        consorcio_id: int,
        data: ExpensaCreate,
        usuario: Usuario
    ) -> Expensa:

        # =========================
        # 1. VERIFICAR ADMIN
        # =========================

        es_administrador = (
            self.consorcio_repository
            .es_administrador(
                consorcio_id,
                usuario.id
            )
        )

        if not es_administrador:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "No tenés permisos para "
                    "crear expensas"
                )
            )

        # =========================
        # 2. BUSCAR UNIDAD
        # =========================

        unidades = (
            self.unidad_repository
            .listar_por_consorcio(
                consorcio_id
            )
        )

        unidad = next(
            (
                unidad
                for unidad in unidades
                if unidad.id == data.unidad_id
            ),
            None
        )

        if not unidad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "La unidad no pertenece "
                    "al consorcio"
                )
            )

        # =========================
        # 3. EVITAR DUPLICADOS
        # =========================

        existente = (
            self.expensa_repository
            .buscar_por_unidad_periodo(
                unidad_id=data.unidad_id,
                mes=data.mes,
                anio=data.anio
            )
        )

        if existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "La unidad ya tiene una "
                    "expensa para ese período"
                )
            )

        # =========================
        # 4. CREAR EXPENSA
        # =========================

        return self.expensa_repository.crear_manual(
            unidad_id=data.unidad_id,
            mes=data.mes,
            anio=data.anio,
            monto=data.monto
        )

        # =========================
    # LISTAR EXPENSAS POR PERÍODO
    # =========================

    def listar_por_periodo(
        self,
        consorcio_id: int,
        mes: int,
        anio: int,
        usuario: Usuario
    ) -> list[Expensa]:

        # =========================
        # 1. VERIFICAR ADMIN
        # =========================

        es_administrador = (
            self.consorcio_repository
            .es_administrador(
                consorcio_id,
                usuario.id
            )
        )

        if not es_administrador:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "No tenés permisos para "
                    "consultar expensas"
                )
            )
            

        # =========================
        # 2. LISTAR EXPENSAS
        # =========================

        return (
            self.expensa_repository
            .listar_por_consorcio_periodo(
                consorcio_id=consorcio_id,
                mes=mes,
                anio=anio
            )
        )

        # =========================
    # REGISTRAR PAGO
    # =========================

    def registrar_pago(
        self,
        consorcio_id: int,
        expensa_id: int,
        usuario: Usuario
    ) -> Expensa:

        # =========================
        # 1. VERIFICAR ADMIN
        # =========================

        es_administrador = (
            self.consorcio_repository
            .es_administrador(
                consorcio_id,
                usuario.id
            )
        )

        if not es_administrador:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "No tenés permisos para "
                    "registrar pagos"
                )
            )

        # =========================
        # 2. BUSCAR EXPENSA
        # =========================

        expensa = (
            self.expensa_repository
            .buscar_por_id(expensa_id)
        )

        if not expensa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expensa no encontrada"
            )

        # =========================
        # 3. VERIFICAR CONSORCIO
        # =========================

        unidades = (
            self.unidad_repository
            .listar_por_consorcio(
                consorcio_id
            )
        )

        unidad = next(
            (
                unidad
                for unidad in unidades
                if unidad.id == expensa.unidad_id
            ),
            None
        )

        if not unidad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "La expensa no pertenece "
                    "al consorcio"
                )
            )

        # =========================
        # 4. EVITAR DOBLE PAGO
        # =========================

        if expensa.estado == "PAGADA":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "La expensa ya está pagada"
                )
            )

        # =========================
        # 5. REGISTRAR PAGO
        # =========================

        try:

            self.expensa_repository.marcar_pagada(
                expensa
            )

            expensa.fecha_pago = date.today()

            concepto = (
                f"Pago expensa - "
                f"Unidad {unidad.identificador} - "
                f"{expensa.mes}/{expensa.anio}"
            )

            self.ingreso_repository.crear(
                consorcio_id=consorcio_id,
                concepto=concepto,
                monto=expensa.monto,
                fecha=date.today(),
                commit=False
            )

            # =========================
            # 6. CONFIRMAR TODO
            # =========================

            self.db.commit()
            self.db.refresh(expensa)

            return expensa

        except Exception:

            self.db.rollback()
            raise



        # =========================
    # OBTENER COMPROBANTE DE PAGO
    # =========================

    def obtener_comprobante_pago(
        self,
        consorcio_id: int,
        expensa_id: int,
        usuario: Usuario
    ) -> dict:

        # 1. BUSCAR EXPENSA
        expensa = (
            self.expensa_repository
            .buscar_por_id(expensa_id)
        )

        if not expensa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expensa no encontrada"
            )

        # 2. VERIFICAR QUE ESTÉ PAGADA
        if expensa.estado != "PAGADA":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "La expensa todavía no fue pagada"
                )
            )

        # 3. VERIFICAR QUE PERTENEZCA AL CONSORCIO
        unidades = (
            self.unidad_repository
            .listar_por_consorcio(consorcio_id)
        )

        unidad = next(
            (
                unidad
                for unidad in unidades
                if unidad.id == expensa.unidad_id
            ),
            None
        )

        if not unidad:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "La expensa no pertenece "
                    "al consorcio"
                )
            )

        # 4. BUSCAR CONSORCIO
        consorcio = (
            self.consorcio_repository
            .buscar_por_id(consorcio_id)
        )

        if not consorcio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consorcio no encontrado"
            )

        # 5. ARMAR COMPROBANTE
        return {
            "comprobante_id": f"MINILOOP-EXP-{expensa.id}",
            "expensa_id": expensa.id,

            "consorcio_id": consorcio.id,
            "consorcio_nombre": consorcio.nombre,

            "unidad_id": unidad.id,
            "unidad_identificador": unidad.identificador,

            "mes": expensa.mes,
            "anio": expensa.anio,

            "monto": expensa.monto,

            "fecha_pago": expensa.fecha_pago.isoformat(),

            "estado": expensa.estado
        }



        # =========================
    # LISTAR MIS EXPENSAS
    # =========================

    def listar_mis_expensas(
        self,
        consorcio_id: int,
        usuario: Usuario
    ) -> list[Expensa]:

        # =========================
        # 1. VERIFICAR MIEMBRO
        # =========================

        es_miembro = (
            self.consorcio_repository
            .es_miembro(
                consorcio_id,
                usuario.id
            )
        )

        if not es_miembro:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "No pertenecés a este consorcio"
                )
            )

        # =========================
        # 2. OBTENER UNIDAD ASIGNADA
        # =========================

        unidad_id = (
            self.consorcio_repository
            .obtener_unidad_usuario(
                consorcio_id,
                usuario.id
            )
        )

        if not unidad_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "No tenés una unidad asignada"
                )
            )

        # =========================
        # 3. OBTENER EXPENSAS
        # =========================

        return (
            self.expensa_repository
            .listar_por_unidad(
                unidad_id
            )
        )