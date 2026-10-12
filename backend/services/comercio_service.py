from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.comercio import Comercio
from models.usuario import Usuario
from models.zona import Zona

from repositories.comercio_repository import ComercioRepository
from schemas.comercio import ComercioCreate


class ComercioService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = ComercioRepository(db)

    def crear(
        self,
        data: ComercioCreate,
        usuario: Usuario
    ) -> Comercio:

        # =========================
        # VALIDAR ZONA
        # =========================

        zona = (
            self.db.query(Zona)
            .filter(Zona.id == data.zona_id)
            .first()
        )

        if not zona:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Zona no encontrada"
            )

        if zona.estado != "ACTIVA":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La zona seleccionada no está activa"
            )

        # =========================
        # CREAR COMERCIO
        # =========================

        return self.repository.crear(
            nombre=data.nombre,
            categoria=data.categoria,
            direccion=data.direccion,
            zona_id=data.zona_id,
            usuario_id=usuario.id
        )

    def listar(self) -> list[Comercio]:
        return self.repository.listar()

    def buscar_por_id(
        self,
        comercio_id: int
    ) -> Comercio:

        comercio = self.repository.buscar_por_id(
            comercio_id
        )

        if not comercio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comercio no encontrado"
            )

        return comercio

    def listar_del_usuario(
        self,
        usuario: Usuario
    ) -> list[Comercio]:

        return self.repository.listar_por_usuario(
            usuario.id
        )

    def actualizar_disponibilidad_pedidos(
        self,
        comercio_id: int,
        usuario_id: int,
        disponibilidad_pedidos: str
    ):
        try:
            comercio = self.repository.buscar_por_id(
                comercio_id
            )

            if not comercio:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Comercio no encontrado"
                )

            # =========================
            # VALIDAR PROPIEDAD
            # =========================

            comercios_usuario = (
                self.repository.listar_por_usuario(
                    usuario_id
                )
            )

            es_propietario = any(
                comercio_usuario.id == comercio.id
                for comercio_usuario in comercios_usuario
            )

            if not es_propietario:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        "No podés modificar la disponibilidad "
                        "de este comercio"
                    )
                )

            # =========================
            # VALIDAR ESTADO
            # =========================

            disponibilidad_limpia = (
                disponibilidad_pedidos
                .strip()
                .upper()
            )

            disponibilidades_permitidas = {
                "RECIBIENDO_PEDIDOS",
                "PAUSADO",
            }

            if (
                disponibilidad_limpia
                not in disponibilidades_permitidas
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Disponibilidad de pedidos no válida"
                    )
                )

            # =========================
            # ACTUALIZAR
            # =========================

            comercio = (
                self.repository.actualizar_disponibilidad_pedidos(
                    comercio=comercio,
                    disponibilidad_pedidos=disponibilidad_limpia
                )
            )

            self.db.commit()
            self.db.refresh(comercio)

            return comercio

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "No pudimos actualizar la disponibilidad "
                    "del comercio"
                )
            )