from sqlalchemy.orm import Session

from models.zona import Zona


class ZonaRepository:

    def __init__(self, db: Session):
        self.db = db

    # =========================
    # LISTAR ZONAS ACTIVAS
    # =========================

    def listar_activas(self) -> list[Zona]:
        return (
            self.db.query(Zona)
            .filter(Zona.estado == "ACTIVA")
            .order_by(Zona.nombre)
            .all()
        )

    # =========================
    # BUSCAR POR ID
    # =========================

    def buscar_por_id(
        self,
        zona_id: int
    ) -> Zona | None:
        return (
            self.db.query(Zona)
            .filter(Zona.id == zona_id)
            .first()
        )