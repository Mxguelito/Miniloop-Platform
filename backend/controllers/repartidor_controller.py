from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.repartidor import (
    RepartidorCreate,
    RepartidorResponse,
    EstadisticasRepartidorResponse,
)
from services.repartidor_service import RepartidorService


router = APIRouter(
    prefix="/repartidores",
    tags=["Repartidores"]
)


# =========================
# ACTIVAR DELIVERY
# =========================

@router.post(
    "/activar",
    response_model=RepartidorResponse,
    status_code=status.HTTP_201_CREATED
)
def activar_delivery(
    data: RepartidorCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = RepartidorService(db)

    return service.activar(
        data,
        usuario
    )


# =========================
# OBTENER MI PERFIL
# =========================

@router.get(
    "/me",
    response_model=RepartidorResponse
)
def obtener_mi_perfil_delivery(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = RepartidorService(db)

    return service.obtener_mi_perfil(
        usuario
    )


# =========================
# MIS ESTADISTICAS
# =========================

@router.get(
    "/me/estadisticas",
    response_model=EstadisticasRepartidorResponse
)
def obtener_mis_estadisticas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = RepartidorService(db)

    return service.obtener_estadisticas(
        usuario_id=usuario.id
    )


# =========================
# INICIAR JORNADA
# =========================

@router.patch(
    "/jornada/iniciar",
    response_model=RepartidorResponse
)
def iniciar_jornada(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = RepartidorService(db)

    return service.iniciar_jornada(
        usuario
    )


# =========================
# TERMINAR JORNADA
# =========================

@router.patch(
    "/jornada/terminar",
    response_model=RepartidorResponse
)
def terminar_jornada(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = RepartidorService(db)

    return service.terminar_jornada(
        usuario
    )