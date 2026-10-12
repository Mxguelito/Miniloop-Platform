from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse

from database import get_db
from dependencies.auth_dependency import get_current_user
from utils.comprobante_pdf import generar_comprobante_pago_pdf
from models.usuario import Usuario
from schemas.expensa import (
    ExpensaCreate,
    ExpensaResponse,
    ComprobantePagoResponse,
)
from services.expensa_service import ExpensaService


router = APIRouter(
    prefix="/consorcios",
    tags=["Expensas"]
)


# =========================
# CREAR EXPENSA MANUAL
# =========================

@router.post(
    "/{consorcio_id}/expensas",
    response_model=ExpensaResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_expensa(
    consorcio_id: int,
    data: ExpensaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ExpensaService(db)

    expensa = service.crear(
        consorcio_id=consorcio_id,
        data=data,
        usuario=usuario
    )

    return ExpensaResponse(
        id=expensa.id,
        liquidacion_id=expensa.liquidacion_id,
        unidad_id=expensa.unidad_id,

        # Temporalmente.
        # Luego devolveremos el identificador real.
        unidad_identificador="",

        mes=expensa.mes,
        anio=expensa.anio,
        monto=expensa.monto,
        estado=expensa.estado,
        fecha_pago=expensa.fecha_pago
    )


# =========================
# LISTAR EXPENSAS POR PERÍODO
# =========================

@router.get(
    "/{consorcio_id}/expensas",
    response_model=list[ExpensaResponse]
)
def listar_expensas(
    consorcio_id: int,
    mes: int,
    anio: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ExpensaService(db)

    expensas = service.listar_por_periodo(
        consorcio_id=consorcio_id,
        mes=mes,
        anio=anio,
        usuario=usuario
    )

    return [
        ExpensaResponse(
            id=expensa.id,
            liquidacion_id=expensa.liquidacion_id,
            unidad_id=expensa.unidad_id,
            unidad_identificador=(
                expensa.unidad.identificador
            ),
            mes=expensa.mes,
            anio=expensa.anio,
            monto=expensa.monto,
            estado=expensa.estado,
            fecha_pago=expensa.fecha_pago
        )
        for expensa in expensas
    ]


# =========================
# REGISTRAR PAGO DE EXPENSA
# =========================

@router.patch(
    "/{consorcio_id}/expensas/{expensa_id}/pagar",
    response_model=ExpensaResponse
)
def registrar_pago_expensa(
    consorcio_id: int,
    expensa_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ExpensaService(db)

    expensa = service.registrar_pago(
        consorcio_id=consorcio_id,
        expensa_id=expensa_id,
        usuario=usuario
    )

    return ExpensaResponse(
        id=expensa.id,
        liquidacion_id=expensa.liquidacion_id,
        unidad_id=expensa.unidad_id,
        unidad_identificador=(
            expensa.unidad.identificador
        ),
        mes=expensa.mes,
        anio=expensa.anio,
        monto=expensa.monto,
        estado=expensa.estado,
        fecha_pago=expensa.fecha_pago
    )


# =========================
# LISTAR MIS EXPENSAS
# =========================

@router.get(
    "/{consorcio_id}/expensas/mias",
    response_model=list[ExpensaResponse]
)
def listar_mis_expensas(
    consorcio_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ExpensaService(db)

    expensas = service.listar_mis_expensas(
        consorcio_id=consorcio_id,
        usuario=usuario
    )

    return [
        ExpensaResponse(
            id=expensa.id,
            liquidacion_id=expensa.liquidacion_id,
            unidad_id=expensa.unidad_id,
            unidad_identificador=(
                expensa.unidad.identificador
            ),
            mes=expensa.mes,
            anio=expensa.anio,
            monto=expensa.monto,
            estado=expensa.estado,
            fecha_pago=expensa.fecha_pago
        )
        for expensa in expensas
    ]


# =========================
# OBTENER COMPROBANTE DE PAGO
# =========================

@router.get(
    "/{consorcio_id}/expensas/{expensa_id}/comprobante",
    response_model=ComprobantePagoResponse
)
def obtener_comprobante_pago(
    consorcio_id: int,
    expensa_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = ExpensaService(db)

    return service.obtener_comprobante_pago(
        consorcio_id=consorcio_id,
        expensa_id=expensa_id,
        usuario=usuario
    )


# =========================
# DESCARGAR COMPROBANTE PDF
# =========================

@router.get(
    "/{consorcio_id}/expensas/{expensa_id}/comprobante/pdf"
)
def descargar_comprobante_pdf(
    consorcio_id: int,
    expensa_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        get_current_user
    )
):
    service = ExpensaService(db)

    # =========================
    # 1. OBTENER COMPROBANTE
    # =========================

    comprobante = (
        service.obtener_comprobante_pago(
            consorcio_id=consorcio_id,
            expensa_id=expensa_id,
            usuario=usuario
        )
    )

    # =========================
    # 2. GENERAR PDF
    # =========================

    pdf = generar_comprobante_pago_pdf(
        comprobante
    )

    # =========================
    # 3. DEVOLVER ARCHIVO
    # =========================

    nombre_archivo = (
        f"comprobante-expensa-"
        f"{expensa_id}.pdf"
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'attachment; filename="{nombre_archivo}"'
        }
    )