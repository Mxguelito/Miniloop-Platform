import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  cambiarEstadoPedido,
  listarPedidosComercio,
} from "../../services/api";

import type { Pedido } from "../../services/api";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";


function PedidosComercioPage() {

  const { id } = useParams();

  const comercioId = Number(id);

  const [pedidos, setPedidos] =
    useState<Pedido[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [actualizandoId, setActualizandoId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");


  // =========================
  // CARGAR PEDIDOS
  // =========================

  const cargarPedidos = async () => {

    try {

      setError("");

      if (Number.isNaN(comercioId)) {
        throw new Error(
          "Comercio inválido"
        );
      }

      const data =
        await listarPedidosComercio(
          comercioId
        );

      setPedidos(data);

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setCargando(false);
    }
  };


  useEffect(() => {
    cargarPedidos();
  }, [comercioId]);


  // =========================
  // CAMBIAR ESTADO
  // =========================

  const cambiarEstado = async (
    pedidoId: number,
    nuevoEstado: string
  ) => {

    try {

      setError("");
      setActualizandoId(pedidoId);

      await cambiarEstadoPedido(
        pedidoId,
        nuevoEstado
      );

      await cargarPedidos();

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setActualizandoId(null);
    }
  };


  // =========================
  // ACCIÓN DEL PEDIDO
  // =========================

  const renderAccion = (
    pedido: Pedido
  ) => {

    const actualizando =
      actualizandoId === pedido.id;


    if (pedido.estado === "PENDIENTE") {

      return (
        <Button
          fullWidth
          disabled={actualizando}
          onClick={() =>
            cambiarEstado(
              pedido.id,
              "PREPARANDO"
            )
          }
        >
          {actualizando
            ? "Actualizando..."
            : "Empezar a preparar"}
        </Button>
      );
    }


    if (pedido.estado === "PREPARANDO") {

      return (
        <Button
          fullWidth
          disabled={actualizando}
          onClick={() =>
            cambiarEstado(
              pedido.id,
              "LISTO"
            )
          }
        >
          {actualizando
            ? "Actualizando..."
            : "Marcar como listo"}
        </Button>
      );
    }


    if (pedido.estado === "LISTO") {

      return (
        <Button
          fullWidth
          disabled={actualizando}
          onClick={() =>
            cambiarEstado(
              pedido.id,
              "ENTREGADO"
            )
          }
        >
          {actualizando
            ? "Actualizando..."
            : "Marcar como entregado"}
        </Button>
      );
    }


    if (pedido.estado === "ENTREGADO") {

      return (
        <div className="order-state-message order-state-message--success">
          Pedido completado
        </div>
      );
    }


    if (pedido.estado === "CANCELADO") {

      return (
        <div className="order-state-message order-state-message--cancelled">
          Pedido cancelado
        </div>
      );
    }


    return null;
  };


  // =========================
  // PANTALLA
  // =========================

  return (
    <PageContainer>

      <Link
        className="back-link"
        to={`/mis-comercios/${comercioId}`}
      >
        ← Volver al comercio
      </Link>


      <PageHeader
        title="Pedidos recibidos"
        description={
          "Prepará y entregá tus pedidos desde acá."
        }
      />


      {/* CARGANDO */}

      {cargando && (

        <LoadingState
          message="Cargando pedidos..."
        />

      )}


      {/* ERROR */}

      {!cargando && error && (

        <EmptyState
          title="No pudimos cargar los pedidos"
          description={error}
        />

      )}


      {/* SIN PEDIDOS */}

      {!cargando &&
        !error &&
        pedidos.length === 0 && (

          <EmptyState
            title="Todavía no recibiste pedidos"
            description={
              "Cuando un cliente haga un pedido, aparecerá acá."
            }
          />

        )}


      {/* PEDIDOS */}

      {!cargando &&
        !error &&
        pedidos.length > 0 && (

          <section className="merchant-orders-list">

            {pedidos.map((pedido) => (

              <Card
                className="merchant-order-card"
                key={pedido.id}
              >

                <div className="merchant-order-card__header">

                  <div>

                    <span className="order-card__number">
                      Pedido #{pedido.id}
                    </span>

                    <h2 className="merchant-order-card__customer">
                      {pedido.usuario.nombre}
                    </h2>

                  </div>


                  <StatusBadge
                    status={pedido.estado}
                  />

                </div>


               <div className="merchant-order-card__info">

  <div className="merchant-order-card__info-item">

    <span>
      Total
    </span>

    <strong>
      $
      {Number(
        pedido.total
      ).toLocaleString(
        "es-AR",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}
    </strong>

  </div>


  <div className="merchant-order-card__info-item">

    <span>
      Fecha
    </span>

    <strong>
      {new Date(
        pedido.fecha_creacion
      ).toLocaleDateString(
        "es-AR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      )}
    </strong>

  </div>

</div>

                <div className="merchant-order-card__actions">

                  <Link
                    className="merchant-order-card__detail"
                    to={
                      `/mis-comercios/${comercioId}` +
                      `/pedidos/${pedido.id}`
                    }
                  >
                    Ver pedido
                  </Link>


                  <div className="merchant-order-card__main-action">
                    {renderAccion(pedido)}
                  </div>

                </div>

              </Card>

            ))}

          </section>

        )}


      {error && pedidos.length > 0 && (

        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>

      )}

    </PageContainer>
  );
}


export default PedidosComercioPage;