from pydantic import BaseModel, ConfigDict
from decimal import Decimal


class RepartidorCreate(BaseModel):
    zona_id: int
    transporte: str


class RepartidorResponse(BaseModel):
    id: int
    usuario_id: int
    zona_id: int
    transporte: str
    disponibilidad: str
    estado: str

    model_config = ConfigDict(from_attributes=True)


class EstadisticasRepartidorResponse(BaseModel):
    entregas_completadas: int
    ganancia_total: Decimal
    calificacion_promedio: float | None
    cantidad_calificaciones: int
    bono_pendiente: Decimal