from decimal import Decimal

from sqlalchemy.orm import Session

from models.unidad import Unidad


class UnidadRepository:

    def __init__(self, db: Session):
        self.db = db

    # =========================
    # CREAR UNIDAD
    # =========================

    def crear(
        self,
        consorcio_id: int,
        identificador: str,
        metros_cuadrados: Decimal | None
    ) -> Unidad:

        unidad = Unidad(
            consorcio_id=consorcio_id,
            identificador=identificador,
            metros_cuadrados=metros_cuadrados
        )

        self.db.add(unidad)
        self.db.commit()
        self.db.refresh(unidad)

        return unidad

    # =========================
    # LISTAR POR CONSORCIO
    # =========================

    def listar_por_consorcio(
        self,
        consorcio_id: int
    ) -> list[Unidad]:

        return (
            self.db.query(Unidad)
            .filter(
                Unidad.consorcio_id == consorcio_id
            )
            .order_by(Unidad.identificador.asc())
            .all()
        )

    # =========================
    # BUSCAR POR ID
    # =========================

    def buscar_por_id(
        self,
        unidad_id: int
    ) -> Unidad | None:

        return (
            self.db.query(Unidad)
            .filter(
                Unidad.id == unidad_id
            )
            .first()
        )