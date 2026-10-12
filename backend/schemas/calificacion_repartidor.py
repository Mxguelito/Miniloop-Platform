from datetime import datetime

from pydantic import BaseModel, Field


class CalificacionRepartidorCreate(BaseModel):
    puntuacion: int = Field(
        ge=1,
        le=5
    )

    comentario: str | None = None


class CalificacionRepartidorResponse(BaseModel):
    id: int
    entrega_id: int
    repartidor_id: int
    usuario_id: int
    puntuacion: int
    comentario: str | None
    fecha_creacion: datetime

    model_config = {
        "from_attributes": True
    }