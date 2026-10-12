from decimal import Decimal

from pydantic import BaseModel, Field


class UnidadCreate(BaseModel):
    identificador: str = Field(
        min_length=1,
        max_length=50
    )

    metros_cuadrados: Decimal | None = Field(
        default=None,
        gt=0
    )


class UnidadResponse(BaseModel):
    id: int
    consorcio_id: int
    identificador: str
    metros_cuadrados: Decimal | None

    model_config = {
        "from_attributes": True
    }