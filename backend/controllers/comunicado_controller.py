from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.comunicado import (
    ComunicadoCreate,
    ComunicadoResponse,
)
from services.comunicado_service import ComunicadoService


router = APIRouter(
    prefix="/consorcios",
    tags=["Comunicados"]
)


# =========================
# PUBLICAR COMUNICADO
# =========================

@router.post(
    "/{consorcio_id}/comunicados",
    response_model=ComunicadoResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_comunicado(
    consorcio_id: int,
    data: ComunicadoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ComunicadoService(db)

    return service.crear(
        consorcio_id,
        data,
        usuario
    )


# =========================
# LISTAR COMUNICADOS
# =========================

@router.get(
    "/{consorcio_id}/comunicados",
    response_model=list[ComunicadoResponse]
)
def listar_comunicados(
    consorcio_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ComunicadoService(db)

    return service.listar(
        consorcio_id,
        usuario
    )