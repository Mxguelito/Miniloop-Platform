import secrets
import string

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.invitacion_consorcio import InvitacionConsorcio
from models.usuario import Usuario
from repositories.consorcio_repository import ConsorcioRepository
from repositories.invitacion_consorcio_repository import (
    InvitacionConsorcioRepository,
)

from models.consorcio import Consorcio


class InvitacionConsorcioService:

    def __init__(self, db: Session):
        self.db = db

        self.repository = InvitacionConsorcioRepository(db)
        self.consorcio_repository = ConsorcioRepository(db)


    # =========================
    # GENERAR CÓDIGO
    # =========================

    def _generar_codigo(self) -> str:

        caracteres = (
            string.ascii_uppercase
            + string.digits
        )

        return "".join(
            secrets.choice(caracteres)
            for _ in range(6)
        )


    # =========================
    # CREAR INVITACIÓN
    # =========================

    def crear(
        self,
        consorcio_id: int,
        usuario: Usuario
    ) -> InvitacionConsorcio:

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
                    "No tenés permisos para generar "
                    "invitaciones en este consorcio"
                )
            )

        codigo = self._generar_codigo()

        return self.repository.crear(
            consorcio_id=consorcio_id,
            creada_por=usuario.id,
            codigo=codigo
        )

        # =========================
    # UNIRSE AL CONSORCIO
    # =========================

    def unirse(
        self,
        codigo: str,
        usuario: Usuario
    ) -> Consorcio:

        codigo_limpio = codigo.strip().upper()

        invitacion = (
            self.repository.buscar_por_codigo(
                codigo_limpio
            )
        )

        # Invitación inexistente
        if not invitacion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Código de invitación inválido"
            )

        # Invitación ya utilizada
        if invitacion.estado != "ACTIVA":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La invitación ya no está disponible"
            )

        # Usuario ya pertenece
        if self.consorcio_repository.es_miembro(
            invitacion.consorcio_id,
            usuario.id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya pertenecés a este consorcio"
            )

        # Agregar como miembro
        self.consorcio_repository.agregar_miembro(
            consorcio_id=invitacion.consorcio_id,
            usuario_id=usuario.id
        )

        # Consumir invitación
        self.repository.marcar_como_usada(
            invitacion
        )

        consorcio = (
            self.consorcio_repository.buscar_para_usuario(
                invitacion.consorcio_id,
                usuario.id
            )
        )

        if not consorcio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consorcio no encontrado"
            )

        return consorcio