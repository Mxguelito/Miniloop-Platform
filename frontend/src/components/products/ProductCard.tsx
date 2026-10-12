import type { Producto } from "../../services/api";

import Button from "../ui/Button";
import Card from "../ui/Card";

import producto3d from "../../assets/productos/producto-3d.png";

interface ProductCardProps {
  producto: Producto;
  cantidad: number;
  onAgregar: (producto: Producto) => void;
  onQuitar: (productoId: number) => void;
}

function ProductCard({
  producto,
  cantidad,
  onAgregar,
  onQuitar,
}: ProductCardProps) {
  const disponible =
    producto.estado === "ACTIVO" &&
    producto.stock > 0;

  const puedeAgregar =
    disponible &&
    cantidad < producto.stock;

  return (
    <Card className="product-card">

      {/* IMAGEN GENÉRICA DEL PRODUCTO */}
      <div className="product-card__visual">
        <img
          src={producto3d}
          alt=""
          className="product-card__image"
          aria-hidden="true"
        />
      </div>

      <div className="product-card__content">
        <div>
          <h2 className="product-card__name">
            {producto.nombre}
          </h2>

          <p className="product-card__price">
            ${Number(producto.precio).toFixed(2)}
          </p>

          <p className="product-card__stock">
            {disponible
              ? `${producto.stock} disponibles`
              : "SIN STOCK"}
          </p>
        </div>

        {disponible && cantidad === 0 && (
          <Button
            onClick={() =>
              onAgregar(producto)
            }
          >
            + Agregar
          </Button>
        )}

        {disponible && cantidad > 0 && (
          <div
            className="product-card__quantity"
            aria-label={
              `Cantidad de ${producto.nombre}`
            }
          >
            <Button
              variant="secondary"
              aria-label={
                `Quitar una unidad de ${producto.nombre}`
              }
              onClick={() =>
                onQuitar(producto.id)
              }
            >
              −
            </Button>

            <strong>
              {cantidad}
            </strong>

            <Button
              aria-label={
                `Agregar una unidad de ${producto.nombre}`
              }
              disabled={!puedeAgregar}
              onClick={() =>
                onAgregar(producto)
              }
            >
              +
            </Button>
          </div>
        )}
      </div>

    </Card>
  );
}

export default ProductCard;