from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.invitacion_consorcio import InvitacionConsorcioResponse
from services.invitacion_consorcio_service import (
    InvitacionConsorcioService,
)

from schemas.invitacion_consorcio import (
    InvitacionConsorcioResponse,
    UnirseConsorcioRequest,
)
from schemas.consorcio import ConsorcioResponse


router = APIRouter(
    prefix="/consorcios",
    tags=["Invitaciones de consorcio"]
)


# =========================
# GENERAR INVITACIÓN
# =========================

@router.post(
    "/{consorcio_id}/invitaciones",
    response_model=InvitacionConsorcioResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_invitacion(
    consorcio_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = InvitacionConsorcioService(db)

    return service.crear(
        consorcio_id,
        usuario
    )

# =========================
# UNIRSE AL CONSORCIO
# =========================

@router.post(
    "/unirse",
    response_model=ConsorcioResponse
)
def unirse_al_consorcio(
    data: UnirseConsorcioRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = InvitacionConsorcioService(db)

    return service.unirse(
        codigo=data.codigo,
        usuario=usuario
    )