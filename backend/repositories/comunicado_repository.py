from sqlalchemy.orm import Session

from models.comunicado import Comunicado


class ComunicadoRepository:

    def __init__(self, db: Session):
        self.db = db

    # =========================
    # CREAR COMUNICADO
    # =========================

    def crear(
        self,
        consorcio_id: int,
        autor_id: int,
        titulo: str,
        mensaje: str
    ) -> Comunicado:

        comunicado = Comunicado(
            consorcio_id=consorcio_id,
            autor_id=autor_id,
            titulo=titulo,
            mensaje=mensaje
        )

        self.db.add(comunicado)
        self.db.commit()
        self.db.refresh(comunicado)

        return comunicado

    # =========================
    # LISTAR POR CONSORCIO
    # =========================

    def listar_por_consorcio(
        self,
        consorcio_id: int
    ) -> list[Comunicado]:

        return (
            self.db.query(Comunicado)
            .filter(
                Comunicado.consorcio_id == consorcio_id
            )
            .order_by(
                Comunicado.fecha_creacion.desc()
            )
            .all()
        )