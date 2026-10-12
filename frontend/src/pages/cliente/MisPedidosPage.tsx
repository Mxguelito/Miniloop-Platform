import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listarMisPedidos } from "../../services/api";
import type { Pedido } from "../../services/api";

import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";

import OrderCard from "../../components/orders/OrderCard";


function MisPedidosPage() {

  const [pedidos, setPedidos] =
    useState<Pedido[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // CARGAR PEDIDOS
  // =========================

  useEffect(() => {

    const cargarPedidos = async () => {

      try {

        setError("");

        const data =
          await listarMisPedidos();

        setPedidos(data);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "No se pudieron cargar tus pedidos."
          );
        }

      } finally {

        setCargando(false);

      }
    };


    cargarPedidos();

  }, []);


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      {/* =========================
          VOLVER
      ========================= */}

      <Link
        className="back-link"
        to="/app"
      >
        ← Volver al inicio
      </Link>


      {/* =========================
          ENCABEZADO
      ========================= */}

      <header className="customer-orders-header">

        <span className="customer-orders-header__eyebrow">
          TUS COMPRAS
        </span>

        <h1 className="customer-orders-header__title">
          Mis pedidos
        </h1>

        <p className="customer-orders-header__description">
          Revisá tus compras y seguí el estado
          de cada pedido fácilmente.
        </p>

      </header>


      {/* =========================
          CARGANDO
      ========================= */}

      {cargando && (

        <LoadingState
          message="Cargando tus pedidos..."
        />

      )}


      {/* =========================
          ERROR
      ========================= */}

      {!cargando && error && (

        <EmptyState
          title="No pudimos cargar tus pedidos"
          description={error}
        />

      )}


      {/* =========================
          SIN PEDIDOS
      ========================= */}

      {!cargando &&
        !error &&
        pedidos.length === 0 && (

          <EmptyState
            title="Todavía no tenés pedidos"
            description={
              "Cuando hagas una compra, " +
              "vas a poder seguirla desde acá."
            }
          />

        )}


      {/* =========================
          PEDIDOS
      ========================= */}

      {!cargando &&
        !error &&
        pedidos.length > 0 && (

          <section className="customer-orders-section">

            <div className="customer-orders-summary">

              <div>

                <h2>
                  Historial de pedidos
                </h2>

                <p>
                  Todos tus pedidos en un solo lugar.
                </p>

              </div>


              <div className="customer-orders-count">

                <strong>
                  {pedidos.length}
                </strong>

                <span>
                  {pedidos.length === 1
                    ? "pedido"
                    : "pedidos"}
                </span>

              </div>

            </div>


            <div className="orders-list">

              {pedidos.map((pedido) => (

                <OrderCard
                  key={pedido.id}
                  pedido={pedido}
                />

              ))}

            </div>

          </section>

        )}

    </PageContainer>
  );
}


export default MisPedidosPage;