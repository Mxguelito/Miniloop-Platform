from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.resumen_economico import ResumenEconomicoResponse
from services.resumen_economico_service import ResumenEconomicoService


router = APIRouter(
    prefix="/consorcios",
    tags=["Resumen económico"]
)


# =========================
# VER RESUMEN ECONÓMICO
# =========================

@router.get(
    "/{consorcio_id}/resumen-economico",
    response_model=ResumenEconomicoResponse
)
def obtener_resumen_economico(
    consorcio_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ResumenEconomicoService(db)

    return service.obtener(
        consorcio_id=consorcio_id,
        usuario=usuario
    )