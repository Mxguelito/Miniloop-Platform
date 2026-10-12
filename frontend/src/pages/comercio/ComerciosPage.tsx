import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  crearComercio,
  listarComercios,
  listarMisComercios,
  listarZonas,
  listarPedidosComercio,
} from "../../services/api";

import type {
  Comercio,
  Zona,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import CommerceWorldCard from "../../components/commerce/CommerceWorldCard";
import miComercio3d from "../../assets/comercios/mi-comercio-3d.png";


type VistaComercios = "explorar" | "mios";

function ComerciosPage() {
  const [vista, setVista] =
    useState<VistaComercios>("explorar");

  const [comercios, setComercios] =
    useState<Comercio[]>([]);

  const [misComercios, setMisComercios] =
    useState<Comercio[]>([]);
    
  const [pedidosPorComercio, setPedidosPorComercio] =
  useState<Record<number, number>>({});

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [nombre, setNombre] =
    useState("");

  const [categoria, setCategoria] =
    useState("");

  const [direccion, setDireccion] =
    useState("");

  
  const [zonas, setZonas] =
  useState<Zona[]>([]);

  const [zonaId, setZonaId] =
  useState("");
  const [busqueda, setBusqueda] =
    useState("");

  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada,
  ] = useState("TODAS");

  // =========================
  // CARGAR DATOS
  // =========================

  const cargarDatos = async () => {
  try {
    setCargando(true);
    setError("");

    const [todos, mios, zonasDisponibles] =
      await Promise.all([
        listarComercios(),
        listarMisComercios(),
        listarZonas(),
      ]);

    setComercios(todos);
    setMisComercios(mios);
    setZonas(zonasDisponibles);

    const resultados = await Promise.all(
  mios.map(async (comercio) => {
    try {
      const pedidos = await listarPedidosComercio(comercio.id);

      const pendientes = pedidos.filter(
        (pedido) =>
          pedido.estado === "PENDIENTE" ||
          pedido.estado === "PREPARANDO"
      );

      return [comercio.id, pendientes.length] as const;
    } catch {
      return [comercio.id, 0] as const;
    }
  })
);

setPedidosPorComercio(Object.fromEntries(resultados));
    
  } catch (err) {
    if (err instanceof Error) {
      setError(err.message);
    }
  } finally {
    setCargando(false);
  }
};



  useEffect(() => {
    cargarDatos();
  }, []);

  // =========================
  // REGISTRAR COMERCIO
  // =========================

  const registrarComercio = async () => {
    try {
      setError("");

      const nombreLimpio =
        nombre.trim();

      const categoriaLimpia =
        categoria.trim();

      const direccionLimpia =
        direccion.trim();

      if (
        !nombreLimpio ||
        !categoriaLimpia ||
        !direccionLimpia ||
        !zonaId
      ) {
        setError(
          "Completá todos los campos para registrar el comercio."
        );

        return;
      }

      await crearComercio({
        nombre: nombreLimpio,
        categoria: categoriaLimpia,
        direccion: direccionLimpia,
        zona_id: Number(zonaId),
      });

      setNombre("");
      setCategoria("");
      setDireccion("");
      setZonaId("");

      setMostrarFormulario(false);

      await cargarDatos();

      setVista("mios");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  // =========================
  // CATEGORÍAS DISPONIBLES
  // =========================

  const categorias = [
    ...new Set(
      comercios
        .map(
          (comercio) =>
            comercio.categoria
        )
        .filter(Boolean)
    ),
  ];

  // =========================
  // FILTRAR COMERCIOS
  // =========================

  const comerciosFiltrados =
    comercios.filter((comercio) => {
      const termino =
        busqueda
          .trim()
          .toLowerCase();

      const coincideBusqueda =
        !termino ||
        comercio.nombre
          .toLowerCase()
          .includes(termino) ||
        comercio.categoria
          .toLowerCase()
          .includes(termino) ||
        comercio.direccion
          .toLowerCase()
          .includes(termino);

      const coincideCategoria =
        categoriaSeleccionada ===
          "TODAS" ||
        comercio.categoria ===
          categoriaSeleccionada;

      return (
        coincideBusqueda &&
        coincideCategoria
      );
    });

    const totalPedidosPendientes = Object.values(
  pedidosPorComercio
).reduce((total, cantidad) => total + cantidad, 0);

  // =========================
  // VISTA
  // =========================

  return (
    <div className="commerce-world">
      <PageContainer>

        <section className="commerce-page">

          {/* =========================
              HEADER MINILOOP
          ========================= */}

          <header className="commerce-world-header">

            <div className="commerce-world-header__top">

              <span className="commerce-world-header__brand">
                MINILOOP
              </span>

              <Link
                to="/app"
                className="commerce-world-header__back"
              >
                ← INICIO
              </Link>

            </div>

            <h1 className="commerce-world-header__title">
              Comercios
            </h1>

            <p className="commerce-world-header__description">
              Elegí dónde querés comprar.
            </p>

          </header>

          {/* =========================
              NAVEGACIÓN
          ========================= */}

          <div className="commerce-tabs">

            <Button
              variant={
                vista === "explorar"
                  ? "primary"
                  : "secondary"
              }
              onClick={() =>
                setVista("explorar")
              }
            >
              Explorar comercios
            </Button>

           
<div className="commerce-tabs__owned">
  <Button
    variant={vista === "mios" ? "primary" : "secondary"}
    onClick={() => setVista("mios")}
  >
    Mis comercios
  </Button>

  {totalPedidosPendientes > 0 && (
    <span className="merchant-dashboard__notification">
      {totalPedidosPendientes}
    </span>
  )}
</div>


          </div>

          {/* =========================
              FEEDBACK
          ========================= */}

          {error && (
            <div className="commerce-error">
              {error}
            </div>
          )}

          {cargando && (
            <div className="commerce-loading">
              Cargando comercios...
            </div>
          )}

          {/* =========================
              EXPLORAR
          ========================= */}

          {!cargando &&
            vista === "explorar" && (

            <section className="commerce-section">

              <div className="commerce-section__header">

                <h2>
                  Comercios disponibles
                </h2>

                <p>
                  Encontrá productos y
                  servicios cerca tuyo.
                </p>

              </div>

              {/* =========================
    BUSCADOR MINILOOP
========================= */}

<div className="commerce-search-panel">

  <label
    className="commerce-search-panel__label"
    htmlFor="buscar-comercio"
  >
    ¿Qué estás buscando?
  </label>

  <div className="commerce-search-panel__input-wrapper">

    <span
      className="commerce-search-panel__icon"
      aria-hidden="true"
    >
      🔎
    </span>

    <input
      id="buscar-comercio"
      type="text"
      className="commerce-search-panel__input"
      placeholder="Buscá un comercio, producto o categoría..."
      value={busqueda}
      onChange={(e) =>
        setBusqueda(e.target.value)
      }
    />

    {busqueda && (
      <button
        type="button"
        className="commerce-search-panel__clear"
        onClick={() => setBusqueda("")}
        aria-label="Limpiar búsqueda"
      >
        ×
      </button>
    )}

  </div>

</div>

              {/* =========================
                  CATEGORÍAS
              ========================= */}

              <div className="commerce-categories">

                <span className="commerce-categories__label">
                  Categorías
                </span>

                <div className="commerce-categories__options">

                  <Button
                    variant={
                      categoriaSeleccionada ===
                      "TODAS"
                        ? "primary"
                        : "secondary"
                    }
                    onClick={() =>
                      setCategoriaSeleccionada(
                        "TODAS"
                      )
                    }
                  >
                    Todas
                  </Button>

                  {categorias.map(
                    (categoria) => (

                    <Button
                      key={categoria}
                      variant={
                        categoriaSeleccionada ===
                        categoria
                          ? "primary"
                          : "secondary"
                      }
                      onClick={() =>
                        setCategoriaSeleccionada(
                          categoria
                        )
                      }
                    >
                      {categoria}
                    </Button>

                  ))}

                </div>

              </div>

              {/* =========================
                  MUNDO MINILOOP
              ========================= */}

              {comercios.length === 0 ? (

                <Card className="commerce-empty">

                  <div className="commerce-card__visual">
  <img
    src={miComercio3d}
    alt=""
    className="commerce-card__image"
    aria-hidden="true"
  />
</div>

                  <h3>
                    Todavía no hay comercios
                  </h3>

                  <p>
                    Cuando haya comercios
                    disponibles, los vas a
                    encontrar acá.
                  </p>

                </Card>

              ) : comerciosFiltrados.length ===
                0 ? (

                <Card className="commerce-empty">

                  <div className="commerce-empty__icon">
                    🔍
                  </div>

                  <h3>
                    No encontramos comercios
                  </h3>

                  <p>
                    Probá con otra búsqueda
                    o categoría.
                  </p>

                </Card>

              ) : (

                <div className="commerce-grid">

                  {comerciosFiltrados.map(
                    (comercio) => (

                    <CommerceWorldCard
                      key={comercio.id}
                      id={comercio.id}
                      nombre={comercio.nombre}
                      categoria={
                        comercio.categoria
                      }
                      direccion={
                        comercio.direccion
                      }
                    />

                  ))}

                </div>

              )}

            </section>

          )}

          {/* =========================
              MIS COMERCIOS
          ========================= */}

          {!cargando &&
            vista === "mios" && (

            <section className="commerce-section">

              <div className="commerce-section__header">

                <h2>
                  Mis comercios
                </h2>

                <p>
                  Administrá tus productos,
                  pedidos e información.
                </p>

              </div>

              {misComercios.length === 0 ? (

                <Card className="commerce-empty">

                  <div className="commerce-empty__icon">
                    🏪
                  </div>

                  <h3>
                    Todavía no tenés
                    comercios
                  </h3>

                  <p>
                    Registrá tu primer
                    comercio para empezar
                    a administrarlo.
                  </p>

                </Card>

              ) : (

                <div className="commerce-grid">

                  {misComercios.map(
                    (comercio) => (

                    <Card
  key={comercio.id}
  className="commerce-card commerce-card--owned"
>
  {(pedidosPorComercio[comercio.id] ?? 0) > 0 && (
    <span className="merchant-dashboard__notification">
      {pedidosPorComercio[comercio.id]}
    </span>
  )}

                     <div className="commerce-card__visual">
  <img
    src={miComercio3d}
    alt=""
    className="commerce-card__image"
    aria-hidden="true"
  />
</div>

                      <div className="commerce-card__content">

                        <h3>
                          {comercio.nombre}
                        </h3>

                        <span className="commerce-card__category">
                          {comercio.categoria}
                        </span>

                        <p className="commerce-card__status">
                          Estado:{" "}
                          <strong>
                            {comercio.estado}
                          </strong>
                        </p>

                      </div>

                      <Link
                        className="ui-button ui-button--secondary ui-button--full"
                        to={`/mis-comercios/${comercio.id}`}
                      >
                        Administrar
                      </Link>

                    </Card>

                  ))}

                </div>

              )}

              {/* =========================
                  REGISTRAR COMERCIO
              ========================= */}

              {!mostrarFormulario && (

                <div className="commerce-create">

                  <Button
                    onClick={() =>
                      setMostrarFormulario(
                        true
                      )
                    }
                  >
                    + Registrar comercio
                  </Button>

                </div>

              )}

              {mostrarFormulario && (

                <Card className="commerce-form-card">

                  <div className="commerce-form-card__header">

                    <h3>
                      Registrar comercio
                    </h3>

                    <p>
                      Completá los datos
                      básicos de tu negocio.
                    </p>

                  </div>

                  <div className="commerce-form">

                    <FormField
                      label="Nombre"
                      placeholder="Ej: Kiosco Central"
                      value={nombre}
                      onChange={(e) =>
                        setNombre(
                          e.target.value
                        )
                      }
                    />

                    <FormField
                      label="Categoría"
                      placeholder="Ej: Kiosco"
                      value={categoria}
                      onChange={(e) =>
                        setCategoria(
                          e.target.value
                        )
                      }
                    />

                    <FormField
                      label="Dirección"
                      placeholder="Ej: Av. Rivadavia 1200"
                      value={direccion}
                      onChange={(e) =>
                        setDireccion(
                          e.target.value
                        )
                      }
                    />

                    <div className="commerce-form__field">
  <label htmlFor="zona">
    Zona
  </label>

  <select
    id="zona"
    value={zonaId}
    onChange={(e) =>
      setZonaId(e.target.value)
    }
  >
    <option value="">
      Seleccioná una zona
    </option>

    {zonas.map((zona) => (
      <option
        key={zona.id}
        value={zona.id}
      >
        {zona.nombre}
      </option>
    ))}
  </select>
</div>

                    <div className="commerce-form__actions">

                      <Button
                        onClick={
                          registrarComercio
                        }
                      >
                        Crear comercio
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          setMostrarFormulario(
                            false
                          )
                        }
                      >
                        Cancelar
                      </Button>

                    </div>

                  </div>

                </Card>

              )}

            </section>

          )}

        </section>

      </PageContainer>
    </div>
  );
}

export default ComerciosPage;