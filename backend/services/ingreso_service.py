from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.ingreso import Ingreso
from models.usuario import Usuario
from repositories.consorcio_repository import ConsorcioRepository
from repositories.ingreso_repository import IngresoRepository
from schemas.ingreso import IngresoCreate


class IngresoService:

    def __init__(self, db: Session):
        self.ingreso_repository = IngresoRepository(db)
        self.consorcio_repository = ConsorcioRepository(db)

    # =========================
    # REGISTRAR INGRESO
    # =========================

    def crear(
        self,
        consorcio_id: int,
        data: IngresoCreate,
        usuario: Usuario
    ) -> Ingreso:

        es_administrador = (
            self.consorcio_repository.es_administrador(
                consorcio_id,
                usuario.id
            )
        )

        if not es_administrador:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "No tenés permisos para registrar "
                    "ingresos en este consorcio"
                )
            )

        return self.ingreso_repository.crear(
            consorcio_id=consorcio_id,
            concepto=data.concepto.strip(),
            monto=data.monto,
            fecha=data.fecha
        )

    # =========================
    # LISTAR INGRESOS
    # =========================

    def listar(
        self,
        consorcio_id: int,
        usuario: Usuario
    ) -> list[Ingreso]:

        es_miembro = (
            self.consorcio_repository.es_miembro(
                consorcio_id,
                usuario.id
            )
        )

        if not es_miembro:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No pertenecés a este consorcio"
            )

        return (
            self.ingreso_repository
            .listar_por_consorcio(consorcio_id)
        )