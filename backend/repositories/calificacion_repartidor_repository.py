from sqlalchemy.orm import Session

from models.calificacion_repartidor import CalificacionRepartidor


class CalificacionRepartidorRepository:

    def __init__(self, db: Session):
        self.db = db

    def crear(
        self,
        entrega_id: int,
        repartidor_id: int,
        usuario_id: int,
        puntuacion: int,
        comentario: str | None
    ) -> CalificacionRepartidor:

        calificacion = CalificacionRepartidor(
            entrega_id=entrega_id,
            repartidor_id=repartidor_id,
            usuario_id=usuario_id,
            puntuacion=puntuacion,
            comentario=comentario
        )

        self.db.add(calificacion)
        self.db.flush()

        return calificacion

    def buscar_por_entrega(
        self,
        entrega_id: int
    ) -> CalificacionRepartidor | None:

        return (
            self.db.query(CalificacionRepartidor)
            .filter(
                CalificacionRepartidor.entrega_id == entrega_id
            )
            .first()
        )

    def listar_por_repartidor(
        self,
        repartidor_id: int
    ) -> list[CalificacionRepartidor]:

        return (
            self.db.query(CalificacionRepartidor)
            .filter(
                CalificacionRepartidor.repartidor_id == repartidor_id
            )
            .order_by(
                CalificacionRepartidor.fecha_creacion.desc()
            )
            .all()
        )

    def contar_por_repartidor(
        self,
        repartidor_id: int
    ) -> int:

        return (
            self.db.query(CalificacionRepartidor)
            .filter(
                CalificacionRepartidor.repartidor_id
                == repartidor_id
            )
            .count()
        )