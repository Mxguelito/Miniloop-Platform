from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.producto import (
    ProductoCreate,
    ProductoResponse,
    ProductoUpdate,
)
from services.producto_service import ProductoService


router = APIRouter(
    prefix="/comercios/{comercio_id}/productos",
    tags=["Productos"]
)


@router.post(
    "",
    response_model=ProductoResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_producto(
    comercio_id: int,
    data: ProductoCreate,
    db: Session = Depends(get_db)
):
    service = ProductoService(db)

    return service.crear(
        comercio_id=comercio_id,
        data=data
    )


@router.get(
    "",
    response_model=list[ProductoResponse]
)
def listar_productos(
    comercio_id: int,
    db: Session = Depends(get_db)
):
    service = ProductoService(db)

    return service.listar_por_comercio(
        comercio_id
    )


@router.put(
    "/{producto_id}",
    response_model=ProductoResponse
)
def actualizar_producto(
    comercio_id: int,
    producto_id: int,
    data: ProductoUpdate,
    db: Session = Depends(get_db)
):
    service = ProductoService(db)

    return service.actualizar(
        comercio_id=comercio_id,
        producto_id=producto_id,
        data=data
    )


@router.patch(
    "/{producto_id}/desactivar",
    response_model=ProductoResponse
)
def desactivar_producto(
    comercio_id: int,
    producto_id: int,
    db: Session = Depends(get_db)
):
    service = ProductoService(db)

    return service.desactivar(
        comercio_id=comercio_id,
        producto_id=producto_id
    )