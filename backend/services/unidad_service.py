from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.unidad import Unidad
from models.usuario import Usuario
from repositories.consorcio_repository import ConsorcioRepository
from repositories.unidad_repository import UnidadRepository
from schemas.unidad import UnidadCreate


class UnidadService:

    def __init__(self, db: Session):
        self.unidad_repository = UnidadRepository(db)
        self.consorcio_repository = ConsorcioRepository(db)

    # =========================
    # CREAR UNIDAD
    # =========================

    def crear(
        self,
        consorcio_id: int,
        data: UnidadCreate,
        usuario: Usuario
    ) -> Unidad:

        # Solo el administrador puede crear unidades
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
                    "No tenés permisos para crear "
                    "unidades en este consorcio"
                )
            )

        return self.unidad_repository.crear(
            consorcio_id=consorcio_id,
            identificador=data.identificador.strip(),
            metros_cuadrados=data.metros_cuadrados
        )

    # =========================
    # LISTAR UNIDADES
    # =========================

    def listar(
        self,
        consorcio_id: int,
        usuario: Usuario
    ) -> list[Unidad]:

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
            self.unidad_repository
            .listar_por_consorcio(consorcio_id)
        )