from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


# =========================
# GANANCIA INDIVIDUAL
# =========================

class GananciaRepartidorResponse(BaseModel):
    id: int
    entrega_id: int
    monto: Decimal
    fecha_creacion: datetime

    model_config = {
        "from_attributes": True
    }


# =========================
# RESUMEN DE MIS GANANCIAS
# =========================

class MisGananciasResponse(BaseModel):
    total_ganado: Decimal
    cantidad_entregas: int
    ganancias: list[GananciaRepartidorResponse]