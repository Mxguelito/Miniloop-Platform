from datetime import datetime

from pydantic import BaseModel


class ComunicadoCreate(BaseModel):
    titulo: str
    mensaje: str


class ComunicadoResponse(BaseModel):
    id: int
    consorcio_id: int
    autor_id: int
    titulo: str
    mensaje: str
    fecha_creacion: datetime

    model_config = {
        "from_attributes": True
    }