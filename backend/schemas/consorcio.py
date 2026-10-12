from pydantic import BaseModel


class ConsorcioCreate(BaseModel):
    nombre: str
    direccion: str


class ConsorcioResponse(BaseModel):
    id: int
    nombre: str
    direccion: str
    estado: str
    rol: str | None = None

    model_config = {
        "from_attributes": True
    }


class MiembroConsorcioResponse(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str
    unidad_id: int | None = None