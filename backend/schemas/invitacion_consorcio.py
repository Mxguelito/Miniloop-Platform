from datetime import datetime

from pydantic import BaseModel


# =========================
# UNIRSE CON CÓDIGO
# =========================

class UnirseConsorcioRequest(BaseModel):
    codigo: str


# =========================
# RESPUESTA INVITACIÓN
# =========================

class InvitacionConsorcioResponse(BaseModel):
    id: int
    consorcio_id: int
    creada_por: int
    codigo: str
    estado: str
    fecha_creacion: datetime

    model_config = {
        "from_attributes": True
    }