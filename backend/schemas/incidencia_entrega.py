from datetime import datetime

from pydantic import BaseModel


class IncidenciaEntregaResponse(BaseModel):
    id: int
    entrega_id: int
    usuario_id: int
    tipo: str
    descripcion: str | None
    estado: str
    resolucion: str | None
    fecha_creacion: datetime
    fecha_resolucion: datetime | None

    model_config = {
        "from_attributes": True
    }


class ResolverIncidenciaRequest(BaseModel):
    resolucion: str