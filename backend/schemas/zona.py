from pydantic import BaseModel


class ZonaResponse(BaseModel):
    id: int
    nombre: str
    estado: str

    model_config = {
        "from_attributes": True
    }