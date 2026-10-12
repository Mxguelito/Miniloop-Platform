from pydantic import BaseModel


class ComercioCreate(BaseModel):
    nombre: str
    categoria: str
    direccion: str
    zona_id: int


class ComercioResponse(BaseModel):
    id: int
    nombre: str
    categoria: str
    direccion: str
    zona_id: int | None
    estado: str
    disponibilidad_pedidos: str

    model_config = {
        "from_attributes": True
    }


class ComercioDisponibilidadUpdate(BaseModel):
    disponibilidad_pedidos: str