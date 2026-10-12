from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.comercio import Comercio
from models.producto import Producto
from repositories.producto_repository import ProductoRepository
from schemas.producto import ProductoCreate, ProductoUpdate


class ProductoService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = ProductoRepository(db)

    def crear(
        self,
        comercio_id: int,
        data: ProductoCreate
    ) -> Producto:

        comercio = (
            self.db.query(Comercio)
            .filter(Comercio.id == comercio_id)
            .first()
        )

        if not comercio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comercio no encontrado"
            )

        if comercio.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El comercio no está activo"
            )

        return self.repository.crear(
            comercio_id=comercio_id,
            nombre=data.nombre,
            precio=data.precio,
            stock=data.stock
        )

    def listar_por_comercio(
        self,
        comercio_id: int
    ) -> list[Producto]:

        comercio = (
            self.db.query(Comercio)
            .filter(Comercio.id == comercio_id)
            .first()
        )

        if not comercio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comercio no encontrado"
            )

        return self.repository.listar_por_comercio(
            comercio_id
        )

    def actualizar(
        self,
        comercio_id: int,
        producto_id: int,
        data: ProductoUpdate
    ) -> Producto:

        producto = self.repository.buscar_por_id(producto_id)

        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )

        if producto.comercio_id != comercio_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado en este comercio"
            )

        if producto.estado != "ACTIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El producto está inactivo"
            )

        return self.repository.actualizar(
            producto=producto,
            nombre=data.nombre,
            precio=data.precio,
            stock=data.stock
        )

    def desactivar(
        self,
        comercio_id: int,
        producto_id: int
    ) -> Producto:

        producto = self.repository.buscar_por_id(producto_id)

        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )

        if producto.comercio_id != comercio_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado en este comercio"
            )

        if producto.estado == "INACTIVO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El producto ya está inactivo"
            )

        return self.repository.desactivar(producto)