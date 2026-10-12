from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.gasto import Gasto
from models.usuario import Usuario
from repositories.consorcio_repository import ConsorcioRepository
from repositories.gasto_repository import GastoRepository
from schemas.gasto import GastoCreate


class GastoService:

    def __init__(self, db: Session):
        self.gasto_repository = GastoRepository(db)
        self.consorcio_repository = ConsorcioRepository(db)

    # =========================
    # REGISTRAR GASTO
    # =========================

    def crear(
        self,
        consorcio_id: int,
        data: GastoCreate,
        usuario: Usuario
    ) -> Gasto:

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
                    "gastos en este consorcio"
                )
            )

        return self.gasto_repository.crear(
            consorcio_id=consorcio_id,
            concepto=data.concepto.strip(),
            monto=data.monto,
            fecha=data.fecha
        )

    # =========================
    # LISTAR GASTOS
    # =========================

    def listar(
        self,
        consorcio_id: int,
        usuario: Usuario
    ) -> list[Gasto]:

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
            self.gasto_repository.listar_por_consorcio(
                consorcio_id
            )
        )