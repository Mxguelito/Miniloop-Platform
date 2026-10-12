from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.zona import ZonaResponse
from services.zona_service import ZonaService


router = APIRouter(
    prefix="/zonas",
    tags=["Zonas"]
)


# =========================
# LISTAR ZONAS ACTIVAS
# =========================

@router.get(
    "",
    response_model=list[ZonaResponse]
)
def listar_zonas_activas(
    db: Session = Depends(get_db)
):
    service = ZonaService(db)

    return service.listar_activas()