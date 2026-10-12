from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import get_current_user
from models.usuario import Usuario
from schemas.pedido import (
    PedidoCreate,
    PedidoDetalleResponse,
    PedidoEstadoUpdate,
    PedidoResponse,
    PedidoCancelarComercioRequest,
)
from services.pedido_service import PedidoService


router = APIRouter(
    tags=["Pedidos"]
)


# =========================
# CLIENTE - CREAR PEDIDO
# =========================

@router.post(
    "/comercios/{comercio_id}/pedidos",
    response_model=PedidoResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_pedido(
    comercio_id: int,
    data: PedidoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = PedidoService(db)

    return service.crear(
        usuario_id=usuario.id,
        comercio_id=comercio_id,
        data=data
    )


# =========================
# CLIENTE - MIS PEDIDOS
# =========================

@router.get(
    "/pedidos/mios",
    response_model=list[PedidoResponse]
)
def listar_mis_pedidos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = PedidoService(db)

    return service.listar_del_usuario(
        usuario_id=usuario.id
    )


# =========================
# CLIENTE - DETALLE PEDIDO
# =========================

@router.get(
    "/pedidos/{pedido_id}",
    response_model=PedidoDetalleResponse
)
def obtener_mi_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = PedidoService(db)

    return service.obtener_del_usuario(
        pedido_id=pedido_id,
        usuario_id=usuario.id
    )


# =========================
# CLIENTE - CANCELAR PEDIDO
# =========================

@router.patch(
    "/pedidos/{pedido_id}/cancelar",
    response_model=PedidoResponse
)
def cancelar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = PedidoService(db)

    return service.cancelar(
        pedido_id=pedido_id,
        usuario_id=usuario.id
    )


# =========================
# COMERCIO - PEDIDOS RECIBIDOS
# =========================

@router.get(
    "/comercios/{comercio_id}/pedidos",
    response_model=list[PedidoResponse]
)
def listar_pedidos_comercio(
    comercio_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = PedidoService(db)

    return service.listar_del_comercio(
        comercio_id=comercio_id,
        usuario_id=usuario.id
    )


# =========================
# COMERCIO - DETALLE PEDIDO
# =========================

@router.get(
    "/comercios/{comercio_id}/pedidos/{pedido_id}",
    response_model=PedidoDetalleResponse
)
def obtener_pedido_comercio(
    comercio_id: int,
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = PedidoService(db)

    return service.obtener_del_comercio(
        pedido_id=pedido_id,
        comercio_id=comercio_id,
        usuario_id=usuario.id
    )


# =========================
# COMERCIO - CAMBIAR ESTADO
# =========================

@router.patch(
    "/pedidos/{pedido_id}/estado",
    response_model=PedidoResponse
)
def cambiar_estado_pedido(
    pedido_id: int,
    data: PedidoEstadoUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = PedidoService(db)

    return service.cambiar_estado(
        pedido_id=pedido_id,
        nuevo_estado=data.estado,
        usuario_id=usuario.id
    )

# =========================
# COMERCIO - CANCELAR PEDIDO
# =========================

@router.patch(
    "/pedidos/{pedido_id}/cancelar-comercio",
    response_model=PedidoResponse
)
def cancelar_pedido_comercio(
    pedido_id: int,
    data: PedidoCancelarComercioRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = PedidoService(db)

    return service.cancelar_por_comercio(
        pedido_id=pedido_id,
        usuario_id=usuario.id,
        motivo=data.motivo
    )