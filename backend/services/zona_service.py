from sqlalchemy.orm import Session

from models.zona import Zona
from repositories.zona_repository import ZonaRepository


class ZonaService:

    def __init__(self, db: Session):
        self.repository = ZonaRepository(db)

    # =========================
    # LISTAR ZONAS ACTIVAS
    # =========================

    def listar_activas(self) -> list[Zona]:
        return self.repository.listar_activas()