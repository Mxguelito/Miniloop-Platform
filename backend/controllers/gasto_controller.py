from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.gasto import GastoCreate, GastoResponse
from services.gasto_service import GastoService
from sqlalchemy.orm import Session

from models.consorcio import Consorcio
from models.usuario_consorcio import UsuarioConsorcio
from models.usuario import Usuario


router = APIRouter(
    prefix="/consorcios",
    tags=["Gastos"]
)


# =========================
# REGISTRAR GASTO
# =========================

@router.post(
    "/{consorcio_id}/gastos",
    response_model=GastoResponse,
    status_code=status.HTTP_201_CREATED
)
def registrar_gasto(
    consorcio_id: int,
    data: GastoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = GastoService(db)

    return service.crear(
        consorcio_id=consorcio_id,
        data=data,
        usuario=usuario
    )

# =========================
# LISTAR GASTOS
# =========================

@router.get(
    "/{consorcio_id}/gastos",
    response_model=list[GastoResponse]
)
def listar_gastos(
    consorcio_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = GastoService(db)

    return service.listar(
        consorcio_id=consorcio_id,
        usuario=usuario
    )



class ConsorcioRepository:

    def __init__(self, db: Session):
        self.db = db

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
                UsuarioConsorcio.rol
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