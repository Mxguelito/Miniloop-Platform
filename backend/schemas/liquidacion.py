from datetime import date
from decimal import Decimal
from schemas.expensa import ExpensaResponse

from pydantic import BaseModel, Field


class LiquidacionCreate(BaseModel):
    mes: int = Field(
        ge=1,
        le=12
    )

    anio: int = Field(
        ge=2000
    )


class LiquidacionResponse(BaseModel):
    id: int
    consorcio_id: int
    mes: int
    anio: int
    total_gastos: Decimal
    fecha_generacion: date
    estado: str

    model_config = {
        "from_attributes": True
    }

class LiquidacionDetalleResponse(BaseModel):
    id: int
    consorcio_id: int
    mes: int
    anio: int
    total_gastos: Decimal
    fecha_generacion: date
    estado: str

    expensas: list[ExpensaResponse]