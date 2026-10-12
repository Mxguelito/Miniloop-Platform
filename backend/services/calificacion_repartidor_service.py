from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from repositories.calificacion_repartidor_repository import (
    CalificacionRepartidorRepository,
)
from repositories.entrega_repository import EntregaRepository
from repositories.pedido_repository import PedidoRepository


class CalificacionRepartidorService:

    def __init__(self, db: Session):
        self.db = db

        self.repository = CalificacionRepartidorRepository(db)
        self.entrega_repository = EntregaRepository(db)
        self.pedido_repository = PedidoRepository(db)

    def calificar(
        self,
        entrega_id: int,
        usuario_id: int,
        puntuacion: int,
        comentario: str | None
    ):
        try:
            # =========================
            # ENTREGA
            # =========================

            entrega = self.entrega_repository.buscar_por_id(
                entrega_id
            )

            if not entrega:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Entrega no encontrada"
                )

            if entrega.estado != "ENTREGADO":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Solo podés calificar una entrega "
                        "que ya fue completada"
                    )
                )

            if entrega.repartidor_id is None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "La entrega no tiene un "
                        "repartidor asociado"
                    )
                )

            # =========================
            # PEDIDO / PROPIETARIO
            # =========================

            pedido = self.pedido_repository.buscar_por_id(
                entrega.pedido_id
            )

            if not pedido:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Pedido asociado no encontrado"
                )

            if pedido.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        "No podés calificar una entrega "
                        "que no te pertenece"
                    )
                )

            # =========================
            # UNA SOLA CALIFICACIÓN
            # =========================

            existente = self.repository.buscar_por_entrega(
                entrega.id
            )

            if existente:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Esta entrega ya fue calificada"
                    )
                )

            # =========================
            # COMENTARIO
            # =========================

            comentario_limpio = None

            if comentario is not None:
                comentario_limpio = comentario.strip()

                if not comentario_limpio:
                    comentario_limpio = None

            # =========================
            # CREAR
            # =========================

            calificacion = self.repository.crear(
                entrega_id=entrega.id,
                repartidor_id=entrega.repartidor_id,
                usuario_id=usuario_id,
                puntuacion=puntuacion,
                comentario=comentario_limpio
            )

            self.db.commit()
            self.db.refresh(calificacion)

            return calificacion

        except HTTPException:
            self.db.rollback()
            raise

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No pudimos registrar la calificación"
            )