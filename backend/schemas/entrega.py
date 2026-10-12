from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel



class EntregaResponse(BaseModel):
    id: int
    pedido_id: int
    repartidor_id: int | None
    zona_id: int
    estado: str
    destino: str
    costo_delivery: Decimal
    ganancia_repartidor: Decimal
    cantidad_liberaciones: int
    fecha_creacion: datetime
    fecha_llegada_cliente: datetime | None = None

    model_config = {
        "from_attributes": True
    }


class EntregaDisponibleResponse(BaseModel):
    id: int
    pedido_id: int
    zona_id: int
    estado: str
    costo_delivery: Decimal
    ganancia_repartidor: Decimal
    cantidad_liberaciones: int
    fecha_creacion: datetime

    model_config = {"from_attributes": True}

class CodigoEntregaRequest(BaseModel):
    codigo: str


class LiberarEntregaRequest(BaseModel):
    motivo: str


class ResolverSinRepartidorRequest(BaseModel):
    opcion: str


class InspeccionDevolucionRequest(BaseModel):
    resultado: str


class CrearIncidenciaEntregaRequest(BaseModel):
    tipo: str
    descripcion: str | None = None


class CodigoLlegadaResponse(BaseModel):
    entrega_id: int
    codigo_llegada: str


class CodigoRetiroResponse(BaseModel):
    entrega_id: int
    codigo_retiro: str


class CodigoFinalResponse(BaseModel):
    entrega_id: int
    codigo_final: str


class CodigoDevolucionResponse(BaseModel):
    entrega_id: int
    codigo_devolucion: str