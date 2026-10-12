from decimal import Decimal

from pydantic import BaseModel, Field


class ProductoCreate(BaseModel):
    nombre: str
    precio: Decimal = Field(gt=0)
    stock: int = Field(ge=0)


class ProductoUpdate(BaseModel):
    nombre: str
    precio: Decimal = Field(gt=0)
    stock: int = Field(ge=0)


class ProductoResponse(BaseModel):
    id: int
    comercio_id: int
    nombre: str
    precio: Decimal
    stock: int
    estado: str

    model_config = {
        "from_attributes": True
    }