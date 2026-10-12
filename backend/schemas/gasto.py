from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field


class GastoCreate(BaseModel):
    concepto: str = Field(
        min_length=1,
        max_length=150
    )

    monto: Decimal = Field(
        gt=0
    )

    fecha: date


class GastoResponse(BaseModel):
    id: int
    consorcio_id: int
    concepto: str
    monto: Decimal
    fecha: date

    model_config = {
        "from_attributes": True
    }