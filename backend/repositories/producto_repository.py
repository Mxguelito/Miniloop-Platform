from decimal import Decimal

from sqlalchemy.orm import Session

from models.producto import Producto


class ProductoRepository:

    def __init__(self, db: Session):
        self.db = db

    def crear(
        self,
        comercio_id: int,
        nombre: str,
        precio: Decimal,
        stock: int
    ) -> Producto:

        producto = Producto(
            comercio_id=comercio_id,
            nombre=nombre,
            precio=precio,
            stock=stock,
            estado="ACTIVO"
        )

        self.db.add(producto)
        self.db.commit()
        self.db.refresh(producto)

        return producto

    def listar_por_comercio(
        self,
        comercio_id: int
    ) -> list[Producto]:

        return (
            self.db.query(Producto)
            .filter(Producto.comercio_id == comercio_id)
            .all()
        )

    def buscar_por_id(
        self,
        producto_id: int
    ) -> Producto | None:

        return (
            self.db.query(Producto)
            .filter(Producto.id == producto_id)
            .first()
        )

    def actualizar(
        self,
        producto: Producto,
        nombre: str,
        precio: Decimal,
        stock: int
    ) -> Producto:

        producto.nombre = nombre
        producto.precio = precio
        producto.stock = stock

        self.db.commit()
        self.db.refresh(producto)

        return producto

    def desactivar(
        self,
        producto: Producto
    ) -> Producto:

        producto.estado = "INACTIVO"

        self.db.commit()
        self.db.refresh(producto)

        return producto