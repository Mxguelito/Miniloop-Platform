from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.unidad import UnidadCreate, UnidadResponse
from services.unidad_service import UnidadService


router = APIRouter(
    prefix="/consorcios",
    tags=["Unidades"]
)


# =========================
# CREAR UNIDAD
# =========================

@router.post(
    "/{consorcio_id}/unidades",
    response_model=UnidadResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_unidad(
    consorcio_id: int,
    data: UnidadCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = UnidadService(db)

    return service.crear(
        consorcio_id=consorcio_id,
        data=data,
        usuario=usuario
    )


# =========================
# LISTAR UNIDADES
# =========================

@router.get(
    "/{consorcio_id}/unidades",
    response_model=list[UnidadResponse]
)
def listar_unidades(
    consorcio_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = UnidadService(db)

    return service.listar(
        consorcio_id=consorcio_id,
        usuario=usuario
    )