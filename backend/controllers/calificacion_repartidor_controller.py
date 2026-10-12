from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.calificacion_repartidor import (
    CalificacionRepartidorCreate,
    CalificacionRepartidorResponse,
)
from services.calificacion_repartidor_service import (
    CalificacionRepartidorService,
)


router = APIRouter(
    prefix="/calificaciones-repartidores",
    tags=["Calificaciones Repartidores"]
)


@router.post(
    "/entregas/{entrega_id}",
    response_model=CalificacionRepartidorResponse,
    status_code=status.HTTP_201_CREATED
)
def calificar_repartidor(
    entrega_id: int,
    datos: CalificacionRepartidorCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = CalificacionRepartidorService(db)

    return service.calificar(
        entrega_id=entrega_id,
        usuario_id=usuario.id,
        puntuacion=datos.puntuacion,
        comentario=datos.comentario
    )