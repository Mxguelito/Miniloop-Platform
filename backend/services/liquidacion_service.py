from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.liquidacion import Liquidacion
from models.usuario import Usuario

from repositories.consorcio_repository import (
    ConsorcioRepository
)
from repositories.unidad_repository import (
    UnidadRepository
)
from repositories.liquidacion_repository import (
    LiquidacionRepository
)
from repositories.expensa_repository import (
    ExpensaRepository
)

from schemas.liquidacion import LiquidacionCreate


class LiquidacionService:

    def __init__(self, db: Session):
        self.db = db

        self.consorcio_repository = (
            ConsorcioRepository(db)
        )

        self.unidad_repository = (
            UnidadRepository(db)
        )

        self.liquidacion_repository = (
            LiquidacionRepository(db)
        )

        self.expensa_repository = (
            ExpensaRepository(db)
        )

    # =========================
    # GENERAR LIQUIDACIÓN
    # =========================

    def generar(
        self,
        consorcio_id: int,
        data: LiquidacionCreate,
        usuario: Usuario
    ) -> Liquidacion:

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
                    "No tenés permisos para generar "
                    "liquidaciones"
                )
            )

        # =========================
        # 2. EVITAR DUPLICADOS
        # =========================

        existente = (
            self.liquidacion_repository
            .buscar_por_periodo(
                consorcio_id,
                data.mes,
                data.anio
            )
        )

        if existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Ya existe una liquidación "
                    "para ese período"
                )
            )

        # =========================
        # 3. OBTENER EXPENSAS
        # =========================

        expensas = (
            self.expensa_repository
            .listar_por_consorcio_periodo(
                consorcio_id=consorcio_id,
                mes=data.mes,
                anio=data.anio
            )
        )

        if not expensas:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No hay expensas cargadas "
                    "para ese período"
                )
            )

        # =========================
        # 4. CALCULAR TOTAL EXPENSAS
        # =========================

        total_expensas = sum(
            (
                Decimal(str(expensa.monto))
                for expensa in expensas
            ),
            Decimal("0")
        )

        # =========================
        # 5. CREAR LIQUIDACIÓN
        # =========================

        try:

            liquidacion = (
                self.liquidacion_repository.crear(
                    consorcio_id=consorcio_id,
                    mes=data.mes,
                    anio=data.anio,
                    total_gastos=total_expensas
                )
            )

            # =========================
            # 6. VINCULAR EXPENSAS
            # =========================

            for expensa in expensas:
                expensa.liquidacion_id = (
                    liquidacion.id
                )

            # =========================
            # 7. GUARDAR
            # =========================

            self.db.commit()
            self.db.refresh(liquidacion)

            return liquidacion

        except Exception:
            self.db.rollback()
            raise

    # =========================
    # LISTAR LIQUIDACIONES
    # =========================

    def listar(
        self,
        consorcio_id: int,
        usuario: Usuario
    ) -> list[Liquidacion]:

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
                    "No tenés acceso a las "
                    "liquidaciones de este consorcio"
                )
            )

        # =========================
        # 2. OBTENER LIQUIDACIONES
        # =========================

        return (
            self.liquidacion_repository
            .listar_por_consorcio(
                consorcio_id
            )
        )

    # =========================
    # OBTENER DETALLE
    # =========================

    def obtener_detalle(
        self,
        consorcio_id: int,
        liquidacion_id: int,
        usuario: Usuario
    ):

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
                    "No tenés acceso a las "
                    "liquidaciones de este consorcio"
                )
            )

        # =========================
        # 2. BUSCAR LIQUIDACIÓN
        # =========================

        liquidacion = (
            self.liquidacion_repository
            .buscar_por_id(
                liquidacion_id
            )
        )

        if (
            not liquidacion
            or liquidacion.consorcio_id != consorcio_id
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Liquidación no encontrada"
            )

        # =========================
        # 3. OBTENER EXPENSAS
        # =========================

        expensas = (
            self.expensa_repository
            .listar_por_liquidacion(
                liquidacion_id
            )
        )
        print("================================")
        print("LIQUIDACION:", liquidacion_id)
        print("CANTIDAD EXPENSAS:", len(expensas))

        for expensa in expensas:
         print(
        "EXPENSA:",
        expensa.id,
        "UNIDAD:",
        expensa.unidad_id,
        "MONTO:",
        expensa.monto
          )

        print("================================")

              # =========================
        # 4. ARMAR DETALLE
        # =========================

        expensas_detalle = []

        for expensa in expensas:

            unidad = (
                self.unidad_repository
                .buscar_por_id(
                    expensa.unidad_id
                )
            )

            expensas_detalle.append({
                "id": expensa.id,
                "liquidacion_id":
                    expensa.liquidacion_id,
                "unidad_id":
                    expensa.unidad_id,
                "unidad_identificador":
                    unidad.identificador
                    if unidad
                    else "Unidad",
                

                # El período pertenece
                # a la liquidación
                "mes":
                    liquidacion.mes,
                "anio":
                    liquidacion.anio,

                "monto":
                    expensa.monto,
                "estado":
                    expensa.estado,
                    "fecha_pago":
    expensa.fecha_pago,
            })

        return liquidacion, expensas_detalle