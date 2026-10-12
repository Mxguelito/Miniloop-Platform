from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.usuario import Usuario
from repositories.consorcio_repository import ConsorcioRepository
from repositories.gasto_repository import GastoRepository
from repositories.ingreso_repository import IngresoRepository
from schemas.resumen_economico import ResumenEconomicoResponse


class ResumenEconomicoService:

    def __init__(self, db: Session):
        self.consorcio_repository = ConsorcioRepository(db)
        self.gasto_repository = GastoRepository(db)
        self.ingreso_repository = IngresoRepository(db)

    # =========================
    # OBTENER RESUMEN ECONÓMICO
    # =========================

    def obtener(
        self,
        consorcio_id: int,
        usuario: Usuario
    ) -> ResumenEconomicoResponse:

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
                    "No tenés permisos para consultar "
                    "el resumen económico"
                )
            )

        total_ingresos = (
            self.ingreso_repository.obtener_total(
                consorcio_id
            )
        )

        total_gastos = (
            self.gasto_repository.obtener_total(
                consorcio_id
            )
        )

        saldo = total_ingresos - total_gastos

        return ResumenEconomicoResponse(
            total_ingresos=total_ingresos,
            total_gastos=total_gastos,
            saldo=saldo
        )