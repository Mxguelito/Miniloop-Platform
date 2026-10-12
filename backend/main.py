from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.usuario_controller import router as usuario_router
from controllers.auth_controller import router as auth_router
from controllers.comercio_controller import router as comercio_router
from controllers.producto_controller import router as producto_router
from controllers.pedido_controller import router as pedido_router
from controllers.consorcio_controller import router as consorcio_router
from controllers.invitacion_consorcio_controller import (router as invitacion_consorcio_router)
from controllers.comunicado_controller import (router as comunicado_router)
from controllers.gasto_controller import (    router as gasto_router)
from controllers.ingreso_controller import (    router as ingreso_router)
from controllers.resumen_economico_controller import (    router as resumen_economico_router)
from controllers.unidad_controller import (    router as unidad_router)
from controllers.liquidacion_controller import (    router as liquidacion_router)
from controllers.expensa_controller import router as expensa_router
from controllers.repartidor_controller import router as repartidor_router
from controllers.zona_controller import router as zona_router
from controllers.entrega_controller import router as entrega_router
from controllers.calificacion_repartidor_controller import (    router as calificacion_repartidor_router,)


app = FastAPI( title="MiniLoop API",    version="0.1.0")


app.add_middleware(    CORSMiddleware, allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(usuario_router)
app.include_router(auth_router)
app.include_router(comercio_router)
app.include_router(producto_router)
app.include_router(pedido_router)
app.include_router(consorcio_router)
app.include_router(invitacion_consorcio_router)
app.include_router(comunicado_router)
app.include_router(gasto_router)
app.include_router(ingreso_router)
app.include_router(resumen_economico_router)
app.include_router(unidad_router)
app.include_router(liquidacion_router)
app.include_router(expensa_router)
app.include_router(repartidor_router)
app.include_router(zona_router)
app.include_router(entrega_router)
app.include_router(calificacion_repartidor_router)


@app.get("/")
def root():
    return {
        "message": "MiniLoop API",
        "status": "online"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }