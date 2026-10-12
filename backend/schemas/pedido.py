from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


# =========================
# CREAR PEDIDO
# =========================

class PedidoItemCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)


class PedidoCreate(BaseModel):

    items: list[PedidoItemCreate] = Field(
        min_length=1
    )

    tipo_entrega: str = "RETIRO"

    destino: str | None = None


# =========================
# USUARIO DENTRO DEL PEDIDO
# =========================

class UsuarioPedidoResponse(BaseModel):
    id: int
    nombre: str

    model_config = {
        "from_attributes": True
    }


# =========================
# COMERCIO DENTRO DEL PEDIDO
# =========================

class ComercioPedidoResponse(BaseModel):
    id: int
    nombre: str

    model_config = {
        "from_attributes": True
    }


# =========================
# PRODUCTO DENTRO DEL PEDIDO
# =========================

class ProductoPedidoResponse(BaseModel):
    id: int
    nombre: str

    model_config = {
        "from_attributes": True
    }


# =========================
# ITEM DEL PEDIDO
# =========================

class PedidoItemResponse(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal
    producto: ProductoPedidoResponse

    model_config = {
        "from_attributes": True
    }


# =========================
# PEDIDO - RESPUESTA SIMPLE
# =========================

class PedidoResponse(BaseModel):
    id: int
    usuario_id: int
    comercio_id: int
    estado: str
    tipo_entrega: str
    entrega_id: int | None = None
    total: Decimal
    fecha_creacion: datetime
    usuario: UsuarioPedidoResponse
    comercio: ComercioPedidoResponse

    model_config = {
        "from_attributes": True
    }


# =========================
# PEDIDO - DETALLE COMPLETO
# =========================

class PedidoDetalleResponse(BaseModel):
    id: int
    usuario_id: int
    comercio_id: int
    estado: str
    tipo_entrega: str
    entrega_id: int | None = None
    total: Decimal
    fecha_creacion: datetime
    usuario: UsuarioPedidoResponse
    comercio: ComercioPedidoResponse
    items: list[PedidoItemResponse]

    model_config = {
        "from_attributes": True
    }

# =========================
# CAMBIAR ESTADO
# =========================

class PedidoEstadoUpdate(BaseModel):
    estado: str


class PedidoCancelarComercioRequest(BaseModel):
    motivo: str