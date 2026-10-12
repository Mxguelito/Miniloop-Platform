from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth_dependency import (
    get_current_user,
    get_current_super_admin,
)
from models.usuario import Usuario
from services.entrega_service import EntregaService

from schemas.entrega import (
    EntregaResponse,
    EntregaDisponibleResponse,
    CodigoEntregaRequest,
    CodigoLlegadaResponse,
    CodigoRetiroResponse,
    CodigoFinalResponse,
    CodigoDevolucionResponse,
    LiberarEntregaRequest,
    ResolverSinRepartidorRequest,
    InspeccionDevolucionRequest,
    CrearIncidenciaEntregaRequest,
)
from schemas.incidencia_entrega import (
    IncidenciaEntregaResponse,
    ResolverIncidenciaRequest,
)

from schemas.ganancia_repartidor import MisGananciasResponse



router = APIRouter(
    prefix="/entregas",
    tags=["Entregas"]
)


# =========================
# REPARTIDOR - DISPONIBLES
# =========================

@router.get(
    "/disponibles",
    response_model=list[EntregaDisponibleResponse]
)
def listar_entregas_disponibles(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.listar_disponibles_para_repartidor(
        usuario_id=usuario.id
    )


# =========================
# REPARTIDOR - ENTREGA ACTIVA
# =========================

@router.get(
    "/activa",
    response_model=EntregaResponse | None
)
def obtener_entrega_activa(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.obtener_activa_del_repartidor(
        usuario_id=usuario.id
    )

# =========================
# REPARTIDOR - MIS GANANCIAS
# =========================

@router.get(
    "/mis-ganancias",
    response_model=MisGananciasResponse
)
def listar_mis_ganancias(
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user)
):
    service = EntregaService(db)

    return service.listar_mis_ganancias(
        usuario_id=usuario.id
    )

# =========================
# OBTENER ENTREGA POR ID
# =========================

@router.get(
    "/{entrega_id}",
    response_model=EntregaResponse
)
def obtener_entrega_por_id(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.obtener_por_id(
        entrega_id=entrega_id
    )

# =========================
# SUPER ADMIN - INCIDENCIAS
# =========================

@router.get(
    "/admin/incidencias",
    response_model=list[IncidenciaEntregaResponse]
)
def listar_incidencias_abiertas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_super_admin)
):
    service = EntregaService(db)

    return service.listar_incidencias_abiertas()


@router.patch(
    "/admin/incidencias/{incidencia_id}/resolver",
    response_model=IncidenciaEntregaResponse
)
def resolver_incidencia_admin(
    incidencia_id: int,
    datos: ResolverIncidenciaRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_super_admin)
):
    service = EntregaService(db)

    return service.resolver_incidencia_admin(
        incidencia_id=incidencia_id,
        resolucion=datos.resolucion
    )

@router.patch(
    "/admin/entregas/{entrega_id}/regenerar-codigo",
    response_model=EntregaResponse
)
def regenerar_codigo_admin(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_super_admin)
):
    service = EntregaService(db)

    return service.regenerar_codigo_admin(
        entrega_id=entrega_id
    )

# =========================
# CÓDIGOS DELIVERY
# =========================


# REPARTIDOR - CÓDIGO DE LLEGADA

@router.get(
    "/{entrega_id}/codigo-llegada",
    response_model=CodigoLlegadaResponse
)
def obtener_codigo_llegada(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.obtener_codigo_llegada(
        entrega_id=entrega_id,
        usuario_id=usuario.id
    )


# REPARTIDOR - CÓDIGO DE RETIRO

@router.get(
    "/{entrega_id}/codigo-retiro",
    response_model=CodigoRetiroResponse
)
def obtener_codigo_retiro(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.obtener_codigo_retiro(
        entrega_id=entrega_id,
        usuario_id=usuario.id
    )


# CLIENTE - CÓDIGO FINAL

@router.get(
    "/{entrega_id}/codigo-final",
    response_model=CodigoFinalResponse
)
def obtener_codigo_final(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.obtener_codigo_final(
        entrega_id=entrega_id,
        usuario_id=usuario.id
    )


# REPARTIDOR - CÓDIGO DE DEVOLUCIÓN

@router.get(
    "/{entrega_id}/codigo-devolucion",
    response_model=CodigoDevolucionResponse
)
def obtener_codigo_devolucion(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.obtener_codigo_devolucion(
        entrega_id=entrega_id,
        usuario_id=usuario.id
    )


# =========================
# REPARTIDOR - ACEPTAR
# =========================

@router.patch(
    "/{entrega_id}/aceptar",
    response_model=EntregaResponse
)
def aceptar_entrega(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.aceptar(
        entrega_id=entrega_id,
        usuario_id=usuario.id
    )

# =========================
# REPARTIDOR - EXTENDER LLEGADA
# =========================

@router.patch(
    "/{entrega_id}/extender-llegada",
    response_model=EntregaResponse
)
def extender_llegada_comercio(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.extender_llegada_comercio(
        entrega_id=entrega_id,
        usuario_id=usuario.id
    )


# =========================
# REPARTIDOR - LLEGAR AL COMERCIO
# =========================

@router.patch(
    "/{entrega_id}/llegar-comercio",
    response_model=EntregaResponse
)
def llegar_al_comercio(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.llegar_al_comercio(
        entrega_id=entrega_id,
        usuario_id=usuario.id
    )


# =========================
# COMERCIO - CONFIRMAR LLEGADA
# =========================

@router.patch(
    "/{entrega_id}/confirmar-llegada",
    response_model=EntregaResponse
)
def confirmar_llegada(
    entrega_id: int,
    data: CodigoEntregaRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.confirmar_llegada(
        entrega_id=entrega_id,
        usuario_id=usuario.id,
        codigo=data.codigo
    )


# =========================
# COMERCIO - CONFIRMAR RETIRO
# =========================

@router.patch(
    "/{entrega_id}/confirmar-retiro",
    response_model=EntregaResponse
)
def confirmar_retiro(
    entrega_id: int,
    data: CodigoEntregaRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.confirmar_retiro(
        entrega_id=entrega_id,
        usuario_id=usuario.id,
        codigo=data.codigo
    )


# =========================
# REPARTIDOR - INICIAR CAMINO
# =========================

@router.patch(
    "/{entrega_id}/iniciar-camino",
    response_model=EntregaResponse
)
def iniciar_camino(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.iniciar_camino(
        entrega_id=entrega_id,
        usuario_id=usuario.id
    )


# =========================
# REPARTIDOR - LLEGAR AL CLIENTE
# =========================

@router.patch(
    "/{entrega_id}/llegar-cliente",
    response_model=EntregaResponse
)
def llegar_al_cliente(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.llegar_al_cliente(
        entrega_id=entrega_id,
        usuario_id=usuario.id
    )


# =========================
# CLIENTE - CONFIRMAR ENTREGA FINAL
# =========================

@router.patch(
    "/{entrega_id}/confirmar-final",
    response_model=EntregaResponse
)
def confirmar_entrega_final(
    entrega_id: int,
    data: CodigoEntregaRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.confirmar_final(
        entrega_id=entrega_id,
        usuario_id=usuario.id,
        codigo=data.codigo
    )


# =========================
# REPARTIDOR - LIBERAR ENTREGA
# =========================

@router.patch(
    "/{entrega_id}/liberar",
    response_model=EntregaResponse
)
def liberar_entrega(
    entrega_id: int,
    data: LiberarEntregaRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.liberar(
        entrega_id=entrega_id,
        usuario_id=usuario.id,
        motivo=data.motivo
    )


# =========================
# CLIENTE - RESOLVER SIN REPARTIDOR
# =========================

@router.patch(
    "/{entrega_id}/resolver-sin-repartidor",
    response_model=EntregaResponse
)
def resolver_sin_repartidor(
    entrega_id: int,
    data: ResolverSinRepartidorRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.resolver_sin_repartidor(
        entrega_id=entrega_id,
        usuario_id=usuario.id,
        opcion=data.opcion
    )


# =========================
# REPARTIDOR - INICIAR DEVOLUCIÓN
# =========================

@router.patch(
    "/{entrega_id}/iniciar-devolucion",
    response_model=EntregaResponse
)
def iniciar_devolucion(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.iniciar_devolucion(
        entrega_id=entrega_id,
        usuario_id=usuario.id
    )


# =========================
# REPARTIDOR - LLEGAR CON DEVOLUCIÓN
# =========================

@router.patch(
    "/{entrega_id}/llegar-devolucion-comercio",
    response_model=EntregaResponse
)
def llegar_devolucion_al_comercio(
    entrega_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.llegar_devolucion_al_comercio(
        entrega_id=entrega_id,
        usuario_id=usuario.id
    )


# =========================
# COMERCIO - CONFIRMAR DEVOLUCIÓN
# =========================

@router.patch(
    "/{entrega_id}/confirmar-devolucion",
    response_model=EntregaResponse
)
def confirmar_devolucion(
    entrega_id: int,
    datos: CodigoEntregaRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.confirmar_devolucion(
        entrega_id=entrega_id,
        usuario_id=usuario.id,
        codigo=datos.codigo
    )


# =========================
# COMERCIO - INSPECCIONAR DEVOLUCIÓN
# =========================

@router.patch(
    "/{entrega_id}/inspeccionar-devolucion",
    response_model=EntregaResponse
)
def inspeccionar_devolucion(
    entrega_id: int,
    datos: InspeccionDevolucionRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    service = EntregaService(db)

    return service.inspeccionar_devolucion(
        entrega_id=entrega_id,
        usuario_id=usuario.id,
        resultado=datos.resultado
    )

@router.post(
    "/{entrega_id}/incidencias",
    status_code=201
)
def reportar_incidencia(
    entrega_id: int,
    datos: CrearIncidenciaEntregaRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return EntregaService(db).reportar_incidencia(
        entrega_id=entrega_id,
        usuario_id=usuario.id,
        tipo=datos.tipo,
        descripcion=datos.descripcion
    )