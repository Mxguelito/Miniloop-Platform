from decimal import Decimal

from pydantic import BaseModel, Field
from datetime import date


# =========================
# CREAR EXPENSA
# =========================

class ExpensaCreate(BaseModel):
    unidad_id: int

    mes: int = Field(
        ge=1,
        le=12
    )

    anio: int = Field(
        ge=2000
    )

    monto: Decimal = Field(
        gt=0
    )


# =========================
# RESPUESTA EXPENSA
# =========================

class ExpensaResponse(BaseModel):
    id: int

    liquidacion_id: int | None

    unidad_id: int
    unidad_identificador: str

   

    mes: int | None
    anio: int | None

    monto: Decimal
    estado: str
    fecha_pago: date | None

    model_config = {
        "from_attributes": True
    }


# =========================
# COMPROBANTE DE PAGO
# =========================

class ComprobantePagoResponse(BaseModel):
    comprobante_id: str

    expensa_id: int

    consorcio_id: int
    consorcio_nombre: str

    unidad_id: int
    unidad_identificador: str

    mes: int
    anio: int

    monto: Decimal

    fecha_pago: str

    estado: str