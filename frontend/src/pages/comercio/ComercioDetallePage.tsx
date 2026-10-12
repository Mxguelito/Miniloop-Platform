import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  crearPedido,
  listarProductos,
  obtenerComercio,
} from "../../services/api";

import type {
  Comercio,
  Producto,
} from "../../services/api";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import ProductCard from "../../components/products/ProductCard";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

function ComercioDetallePage() {
  const { id } = useParams();
  const comercioId = Number(id);

  const [comercio, setComercio] =
    useState<Comercio | null>(null);

  const [productos, setProductos] =
    useState<Producto[]>([]);

  const [carrito, setCarrito] =
    useState<ItemCarrito[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [busqueda, setBusqueda] =
    useState("");

    const [tipoEntrega, setTipoEntrega] =
  useState<"RETIRO" | "DELIVERY">("RETIRO");

const [destino, setDestino] =
  useState("");

  // =========================
  // CARGAR DATOS
  // =========================

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setError("");

        const [
          comercioData,
          productosData,
        ] = await Promise.all([
          obtenerComercio(comercioId),
          listarProductos(comercioId),
        ]);

        setComercio(comercioData);



        setProductos(
  productosData.filter(
    (producto) =>
      producto.estado === "ACTIVO"
  )
);


      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [comercioId]);

  // =========================
  // BUSCAR PRODUCTOS
  // =========================

  const productosFiltrados =
    productos.filter((producto) => {
      const termino =
        busqueda.trim().toLowerCase();

      if (!termino) {
        return true;
      }

      return producto.nombre
        .toLowerCase()
        .includes(termino);
    });

  // =========================
  // AGREGAR PRODUCTO
  // =========================

  const agregarProducto = (
    producto: Producto
  ) => {
    setMensaje("");

    setCarrito((actual) => {
      const existente = actual.find(
        (item) =>
          item.producto.id === producto.id
      );

      if (existente) {
        if (
          existente.cantidad >= producto.stock
        ) {
          return actual;
        }

        return actual.map((item) =>
          item.producto.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
              }
            : item
        );
      }

      return [
        ...actual,
        {
          producto,
          cantidad: 1,
        },
      ];
    });
  };

  // =========================
  // QUITAR PRODUCTO
  // =========================

  const quitarProducto = (
    productoId: number
  ) => {
    setCarrito((actual) =>
      actual
        .map((item) =>
          item.producto.id === productoId
            ? {
                ...item,
                cantidad: item.cantidad - 1,
              }
            : item
        )
        .filter(
          (item) => item.cantidad > 0
        )
    );
  };

  // =========================
  // CANTIDAD DEL PRODUCTO
  // =========================

  const obtenerCantidad = (
    productoId: number
  ) => {
    return (
      carrito.find(
        (item) =>
          item.producto.id === productoId
      )?.cantidad ?? 0
    );
  };

  // =========================
  // TOTAL
  // =========================

  const total = carrito.reduce(
    (acumulado, item) =>
      acumulado +
      Number(item.producto.precio) *
        item.cantidad,
    0
  );

  // =========================
  // CONFIRMAR PEDIDO
  // =========================

  const confirmarPedido = async () => {
    try {
      setError("");
      setMensaje("");

      if (carrito.length === 0) {
        setError(
          "Agregá al menos un producto."
        );
        return;
      }

      if (
  tipoEntrega === "DELIVERY" &&
  !destino.trim()
) {
  setError(
    "Ingresá la dirección de entrega."
  );
  return;
}

      const pedido = await crearPedido(
  comercioId,
  {
    items: carrito.map((item) => ({
      producto_id: item.producto.id,
      cantidad: item.cantidad,
    })),
    tipo_entrega: tipoEntrega,
    destino:
      tipoEntrega === "DELIVERY"
        ? destino.trim()
        : null,
  }
);



      setCarrito([]);
      setTipoEntrega("RETIRO");
setDestino("");

      setMensaje(
        `Pedido #${pedido.id} creado correctamente`
      );



      const productosActualizados =
  await listarProductos(comercioId);

setProductos(
  productosActualizados.filter(
    (producto) =>
      producto.estado === "ACTIVO"
  )
);



    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  // =========================
  // ESTADOS DE PANTALLA
  // =========================

  if (cargando) {
    return (
      <PageContainer>
        <LoadingState
          message="Cargando comercio..."
        />
      </PageContainer>
    );
  }

  if (error && !comercio) {
    return (
      <PageContainer>
        <EmptyState
          title="No pudimos abrir el comercio"
          description={error}
        />

        <Link
          className="back-link"
          to="/comercios"
        >
          ← Volver a comercios
        </Link>
      </PageContainer>
    );
  }

  if (!comercio) {
    return null;
  }

  // =========================
  // PANTALLA
  // =========================

  return (
    <div className="commerce-detail-world">
      <PageContainer>

        <Link
          className="back-link"
          to="/comercios"
        >
          ← Volver a comercios
        </Link>

        <PageHeader
          title={comercio.nombre}
          description={
            `${comercio.categoria} · ${comercio.direccion}`
          }
        />

        {/* =====================
            PRODUCTOS
        ===================== */}

        <section className="products-section">
          <h2>¿Qué necesitás?</h2>

          {productos.length > 0 && (
            <div className="product-search">
              <label htmlFor="buscar-producto">
                Buscar producto
              </label>

              <input
                id="buscar-producto"
                type="text"
                placeholder="Ej: Coca Cola, pan, leche..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
              />
            </div>
          )}

          {productos.length === 0 ? (
            <EmptyState
              title="No hay productos disponibles"
              description={
                "Este comercio todavía no tiene " +
                "productos para pedir."
              }
            />
          ) : productosFiltrados.length === 0 ? (
            <EmptyState
              title="No encontramos ese producto"
              description="Probá buscando con otro nombre."
            />
          ) : (
            <div className="products-grid">
              {productosFiltrados.map(
                (producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    cantidad={
                      obtenerCantidad(
                        producto.id
                      )
                    }
                    onAgregar={
                      agregarProducto
                    }
                    onQuitar={
                      quitarProducto
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* =====================
            TU PEDIDO
        ===================== */}

        <section className="cart-section">
          <h2>Tu pedido</h2>

          {carrito.length === 0 &&
            !mensaje && (
              <EmptyState
                title="Tu pedido está vacío"
                description={
                  "Elegí un producto y tocá Agregar."
                }
              />
            )}

          {carrito.length > 0 && (
            <Card className="cart-card">

              <div className="cart-card__items">
                {carrito.map((item) => (
                  <div
                    className="cart-item"
                    key={item.producto.id}
                  >
                    <div>
                      <strong>
                        {item.producto.nombre}
                      </strong>

                      <p>
                        {item.cantidad} × $
                        {Number(
                          item.producto.precio
                        ).toFixed(2)}
                      </p>
                    </div>

                    <strong>
                      $
                      {(
                        Number(
                          item.producto.precio
                        ) * item.cantidad
                      ).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="cart-card__total">
                <span>Total</span>

                <strong>
                  ${total.toFixed(2)}
                </strong>
              </div>

              {/* =====================
    TIPO DE ENTREGA
===================== */}

<div className="cart-delivery-options">

  <p>
    ¿Cómo querés recibir tu pedido?
  </p>

  <label>
    <input
      type="radio"
      name="tipo-entrega"
      value="RETIRO"
      checked={tipoEntrega === "RETIRO"}
      onChange={() => {
        setTipoEntrega("RETIRO");
        setDestino("");
      }}
    />

    RETIRO
  </label>

  <label>
    <input
      type="radio"
      name="tipo-entrega"
      value="DELIVERY"
      checked={tipoEntrega === "DELIVERY"}
      onChange={() =>
        setTipoEntrega("DELIVERY")
      }
    />

    DELIVERY
  </label>

</div>

{tipoEntrega === "DELIVERY" && (
  <div className="cart-delivery-address">

    <label htmlFor="direccion-delivery">
      Dirección de entrega
    </label>

    <input
      id="direccion-delivery"
      type="text"
      value={destino}
      onChange={(e) =>
        setDestino(e.target.value)
      }
      placeholder="Ej: Av. Rivadavia 1234"
    />

  </div>
)}


              <Button
                fullWidth
                onClick={confirmarPedido}
              >
                Confirmar pedido
              </Button>

            </Card>
          )}
        </section>

        {/* =====================
            MENSAJES
        ===================== */}

        {mensaje && (
          <div
            className="success-message"
            role="status"
          >
            {mensaje}
          </div>
        )}

        {error && (
          <div
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}

      </PageContainer>
    </div>
  );
}

export default ComercioDetallePage;