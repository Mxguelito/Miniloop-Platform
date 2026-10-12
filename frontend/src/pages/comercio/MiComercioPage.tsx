import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
   obtenerComercio,
   actualizarDisponibilidadPedidos,
   listarPedidosComercio,
 } from "../../services/api";


import type { Comercio } from "../../services/api";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";

import productos3d from "../../assets/merchant/productos-3d.png";
import pedidos3d from "../../assets/merchant/mis-pedidos-3d.png";
import informacion3d from "../../assets/merchant/informacion-3d.png";


function MiComercioPage() {
  const { id } = useParams();

  const [comercio, setComercio] =
    useState<Comercio | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

    const [actualizandoDisponibilidad, setActualizandoDisponibilidad] =
  useState(false);

  const [pedidosPendientes, setPedidosPendientes] = useState(0);


  // =========================
  // CARGAR COMERCIO
  // =========================

  useEffect(() => {
    const cargarComercio = async () => {
      try {
        setError("");

        const comercioId = Number(id);

        if (Number.isNaN(comercioId)) {
          throw new Error("Comercio inválido");
        }

       const [data, pedidos] = await Promise.all([
  obtenerComercio(comercioId),
  listarPedidosComercio(comercioId),
]);

setComercio(data);





const pendientes = pedidos.filter(
  (pedido) =>
    pedido.estado === "PENDIENTE" ||
    pedido.estado === "PREPARANDO"
);

setPedidosPendientes(pendientes.length);

setPedidosPendientes(pendientes.length);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }

      } finally {
        setCargando(false);
      }
    };

    cargarComercio();

  }, [id]);
  

  // =========================
// ACTUALIZAR DISPONIBILIDAD
// =========================

const handleActualizarDisponibilidad = async () => {
  if (!comercio) {
    return;
  }

  try {
    setActualizandoDisponibilidad(true);
    setError("");

    const nuevaDisponibilidad =
      comercio.disponibilidad_pedidos === "RECIBIENDO_PEDIDOS"
        ? "PAUSADO"
        : "RECIBIENDO_PEDIDOS";

    const comercioActualizado =
      await actualizarDisponibilidadPedidos(
        comercio.id,
        nuevaDisponibilidad
      );

    setComercio(comercioActualizado);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "No pudimos actualizar la disponibilidad"
    );
  } finally {
    setActualizandoDisponibilidad(false);
  }
};

  // =========================
  // CARGANDO
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


  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <PageContainer>

        <EmptyState
          title="No pudimos cargar el comercio"
          description={error}
        />

        <Link
          to="/comercios"
          className="back-link"
        >
          ← Volver a comercios
        </Link>

      </PageContainer>
    );
  }


  // =========================
  // NO ENCONTRADO
  // =========================

  if (!comercio) {
    return (
      <PageContainer>
        <EmptyState
          title="Comercio no encontrado"
          description="No encontramos el comercio que buscás."
        />
      </PageContainer>
    );
  }


  // =========================
  // PANTALLA
  // =========================

  return (
    <div className="merchant-world">

      <PageContainer>

        {/* =====================
            HEADER MINILOOP
        ===================== */}

        <div className="merchant-world-header">

          <span className="merchant-world-header__brand">
            MINILOOP
          </span>

          <Link
            className="merchant-world-header__back"
            to="/comercios"
          >
            ← COMERCIOS
          </Link>

        </div>


        {/* =====================
            COMERCIO
        ===================== */}

       <PageHeader
  title={comercio.nombre}
  description="Panel de administración"
/>


        {/* =====================
            INFORMACIÓN GENERAL
        ===================== */}

       <Card className="merchant-dashboard__info">

  <div>
    <span className="merchant-dashboard__label">
      Categoría
    </span>

    <strong>
      {comercio.categoria}
    </strong>
  </div>

  <div>
    <span className="merchant-dashboard__label">
      Estado
    </span>

    <StatusBadge
      status={comercio.estado}
    />
  </div>

  <div>
  <span className="merchant-dashboard__label">
    Pedidos
  </span>

  <strong>
    {comercio.disponibilidad_pedidos === "RECIBIENDO_PEDIDOS"
      ? "Recibiendo pedidos"
      : "Pausado"}
  </strong>

  <Button
    onClick={handleActualizarDisponibilidad}
    disabled={actualizandoDisponibilidad}
  >
    {actualizandoDisponibilidad
      ? "ACTUALIZANDO..."
      : comercio.disponibilidad_pedidos === "RECIBIENDO_PEDIDOS"
        ? "PAUSAR PEDIDOS"
        : "RECIBIR PEDIDOS"}
  </Button>
</div>

</Card>


        {/* =====================
            ADMINISTRAR
        ===================== */}

        <section className="merchant-dashboard">

          <div className="merchant-dashboard__heading">

            <h2>
              Administrar
            </h2>

            <p>
              Gestioná los productos, pedidos
              e información de tu comercio.
            </p>

          </div>


          <div className="merchant-dashboard__grid">


            {/* =====================
                PRODUCTOS
            ===================== */}

            <Card className="merchant-dashboard__card">

              <div>

                <div className="merchant-dashboard__visual">

                  <img
                    src={productos3d}
                    alt=""
                    className="merchant-dashboard__image"
                    aria-hidden="true"
                  />

                </div>

                <h3>
                  Productos
                </h3>

                <p>
                  Agregá productos, modificá precios
                  y administrá el stock.
                </p>

              </div>


              <Link
                to={`/mis-comercios/${id}/productos`}
                className="merchant-dashboard__link"
              >

                <Button>
                  Administrar productos
                </Button>

              </Link>

            </Card>


            {/* =====================
                PEDIDOS
            ===================== */}

            <Card className="merchant-dashboard__card merchant-dashboard__card--orders">

  {pedidosPendientes > 0 && (
    <span className="merchant-dashboard__notification">
      {pedidosPendientes}
    </span>
  )}

              <div>

                <div className="merchant-dashboard__visual">

                  <img
                    src={pedidos3d}
                    alt=""
                    className="
                      merchant-dashboard__image
                      merchant-dashboard__image--orders
                    "
                    aria-hidden="true"
                  />

                </div>

                <h3>
                  Pedidos
                </h3>

                <p>
                  Revisá los pedidos recibidos
                  y actualizá su estado.
                </p>

              </div>


              <Link
                to={`/mis-comercios/${id}/pedidos`}
                className="merchant-dashboard__link"
              >

                <Button>
                  Ver pedidos
                </Button>

              </Link>

            </Card>


            {/* =====================
                INFORMACIÓN
            ===================== */}

            <Card className="merchant-dashboard__card">

              <div>

                <div className="merchant-dashboard__visual">

                  <img
                    src={informacion3d}
                    alt=""
                    className="
                      merchant-dashboard__image
                      merchant-dashboard__image--info
                    "
                    aria-hidden="true"
                  />

                </div>

                <h3>
                  Información
                </h3>

                <p>
                  Administrá los datos principales
                  de tu comercio.
                </p>

              </div>


              <Button disabled>
                Próximamente
              </Button>

            </Card>

          </div>

        </section>

      </PageContainer>

    </div>
  );
}


export default MiComercioPage;