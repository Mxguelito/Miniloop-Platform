from sqlalchemy.orm import Session

from models.comercio import Comercio
from models.usuario_comercio import UsuarioComercio


class ComercioRepository:

    def __init__(self, db: Session):
        self.db = db

    # =========================
    # CREAR COMERCIO
    # =========================

    def crear(
        self,
        nombre: str,
        categoria: str,
        direccion: str,
        zona_id: int,
        usuario_id: int
    ) -> Comercio:

        comercio = Comercio(
            nombre=nombre,
            categoria=categoria,
            direccion=direccion,
            zona_id=zona_id,
            estado="ACTIVO"
        )

        self.db.add(comercio)
        self.db.flush()

        relacion = UsuarioComercio(
            usuario_id=usuario_id,
            comercio_id=comercio.id,
            rol="PROPIETARIO"
        )

        self.db.add(relacion)

        self.db.commit()
        self.db.refresh(comercio)

        return comercio

    # =========================
    # LISTAR COMERCIOS
    # =========================

    def listar(self) -> list[Comercio]:

        return (
            self.db.query(Comercio)
            .all()
        )

    # =========================
    # BUSCAR POR ID
    # =========================

    def buscar_por_id(
        self,
        comercio_id: int
    ) -> Comercio | None:

        return (
            self.db.query(Comercio)
            .filter(
                Comercio.id == comercio_id
            )
            .first()
        )

    # =========================
    # COMERCIOS DEL USUARIO
    # =========================

    def listar_por_usuario(
        self,
        usuario_id: int
    ) -> list[Comercio]:

        return (
            self.db.query(Comercio)
            .join(
                UsuarioComercio,
                UsuarioComercio.comercio_id
                == Comercio.id
            )
            .filter(
                UsuarioComercio.usuario_id
                == usuario_id
            )
            .all()
        )

    # =========================
    # VERIFICAR PROPIETARIO
    # =========================

    def es_propietario(
        self,
        comercio_id: int,
        usuario_id: int
    ) -> bool:

        relacion = (
            self.db.query(UsuarioComercio)
            .filter(
                UsuarioComercio.comercio_id
                == comercio_id,
                UsuarioComercio.usuario_id
                == usuario_id,
                UsuarioComercio.rol
                == "PROPIETARIO"
            )
            .first()
        )

        return relacion is not None

    def actualizar_disponibilidad_pedidos(
        self,
        comercio,
        disponibilidad_pedidos: str
    ):
        comercio.disponibilidad_pedidos = disponibilidad_pedidos

        self.db.flush()

        return comercio