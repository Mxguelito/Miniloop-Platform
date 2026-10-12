from decimal import Decimal

from pydantic import BaseModel


class ResumenEconomicoResponse(BaseModel):
    total_ingresos: Decimal
    total_gastos: Decimal
    saldo: Decimal