from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.consorcio import (
    ConsorcioCreate,
    ConsorcioResponse,
    MiembroConsorcioResponse,
)
from services.consorcio_service import ConsorcioService


router = APIRouter(
    prefix="/consorcios",
    tags=["Consorcios"]
)


@router.post(
    "",
    response_model=ConsorcioResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_consorcio(
    data: ConsorcioCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ConsorcioService(db)

    return service.crear(
        data,
        usuario
    )


@router.get(
    "/mios",
    response_model=list[ConsorcioResponse]
)
def listar_mis_consorcios(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ConsorcioService(db)

    return service.listar_del_usuario(
        usuario
    )

# =========================
# LISTAR MIEMBROS
# =========================

@router.get(
    "/{consorcio_id}/miembros",
    response_model=list[MiembroConsorcioResponse]
)
def listar_miembros(
    consorcio_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ConsorcioService(db)

    return service.listar_miembros(
        consorcio_id,
        usuario
    )

# =========================
# ASIGNAR UNIDAD A MIEMBRO
# =========================

@router.patch(
    "/{consorcio_id}/miembros/{usuario_id}/unidad"
)
def asignar_unidad(
    consorcio_id: int,
    usuario_id: int,
    unidad_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ConsorcioService(db)

    return service.asignar_unidad(
        consorcio_id=consorcio_id,
        usuario_id=usuario_id,
        unidad_id=unidad_id,
        usuario=usuario
    )


@router.get(
    "/{consorcio_id}",
    response_model=ConsorcioResponse
)
def obtener_consorcio(
    consorcio_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ConsorcioService(db)

    return service.obtener_del_usuario(
        consorcio_id,
        usuario
    )