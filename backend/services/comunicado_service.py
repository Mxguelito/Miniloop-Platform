from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.usuario import Usuario
from repositories.comunicado_repository import ComunicadoRepository
from repositories.consorcio_repository import ConsorcioRepository
from schemas.comunicado import ComunicadoCreate


class ComunicadoService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = ComunicadoRepository(db)
        self.consorcio_repository = ConsorcioRepository(db)

    # =========================
    # PUBLICAR COMUNICADO
    # =========================

    def crear(
        self,
        consorcio_id: int,
        data: ComunicadoCreate,
        usuario: Usuario
    ):

        # Solo un administrador puede publicar
        if not self.consorcio_repository.es_administrador(
            consorcio_id,
            usuario.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo un administrador puede publicar comunicados"
            )

        return self.repository.crear(
            consorcio_id=consorcio_id,
            autor_id=usuario.id,
            titulo=data.titulo,
            mensaje=data.mensaje
        )

    # =========================
    # VER COMUNICADOS
    # =========================

    def listar(
        self,
        consorcio_id: int,
        usuario: Usuario
    ):

        # Tiene que pertenecer al consorcio
        if not self.consorcio_repository.es_miembro(
            consorcio_id,
            usuario.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No pertenecés a este consorcio"
            )

        return self.repository.listar_por_consorcio(
            consorcio_id
        )