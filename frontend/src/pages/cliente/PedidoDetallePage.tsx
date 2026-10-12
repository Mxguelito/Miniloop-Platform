import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  cancelarPedido,
  obtenerPedido,
  obtenerCodigoFinal,
  calificarRepartidor,
} from "../../services/api";

import type {
  PedidoDetalle,
} from "../../services/api";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import StatusBadge from "../../components/ui/StatusBadge";

import miniloopOrderStore from "../../assets/orders/miniloop-order-store.png";


function PedidoDetallePage() {

  const { id } = useParams();

  const [pedido, setPedido] =
    useState<PedidoDetalle | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [cancelando, setCancelando] =
    useState(false);

  const [error, setError] =
    useState("");

    const [codigoFinal, setCodigoFinal] =
  useState<string | null>(null);



  const [puntuacion, setPuntuacion] =
  useState<number>(5);

const [comentarioCalificacion, setComentarioCalificacion] =
  useState("");

const [calificando, setCalificando] =
  useState(false);

const [calificacionEnviada, setCalificacionEnviada] =
  useState(false);


  // =========================
  // CARGAR PEDIDO
  // =========================

  const cargarPedido = async () => {
    try {
      setError("");

      const pedidoId = Number(id);

      if (Number.isNaN(pedidoId)) {
        throw new Error("Pedido inválido");
      }

      const data =
        await obtenerPedido(pedidoId);

      setPedido(data);

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setCargando(false);
    }
  };


  useEffect(() => {
    cargarPedido();
  }, [id]);


  // =========================
  // CANCELAR
  // =========================

  const handleCancelarPedido =
    async () => {

      if (!pedido) {
        return;
      }

      const confirmar =
        window.confirm(
          "¿Querés cancelar este pedido?"
        );

      if (!confirmar) {
        return;
      }

      try {
        setError("");
        setCancelando(true);

        await cancelarPedido(
          pedido.id
        );

        await cargarPedido();

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        }

      } finally {
        setCancelando(false);
      }
    };

    // =========================
// OBTENER CÓDIGO FINAL
// =========================

const handleObtenerCodigoFinal = async () => {
  if (!pedido?.entrega_id) {
    setError("Este pedido no tiene una entrega asociada");
    return;
  }

  try {
    setError("");

    const data = await obtenerCodigoFinal(
      pedido.entrega_id
    );

    setCodigoFinal(data.codigo_final);

  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "No pudimos obtener el código final"
    );
  }
};


const handleCalificarRepartidor = async () => {
  if (!pedido?.entrega_id) {
    return;
  }

  try {
    setCalificando(true);
    setError("");

    await calificarRepartidor(
      pedido.entrega_id,
      {
        puntuacion,
        comentario:
          comentarioCalificacion.trim() || null,
      }
    );

    setCalificacionEnviada(true);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "No pudimos registrar la calificación"
    );
  } finally {
    setCalificando(false);
  }
};

  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>

        <LoadingState
          message="Cargando tu pedido..."
        />

      </PageContainer>
    );
  }


  // =========================
  // ERROR
  // =========================

  if (error && !pedido) {
    return (
      <PageContainer>

        <Link
          className="back-link"
          to="/mis-pedidos"
        >
          ← Volver a mis pedidos
        </Link>

        <EmptyState
          title="No pudimos abrir el pedido"
          description={error}
        />

      </PageContainer>
    );
  }


  // =========================
  // SIN PEDIDO
  // =========================

  if (!pedido) {
    return (
      <PageContainer>

        <EmptyState
          title="Pedido no encontrado"
          description="No encontramos el pedido que buscás."
        />

      </PageContainer>
    );
  }


  // =========================
  // PRESENTACIÓN
  // =========================

  const puedeCancelar =
    pedido.estado === "PENDIENTE" ||
    pedido.estado === "PREPARANDO";


  const fecha =
    new Date(
      pedido.fecha_creacion
    ).toLocaleString(
      "es-AR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );


  return (
    <PageContainer>

      <Link
        className="back-link"
        to="/mis-pedidos"
      >
        ← Volver a mis pedidos
      </Link>


      {/* =====================
          HEADER
      ===================== */}

      <section className="customer-order-header">

        <div>

          <span className="customer-order-header__eyebrow">
            Detalle de compra
          </span>

          <h1>
            Pedido #{pedido.id}
          </h1>

          <p>
            {fecha}
          </p>

        </div>


        <StatusBadge
          status={pedido.estado}
        />

      </section>


      {/* =====================
          COMERCIO
      ===================== */}

      <Card className="customer-order-store">

      <div className="customer-order-store__icon">
  <img
    src={miniloopOrderStore}
    alt=""
    className="customer-order-store__image"
    aria-hidden="true"
  />
</div>
        <div>

          <span>
            Comercio
          </span>

          <h2>
            {pedido.comercio.nombre}
          </h2>

          <p>
            Tu pedido fue realizado correctamente.
          </p>

        </div>

      </Card>


      {/* =====================
          PRODUCTOS
      ===================== */}

      <Card className="order-detail-card">

        <div className="order-detail-card__header">

          <div>

            <span className="order-detail-card__eyebrow">
              Detalle
            </span>

            <h2>
              Tu compra
            </h2>

          </div>


          <span className="order-detail-card__count">

            {pedido.items.length}{" "}

            {pedido.items.length === 1
              ? "producto"
              : "productos"}

          </span>

        </div>


        <div className="order-detail__items">

          {pedido.items.map((item) => (

            <div
              className="order-detail__item"
              key={item.id}
            >

              <div className="order-detail__product">

                <div className="order-detail__product-icon">
                  📦
                </div>


                <div className="order-detail__item-info">

                  <strong>
                    {item.producto.nombre}
                  </strong>

                  <span>
                    {item.cantidad}
                    {" × $"}

                    {Number(
                      item.precio_unitario
                    ).toLocaleString(
                      "es-AR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>

                </div>

              </div>


              <strong className="order-detail__subtotal">

                $

                {Number(
                  item.subtotal
                ).toLocaleString(
                  "es-AR",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}

              </strong>

            </div>

          ))}

        </div>


        <div className="order-detail__total">

          <div>

            <strong>
              Total del pedido
            </strong>

            <span>
              Importe total de la compra
            </span>

          </div>


          <strong className="order-detail__total-price">

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

      </Card>

      {/* =====================
    CÓDIGO FINAL DELIVERY
===================== */}

{pedido.tipo_entrega === "DELIVERY" &&
  pedido.entrega_id &&
  pedido.estado !== "ENTREGADO" &&
  pedido.estado !== "CANCELADO" && (

    <Card className="customer-order-delivery-code">

      <div>
        <span>
          Delivery
        </span>

        <h2>
          Código final
        </h2>

        {!codigoFinal ? (
          <Button
            onClick={handleObtenerCodigoFinal}
          >
            MOSTRAR CÓDIGO FINAL
          </Button>
       
     ) : (
  <div>
    <p>
      Tu código final es:
    </p>

    <strong>
      {codigoFinal}
    </strong>

  </div>
)}


      </div>

    </Card>
)}




{/* =====================
    CALIFICACIÓN DELIVERY
===================== */}

{pedido.tipo_entrega === "DELIVERY" &&
  pedido.estado === "ENTREGADO" &&
  pedido.entrega_id &&
  !calificacionEnviada && (
    <Card className="delivery-rating">
      <div className="delivery-rating__header">
        <span className="delivery-rating__eyebrow">
          TU EXPERIENCIA
        </span>

        <h2>¿Cómo fue tu entrega?</h2>

        <p>
          Calificá al repartidor y ayudanos a mejorar
          la experiencia de MiniLoop.
        </p>
      </div>

      <div className="delivery-rating__stars">
        {[1, 2, 3, 4, 5].map((estrella) => (
          <button
            key={estrella}
            type="button"
            className={`delivery-rating__star ${
              estrella <= puntuacion
                ? "delivery-rating__star--active"
                : ""
            }`}
            onClick={() => setPuntuacion(estrella)}
            aria-label={`Calificar con ${estrella} estrellas`}
            aria-pressed={puntuacion === estrella}
            disabled={calificando}
          >
            {estrella <= puntuacion ? "★" : "☆"}
          </button>
        ))}
      </div>

      <p className="delivery-rating__score">
        {puntuacion} de 5 estrellas
      </p>

      <div className="delivery-rating__field">
        <label htmlFor="comentario-delivery">
          Contanos tu experiencia
        </label>

        <textarea
          id="comentario-delivery"
          value={comentarioCalificacion}
          onChange={(e) =>
            setComentarioCalificacion(e.target.value)
          }
          placeholder="¿Cómo fue la atención del repartidor? (opcional)"
          rows={4}
          disabled={calificando}
        />
      </div>

      <Button
        onClick={handleCalificarRepartidor}
        disabled={calificando}
      >
        {calificando
          ? "Enviando..."
          : "Enviar calificación"}
      </Button>
    </Card>
  )}

{calificacionEnviada && (
  <Card className="delivery-rating delivery-rating--success">
    <div className="delivery-rating__success-icon">
      ✓
    </div>

    <h2>¡Gracias por calificar!</h2>

    <p>
      Tu opinión sobre la entrega fue registrada
      correctamente.
    </p>
  </Card>
)}


      {/* =====================
          CANCELAR
      ===================== */}

      {puedeCancelar && (

        <Card className="order-cancel-card">

          <div className="order-cancel-card__icon">
            !
          </div>


          <div className="order-cancel-card__content">

            <div>

              <span className="order-cancel-card__eyebrow">
                Gestión del pedido
              </span>

              <h2>
                ¿Necesitás cancelar?
              </h2>

              <p>
                Podés cancelar el pedido mientras
                todavía se encuentra en preparación.
              </p>

            </div>


            <Button
              variant="danger"
              disabled={cancelando}
              onClick={
                handleCancelarPedido
              }
            >

              {cancelando
                ? "Cancelando..."
                : "Cancelar pedido"}

            </Button>

          </div>

        </Card>

      )}


      {/* =====================
          ENTREGADO
      ===================== */}

      {pedido.estado === "ENTREGADO" && (

        <div className="customer-order-success">

          <div className="customer-order-success__icon">
            ✓
          </div>

          <div>
            <strong>
              Pedido completado
            </strong>

            <p>
              Tu pedido fue entregado correctamente.
            </p>
          </div>

        </div>

      )}


      {/* =====================
          CANCELADO
      ===================== */}

      {pedido.estado === "CANCELADO" && (

        <div className="customer-order-cancelled">

          <div className="customer-order-cancelled__icon">
            ×
          </div>

          <div>
            <strong>
              Pedido cancelado
            </strong>

            <p>
              Este pedido fue cancelado.
            </p>
          </div>

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
  );
}


export default PedidoDetallePage;