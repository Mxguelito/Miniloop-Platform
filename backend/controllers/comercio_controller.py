from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.comercio import (
    ComercioCreate,
    ComercioResponse,
    ComercioDisponibilidadUpdate,
)
from services.comercio_service import ComercioService


router = APIRouter(
    prefix="/comercios",
    tags=["Comercios"]
)


# =========================
# CREAR COMERCIO
# =========================

@router.post(
    "",
    response_model=ComercioResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_comercio(
    data: ComercioCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ComercioService(db)

    return service.crear(
        data,
        usuario
    )


# =========================
# LISTAR COMERCIOS
# =========================

@router.get(
    "",
    response_model=list[ComercioResponse]
)
def listar_comercios(
    db: Session = Depends(get_db)
):
    service = ComercioService(db)

    return service.listar()


# =========================
# MIS COMERCIOS
# =========================

@router.get(
    "/mios",
    response_model=list[ComercioResponse]
)
def listar_mis_comercios(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ComercioService(db)

    return service.listar_del_usuario(
        usuario
    )


# =========================
# DISPONIBILIDAD DE PEDIDOS
# =========================

@router.patch(
    "/{comercio_id}/disponibilidad-pedidos",
    response_model=ComercioResponse
)
def actualizar_disponibilidad_pedidos(
    comercio_id: int,
    datos: ComercioDisponibilidadUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ComercioService(db)

    return service.actualizar_disponibilidad_pedidos(
        comercio_id=comercio_id,
        usuario_id=usuario.id,
        disponibilidad_pedidos=datos.disponibilidad_pedidos
    )


# =========================
# OBTENER COMERCIO
# =========================

@router.get(
    "/{comercio_id}",
    response_model=ComercioResponse
)
def obtener_comercio(
    comercio_id: int,
    db: Session = Depends(get_db)
):
    service = ComercioService(db)

    return service.buscar_por_id(
        comercio_id
    )