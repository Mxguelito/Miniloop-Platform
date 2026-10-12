from sqlalchemy.orm import Session
from datetime import datetime, timezone

from models.incidencia_entrega import IncidenciaEntrega


class IncidenciaEntregaRepository:

    def __init__(self, db: Session):
        self.db = db

    def crear(
        self,
        entrega_id: int,
        usuario_id: int,
        tipo: str,
        descripcion: str | None = None
    ) -> IncidenciaEntrega:

        incidencia = IncidenciaEntrega(
            entrega_id=entrega_id,
            usuario_id=usuario_id,
            tipo=tipo,
            descripcion=descripcion,
            estado="ABIERTA"
        )

        self.db.add(incidencia)
        self.db.flush()

        return incidencia

    def buscar_por_id(
        self,
        incidencia_id: int
    ) -> IncidenciaEntrega | None:

        return (
            self.db.query(IncidenciaEntrega)
            .filter(
                IncidenciaEntrega.id == incidencia_id
            )
            .first()
        )

    def listar_por_entrega(
        self,
        entrega_id: int
    ) -> list[IncidenciaEntrega]:

        return (
            self.db.query(IncidenciaEntrega)
            .filter(
                IncidenciaEntrega.entrega_id == entrega_id
            )
            .order_by(
                IncidenciaEntrega.id.desc()
            )
            .all()
        )

    def listar_abiertas(
        self
    ) -> list[IncidenciaEntrega]:

        return (
            self.db.query(IncidenciaEntrega)
            .filter(
                IncidenciaEntrega.estado == "ABIERTA"
            )
            .order_by(
                IncidenciaEntrega.fecha_creacion.asc()
            )
            .all()
        )

    def existe_abierta_por_entrega(
        self,
        entrega_id: int
    ) -> bool:

        return (
            self.db.query(IncidenciaEntrega)
            .filter(
                IncidenciaEntrega.entrega_id == entrega_id,
                IncidenciaEntrega.estado == "ABIERTA"
            )
            .first()
            is not None
        )

    def buscar_para_resolver(
        self,
        incidencia_id: int
    ) -> IncidenciaEntrega | None:

        return (
            self.db.query(IncidenciaEntrega)
            .filter(
                IncidenciaEntrega.id == incidencia_id
            )
            .with_for_update()
            .first()
        )

    def cerrar(
        self,
        incidencia: IncidenciaEntrega,
        resolucion: str
    ) -> IncidenciaEntrega:

        incidencia.estado = "CERRADA"
        incidencia.resolucion = resolucion
        incidencia.fecha_resolucion = datetime.now(timezone.utc)

        self.db.flush()

        return incidencia

    def buscar_abierta_por_entrega_y_tipo(
    self,
    entrega_id: int,
    tipo: str
) -> IncidenciaEntrega | None:
     return (
        self.db.query(IncidenciaEntrega)
        .filter(
            IncidenciaEntrega.entrega_id == entrega_id,
            IncidenciaEntrega.tipo == tipo,
            IncidenciaEntrega.estado == "ABIERTA"
        )
        .order_by(
            IncidenciaEntrega.fecha_creacion.desc()
        )
        .with_for_update()
        .first()
    )