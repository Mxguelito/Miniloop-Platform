import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  actualizarProducto,
  crearProducto,
  desactivarProducto,
  listarProductos,
} from "../../services/api";

import type { Producto } from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";
import producto3d from "../../assets/products/mis-productos-3d.png";


function ProductosComercioPage() {
  const { id } = useParams();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");

  const [productoEditando, setProductoEditando] =
    useState<Producto | null>(null);

  const [nombreEditar, setNombreEditar] = useState("");
  const [precioEditar, setPrecioEditar] = useState("");
  const [stockEditar, setStockEditar] = useState("");

  const comercioId = Number(id);


  // =========================
  // CARGAR PRODUCTOS
  // =========================

  const cargarProductos = async () => {
    try {
      setError("");

      if (Number.isNaN(comercioId)) {
        throw new Error("Comercio inválido");
      }

      const data = await listarProductos(comercioId);

      setProductos(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setCargando(false);
    }
  };


  useEffect(() => {
    cargarProductos();
  }, [id]);


  // =========================
  // CREAR PRODUCTO
  // =========================

  const guardarProducto = async () => {
    try {
      setError("");

      if (!nombre.trim()) {
        setError("Ingresá el nombre del producto");
        return;
      }

      const precioNumero = Number(precio);
      const stockNumero = Number(stock);

      if (precioNumero <= 0) {
        setError("El precio debe ser mayor a 0");
        return;
      }

      if (stockNumero < 0) {
        setError("El stock no puede ser negativo");
        return;
      }

      await crearProducto(comercioId, {
        nombre: nombre.trim(),
        precio: precioNumero,
        stock: stockNumero,
      });

      setNombre("");
      setPrecio("");
      setStock("");
      setMostrarFormulario(false);

      await cargarProductos();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };


  // =========================
  // EDITAR
  // =========================

  const comenzarEdicion = (producto: Producto) => {
    setError("");

    setProductoEditando(producto);

    setNombreEditar(producto.nombre);
    setPrecioEditar(String(producto.precio));
    setStockEditar(String(producto.stock));

    setMostrarFormulario(false);
  };


  const cancelarEdicion = () => {
    setProductoEditando(null);
    setNombreEditar("");
    setPrecioEditar("");
    setStockEditar("");
  };


  const guardarEdicion = async () => {
    try {
      setError("");

      if (!productoEditando) {
        return;
      }

      if (!nombreEditar.trim()) {
        setError("Ingresá el nombre del producto");
        return;
      }

      const precioNumero = Number(precioEditar);
      const stockNumero = Number(stockEditar);

      if (precioNumero <= 0) {
        setError("El precio debe ser mayor a 0");
        return;
      }

      if (stockNumero < 0) {
        setError("El stock no puede ser negativo");
        return;
      }

      await actualizarProducto(
        comercioId,
        productoEditando.id,
        {
          nombre: nombreEditar.trim(),
          precio: precioNumero,
          stock: stockNumero,
        }
      );

      cancelarEdicion();

      await cargarProductos();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };


  // =========================
  // DESACTIVAR
  // =========================

  const manejarDesactivar = async (
    producto: Producto
  ) => {
    try {
      setError("");

      const confirmar = window.confirm(
        `¿Querés desactivar "${producto.nombre}"?`
      );

      if (!confirmar) {
        return;
      }

      await desactivarProducto(
        comercioId,
        producto.id
      );

      await cargarProductos();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };


 return (
  <div className="merchant-products-world">
    <PageContainer>

      <div className="merchant-products-header">
        <span className="merchant-products-header__brand">
          MINILOOP
        </span>

        <Link
          className="merchant-products-header__back"
          to={`/mis-comercios/${id}`}
        >
          ← COMERCIO
        </Link>
      </div>


      <PageHeader
        title="Productos"
        description="Administrá los productos, precios y stock de tu comercio."
        action={
          !mostrarFormulario ? (
            <button
              className="merchant-products__add-button"
              onClick={() => {
                cancelarEdicion();
                setMostrarFormulario(true);
              }}
            >
              + Agregar producto
            </button>
          ) : undefined
        }
      />


      {error && (
        <div
          className="merchant-products__error"
          role="alert"
        >
          {error}
        </div>
      )}


      {/* =========================
          NUEVO PRODUCTO
      ========================= */}

      {mostrarFormulario && (
        <section className="merchant-product-form">

          <div className="merchant-product-form__header">
            <div>
              <h2>Nuevo producto</h2>

              <p>
                Completá los datos para agregarlo
                a tu comercio.
              </p>
            </div>
          </div>


          <div className="merchant-product-form__fields">

            <label>
              <span>Nombre</span>

              <input
                type="text"
                placeholder="Ej: Coca Cola"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
              />
            </label>


            <label>
              <span>Precio</span>

              <input
                type="number"
                placeholder="0"
                min="0"
                value={precio}
                onChange={(e) =>
                  setPrecio(e.target.value)
                }
              />
            </label>


            <label>
              <span>Stock</span>

              <input
                type="number"
                placeholder="0"
                min="0"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
              />
            </label>

          </div>


          <div className="merchant-product-form__actions">

            <button
              className="merchant-product-button merchant-product-button--secondary"
              onClick={() => {
                setMostrarFormulario(false);

                setNombre("");
                setPrecio("");
                setStock("");
              }}
            >
              Cancelar
            </button>

            <button
              className="merchant-product-button merchant-product-button--primary"
              onClick={guardarProducto}
            >
              Guardar producto
            </button>

          </div>

        </section>
      )}


      {/* =========================
          LISTADO
      ========================= */}

      <section className="merchant-products">

        <div className="merchant-products__heading">

          <div>
            <h2>Mis productos</h2>

            {!cargando && (
              <p>
                {productos.length}{" "}
                {productos.length === 1
                  ? "producto cargado"
                  : "productos cargados"}
              </p>
            )}
          </div>

        </div>


        {cargando && (
          <LoadingState
            message="Cargando productos..."
          />
        )}


        {!cargando &&
          !error &&
          productos.length === 0 && (

            <EmptyState
              title="Todavía no tenés productos"
              description="Agregá tu primer producto para empezar a vender."
            />

          )}


        {!cargando &&
          productos.length > 0 && (

            <div className="merchant-products__grid">

              {productos.map((producto) => (

                <article
                  className="merchant-product-card"
                  key={producto.id}
                >

                  {productoEditando?.id ===
                  producto.id ? (

                    /* =====================
                       EDICIÓN
                    ===================== */

                    <div className="merchant-product-edit">

                      <div className="merchant-product-edit__header">
                        <span>✏️</span>
                        <h3>Editar producto</h3>
                      </div>


                      <div className="merchant-product-edit__fields">

                        <label>
                          <span>Nombre</span>

                          <input
                            type="text"
                            value={nombreEditar}
                            onChange={(e) =>
                              setNombreEditar(
                                e.target.value
                              )
                            }
                          />
                        </label>


                        <label>
                          <span>Precio</span>

                          <input
                            type="number"
                            min="0"
                            value={precioEditar}
                            onChange={(e) =>
                              setPrecioEditar(
                                e.target.value
                              )
                            }
                          />
                        </label>


                        <label>
                          <span>Stock</span>

                          <input
                            type="number"
                            min="0"
                            value={stockEditar}
                            onChange={(e) =>
                              setStockEditar(
                                e.target.value
                              )
                            }
                          />
                        </label>

                      </div>


                      <div className="merchant-product-edit__actions">

                        <button
                          className="merchant-product-button merchant-product-button--secondary"
                          onClick={cancelarEdicion}
                        >
                          Cancelar
                        </button>

                        <button
                          className="merchant-product-button merchant-product-button--primary"
                          onClick={guardarEdicion}
                        >
                          Guardar cambios
                        </button>

                      </div>

                    </div>

                  ) : (

                    /* =====================
                       PRODUCTO
                    ===================== */

                    <div className="merchant-product-card__content">

                      <div className="merchant-product-card__top">

                        <div className="merchant-product-card__visual">
  <img
    src={producto3d}
    alt=""
    className="merchant-product-card__image"
    aria-hidden="true"
  />
</div>

                        <span
                          className={
                            producto.estado === "ACTIVO"
                              ? "merchant-product-status merchant-product-status--active"
                              : "merchant-product-status merchant-product-status--inactive"
                          }
                        >
                          {producto.estado === "ACTIVO"
                            ? "Activo"
                            : "Inactivo"}
                        </span>

                      </div>


                      <h3>{producto.nombre}</h3>


                      <div className="merchant-product-card__data">

                        <div>
                          <span>Precio</span>

                          <strong>
                            $
                            {Number(
                              producto.precio
                            ).toLocaleString(
                              "es-AR",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </strong>
                        </div>


                        <div>
                          <span>Stock</span>

                          <strong>
                            {producto.stock}
                          </strong>
                        </div>

                      </div>


                      {producto.estado === "ACTIVO" && (

                        <div className="merchant-product-card__actions">

                          <button
                            className="merchant-product-button merchant-product-button--secondary"
                            onClick={() =>
                              comenzarEdicion(producto)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="merchant-product-button merchant-product-button--danger"
                            onClick={() =>
                              manejarDesactivar(producto)
                            }
                          >
                            Desactivar
                          </button>

                        </div>

                      )}

                    </div>

                  )}

                </article>

              ))}

            </div>

          )}

          </section>

    </PageContainer>
  </div>
);
}

export default ProductosComercioPage;