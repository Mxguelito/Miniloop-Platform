from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.liquidacion import (
    LiquidacionCreate,
    LiquidacionResponse,
    LiquidacionDetalleResponse,
)
from services.liquidacion_service import LiquidacionService


router = APIRouter(
    prefix="/consorcios",
    tags=["Liquidaciones"]
)


# =========================
# GENERAR LIQUIDACIÓN
# =========================

@router.post(
    "/{consorcio_id}/liquidaciones",
    response_model=LiquidacionResponse,
    status_code=status.HTTP_201_CREATED
)
def generar_liquidacion(
    consorcio_id: int,
    data: LiquidacionCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = LiquidacionService(db)

    return service.generar(
        consorcio_id=consorcio_id,
        data=data,
        usuario=usuario
    )

# =========================
# LISTAR LIQUIDACIONES
# =========================

@router.get(
    "/{consorcio_id}/liquidaciones",
    response_model=list[LiquidacionResponse]
)
def listar_liquidaciones(
    consorcio_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = LiquidacionService(db)

    return service.listar(
        consorcio_id=consorcio_id,
        usuario=usuario
    )

# =========================
# OBTENER DETALLE
# =========================

@router.get(
    "/{consorcio_id}/liquidaciones/{liquidacion_id}",
    response_model=LiquidacionDetalleResponse
)
def obtener_detalle_liquidacion(
    consorcio_id: int,
    liquidacion_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = LiquidacionService(db)

    liquidacion, expensas = (
        service.obtener_detalle(
            consorcio_id=consorcio_id,
            liquidacion_id=liquidacion_id,
            usuario=usuario
        )
    )

    return {
        "id": liquidacion.id,
        "consorcio_id": liquidacion.consorcio_id,
        "mes": liquidacion.mes,
        "anio": liquidacion.anio,
        "total_gastos": liquidacion.total_gastos,
        "fecha_generacion": liquidacion.fecha_generacion,
        "estado": liquidacion.estado,
        "expensas": expensas,
    }