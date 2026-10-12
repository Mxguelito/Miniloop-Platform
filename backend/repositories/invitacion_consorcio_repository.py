from sqlalchemy.orm import Session

from models.invitacion_consorcio import InvitacionConsorcio


class InvitacionConsorcioRepository:

    def __init__(self, db: Session):
        self.db = db

    # =========================
    # CREAR INVITACIÓN
    # =========================

    def crear(
        self,
        consorcio_id: int,
        creada_por: int,
        codigo: str
    ) -> InvitacionConsorcio:

        invitacion = InvitacionConsorcio(
            consorcio_id=consorcio_id,
            creada_por=creada_por,
            codigo=codigo,
            estado="ACTIVA"
        )

        self.db.add(invitacion)
        self.db.commit()
        self.db.refresh(invitacion)

        return invitacion

    # =========================
    # BUSCAR POR CÓDIGO
    # =========================

    def buscar_por_codigo(
        self,
        codigo: str
    ) -> InvitacionConsorcio | None:

        return (
            self.db.query(InvitacionConsorcio)
            .filter(
                InvitacionConsorcio.codigo == codigo
            )
            .first()
        )

    # =========================
    # MARCAR COMO USADA
    # =========================

    def marcar_como_usada(
        self,
        invitacion: InvitacionConsorcio
    ) -> InvitacionConsorcio:

        invitacion.estado = "USADA"

        self.db.commit()
        self.db.refresh(invitacion)

        return invitacion