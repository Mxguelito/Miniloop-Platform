from sqlalchemy.orm import Session

from models.consorcio import Consorcio
from models.usuario import Usuario
from repositories.consorcio_repository import ConsorcioRepository
from repositories.unidad_repository import UnidadRepository
from schemas.consorcio import ConsorcioCreate
from fastapi import HTTPException, status

class ConsorcioService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = ConsorcioRepository(db)
        self.unidad_repository = UnidadRepository(db)

    # =========================
    # CREAR CONSORCIO
    # =========================

    def crear(
        self,
        data: ConsorcioCreate,
        usuario: Usuario
    ) -> Consorcio:

        return self.repository.crear(
            nombre=data.nombre,
            direccion=data.direccion,
            usuario_id=usuario.id
        )

        # =========================
    # MIS CONSORCIOS
    # =========================

    def listar_del_usuario(
        self,
        usuario: Usuario
    ) -> list[Consorcio]:

        return self.repository.listar_por_usuario(
            usuario.id
        )
    def obtener_del_usuario(
    self,
    consorcio_id: int,
    usuario: Usuario
         ):

     consorcio = (
        self.repository.buscar_para_usuario(
            consorcio_id,
            usuario.id
        )
    )

     if not consorcio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consorcio no encontrado"
        )

     rol = self.repository.obtener_rol_usuario(
        consorcio_id,
        usuario.id
      )

     return {
        "id": consorcio.id,
        "nombre": consorcio.nombre,
        "direccion": consorcio.direccion,
        "estado": consorcio.estado,
        "rol": rol
    }

    # =========================
    # LISTAR MIEMBROS
    # =========================

    def listar_miembros(
        self,
        consorcio_id: int,
        usuario: Usuario
    ):
        consorcio = self.repository.buscar_para_usuario(
            consorcio_id,
            usuario.id
        )

        if not consorcio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consorcio no encontrado"
            )

        resultados = self.repository.listar_miembros(
            consorcio_id
        )

        return [
    {
        "id": miembro.id,
        "nombre": miembro.nombre,
        "email": miembro.email,
        "rol": rol,
        "unidad_id": unidad_id
    }
    for miembro, rol, unidad_id in resultados
]

    # =========================
# ASIGNAR UNIDAD A USUARIO
# =========================

    def asignar_unidad(
    self,
    consorcio_id: int,
    usuario_id: int,
    unidad_id: int,
    usuario: Usuario
   ):
    # 1. Verificar administrador
     if not self.repository.es_administrador(
        consorcio_id,
        usuario.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés permisos para asignar unidades"
        )

    # 2. Verificar que la unidad pertenezca al consorcio
     unidades = (
        self.unidad_repository
        .listar_por_consorcio(consorcio_id)
     )

     unidad = next(
        (
            unidad
            for unidad in unidades
            if unidad.id == unidad_id
        ),
        None
     )

     if not unidad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unidad no encontrada en este consorcio"
        )

     # 3. Asignar unidad al usuario
     relacion = self.repository.asignar_unidad(
        consorcio_id=consorcio_id,
        usuario_id=usuario_id,
        unidad_id=unidad_id
     )
 
     if not relacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

     return {
        "usuario_id": relacion.usuario_id,
        "consorcio_id": relacion.consorcio_id,
        "unidad_id": relacion.unidad_id,
        "mensaje": "Unidad asignada correctamente"
    }