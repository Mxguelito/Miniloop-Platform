from sqlalchemy.orm import Session

from models.consorcio import Consorcio
from models.usuario_consorcio import UsuarioConsorcio
from models.usuario import Usuario

class ConsorcioRepository:

    def __init__(self, db: Session):
        self.db = db

            # =========================
    # BUSCAR CONSORCIO POR ID
    # =========================

    def buscar_por_id(
        self,
        consorcio_id: int
    ) -> Consorcio | None:

        return (
            self.db.query(Consorcio)
            .filter(
                Consorcio.id == consorcio_id
            )
            .first()
        )

    # =========================
    # CREAR CONSORCIO
    # =========================

    def crear(
        self,
        nombre: str,
        direccion: str,
        usuario_id: int
    ) -> Consorcio:

        consorcio = Consorcio(
            nombre=nombre,
            direccion=direccion,
            estado="ACTIVO"
        )

        self.db.add(consorcio)
        self.db.flush()

        relacion = UsuarioConsorcio(
            usuario_id=usuario_id,
            consorcio_id=consorcio.id,
            rol="ADMINISTRADOR"
        )

        self.db.add(relacion)

        self.db.commit()
        self.db.refresh(consorcio)

        return consorcio

        # =========================
    # CONSORCIOS DEL USUARIO
    # =========================

    def listar_por_usuario(
        self,
        usuario_id: int
    ) -> list[Consorcio]:

        return (
            self.db.query(Consorcio)
            .join(
                UsuarioConsorcio,
                UsuarioConsorcio.consorcio_id
                == Consorcio.id
            )
            .filter(
                UsuarioConsorcio.usuario_id
                == usuario_id
            )
            .all()
        )


        # =========================
    # BUSCAR PARA USUARIO
    # =========================

    def buscar_para_usuario(
        self,
        consorcio_id: int,
        usuario_id: int
    ) -> Consorcio | None:

        return (
            self.db.query(Consorcio)
            .join(
                UsuarioConsorcio,
                UsuarioConsorcio.consorcio_id
                == Consorcio.id
            )
            .filter(
                Consorcio.id == consorcio_id,
                UsuarioConsorcio.usuario_id == usuario_id
            )
            .first()
        )

    # =========================
    # OBTENER ROL DEL USUARIO
     # =========================

    def obtener_rol_usuario(
    self,
    consorcio_id: int,
    usuario_id: int
       ) -> str | None:

     relacion = (
        self.db.query(UsuarioConsorcio)
        .filter(
            UsuarioConsorcio.consorcio_id == consorcio_id,
            UsuarioConsorcio.usuario_id == usuario_id
        )
        .first()
     )

     if not relacion:
          return None

     return relacion.rol

        # =========================
    # VERIFICAR ADMINISTRADOR
    # =========================

    def es_administrador(
        self,
        consorcio_id: int,
        usuario_id: int
    ) -> bool:

        relacion = (
            self.db.query(UsuarioConsorcio)
            .filter(
                UsuarioConsorcio.consorcio_id == consorcio_id,
                UsuarioConsorcio.usuario_id == usuario_id,
                UsuarioConsorcio.rol == "ADMINISTRADOR"
            )
            .first()
        )

        return relacion is not None

        # =========================
    # VERIFICAR MIEMBRO
    # =========================

    def es_miembro(
        self,
        consorcio_id: int,
        usuario_id: int
    ) -> bool:

        relacion = (
            self.db.query(UsuarioConsorcio)
            .filter(
                UsuarioConsorcio.consorcio_id == consorcio_id,
                UsuarioConsorcio.usuario_id == usuario_id
            )
            .first()
        )

        return relacion is not None


    # =========================
    # AGREGAR MIEMBRO
    # =========================

    def agregar_miembro(
        self,
        consorcio_id: int,
        usuario_id: int
    ) -> UsuarioConsorcio:

        relacion = UsuarioConsorcio(
            usuario_id=usuario_id,
            consorcio_id=consorcio_id,
            rol="MIEMBRO"
        )

        self.db.add(relacion)
        self.db.commit()
        self.db.refresh(relacion)

        return relacion



       # =========================
    # LISTAR MIEMBROS
    # =========================

    def listar_miembros(
    self,
    consorcio_id: int
    ):
     return (
        self.db.query(
            Usuario,
            UsuarioConsorcio.rol,
            UsuarioConsorcio.unidad_id
        )
        .join(
            UsuarioConsorcio,
            UsuarioConsorcio.usuario_id == Usuario.id
        )
        .filter(
            UsuarioConsorcio.consorcio_id == consorcio_id
        )
        .all()
    )

   # =========================
# ASIGNAR UNIDAD A USUARIO
# =========================

    def asignar_unidad(
    self,
    consorcio_id: int,
    usuario_id: int,
    unidad_id: int
    ) -> UsuarioConsorcio | None:

     relacion = (
        self.db.query(UsuarioConsorcio)
        .filter(
            UsuarioConsorcio.consorcio_id == consorcio_id,
            UsuarioConsorcio.usuario_id == usuario_id
        )
        .first()
    )

     if not relacion:
        return None

     relacion.unidad_id = unidad_id

     self.db.commit()
     self.db.refresh(relacion)

     return relacion

    # =========================
# OBTENER UNIDAD DEL USUARIO
# =========================

    def obtener_unidad_usuario(
    self,
    consorcio_id: int,
    usuario_id: int
    ) -> int | None:

     relacion = (
        self.db.query(UsuarioConsorcio)
        .filter(
            UsuarioConsorcio.consorcio_id == consorcio_id,
            UsuarioConsorcio.usuario_id == usuario_id
        )
        .first()
     )

     if not relacion:
        return None

     return relacion.unidad_id