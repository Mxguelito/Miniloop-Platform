from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.ingreso import IngresoCreate, IngresoResponse
from services.ingreso_service import IngresoService


router = APIRouter(
    prefix="/consorcios",
    tags=["Ingresos"]
)


# =========================
# REGISTRAR INGRESO
# =========================

@router.post(
    "/{consorcio_id}/ingresos",
    response_model=IngresoResponse,
    status_code=status.HTTP_201_CREATED
)
def registrar_ingreso(
    consorcio_id: int,
    data: IngresoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = IngresoService(db)

    return service.crear(
        consorcio_id=consorcio_id,
        data=data,
        usuario=usuario
    )


# =========================
# LISTAR INGRESOS
# =========================

@router.get(
    "/{consorcio_id}/ingresos",
    response_model=list[IngresoResponse]
)
def listar_ingresos(
    consorcio_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = IngresoService(db)

    return service.listar(
        consorcio_id=consorcio_id,
        usuario=usuario
    )