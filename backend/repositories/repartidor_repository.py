from sqlalchemy.orm import Session

from models.repartidor import Repartidor


class RepartidorRepository:

    def __init__(self, db: Session):
        self.db = db

    # =========================
    # CREAR PERFIL REPARTIDOR
    # =========================

    def crear(
        self,
        usuario_id: int,
        zona_id: int,
        transporte: str
    ) -> Repartidor:

        repartidor = Repartidor(
            usuario_id=usuario_id,
            zona_id=zona_id,
            transporte=transporte,
            disponibilidad="NO_DISPONIBLE",
            estado="ACTIVO"
        )

        self.db.add(repartidor)
        self.db.commit()
        self.db.refresh(repartidor)

        return repartidor

    # =========================
    # BUSCAR POR USUARIO
    # =========================

    def buscar_por_usuario(
        self,
        usuario_id: int
    ) -> Repartidor | None:

        return (
            self.db.query(Repartidor)
            .filter(
                Repartidor.usuario_id == usuario_id
            )
            .first()
        )

    # =========================
    # BUSCAR POR ID
    # =========================

    def buscar_por_id(
        self,
        repartidor_id: int
    ) -> Repartidor | None:

        return (
            self.db.query(Repartidor)
            .filter(
                Repartidor.id == repartidor_id
            )
            .first()
        )

        # =========================
    # ACTUALIZAR DISPONIBILIDAD
    # =========================

    def actualizar_disponibilidad(
        self,
        repartidor: Repartidor,
        disponibilidad: str
    ) -> Repartidor:

        repartidor.disponibilidad = disponibilidad

        self.db.commit()
        self.db.refresh(repartidor)

        return repartidor

    def existe_disponible_en_zona(
        self,
        zona_id: int
        ) -> bool:

        return (
        self.db.query(Repartidor)
        .filter(
            Repartidor.zona_id == zona_id,
            Repartidor.estado == "ACTIVO",
            Repartidor.disponibilidad == "DISPONIBLE"
        )
        .first()
        is not None
    )

    def buscar_por_usuario_para_aceptar(
    self,
    usuario_id: int
):
     return (
        self.db.query(Repartidor)
        .filter(
            Repartidor.usuario_id == usuario_id
        )
        .with_for_update()
        .first()
    )