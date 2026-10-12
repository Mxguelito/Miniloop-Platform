import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  cambiarEstadoPedido,
  obtenerPedidoComercio,
  confirmarLlegadaComercio,
  confirmarRetiroComercio,
  obtenerEntregaPorId,
  confirmarDevolucionComercio,
  inspeccionarDevolucionComercio,
  type PedidoDetalle,
  type EntregaActiva,
} from "../../services/api";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import StatusBadge from "../../components/ui/StatusBadge";
import cliente3d from "../../assets/pedidos/cliente-3d.png";


function PedidoComercioDetallePage() {
  const { id, pedidoId } = useParams();

  const [pedido, setPedido] =
    useState<PedidoDetalle | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [actualizando, setActualizando] =
    useState(false);

  const [error, setError] =
    useState("");

  const [codigoLlegada, setCodigoLlegada] =
  useState("");

  const [codigoRetiro, setCodigoRetiro] =
  useState("");

  const [codigoDevolucion, setCodigoDevolucion] =
  useState("");

  const [entrega, setEntrega] =
  useState<EntregaActiva | null>(null);

  const comercioId = Number(id);
  const pedidoIdNumero = Number(pedidoId);


  // =========================
  // CARGAR PEDIDO
  // =========================

  const cargarPedido = async () => {
    try {
      setError("");

      if (
        Number.isNaN(comercioId) ||
        Number.isNaN(pedidoIdNumero)
      ) {
        throw new Error("Pedido inválido");
      }


      const data =
        await obtenerPedidoComercio(
          comercioId,
          pedidoIdNumero
        );

      setPedido(data);

      if (data.entrega_id) {
  const entregaData =
    await obtenerEntregaPorId(
      data.entrega_id
    );

  setEntrega(entregaData);
} else {
  setEntrega(null);
}



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
  }, [id, pedidoId]);


  // =========================
  // CAMBIAR ESTADO
  // =========================

  const cambiarEstado = async (
    nuevoEstado: string
  ) => {
    if (!pedido) {
      return;
    }

    try {
      setError("");
      setActualizando(true);

      await cambiarEstadoPedido(
        pedido.id,
        nuevoEstado
      );

      await cargarPedido();

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setActualizando(false);
    }
  };

  // =========================
// CONFIRMAR LLEGADA DELIVERY
// =========================

const handleConfirmarLlegada = async () => {
  if (!pedido) {
    return;
  }

  const codigo = codigoLlegada.trim();

  if (!codigo) {
    setError("Ingresá el código de llegada");
    return;
  }

  try {
    setError("");
    setActualizando(true);

    if (!pedido.entrega_id) {
  setError("Este pedido no tiene una entrega asociada");
  return;
}

await confirmarLlegadaComercio(
  pedido.entrega_id,
  codigo
);

    setCodigoLlegada("");

    await cargarPedido();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "No pudimos confirmar la llegada"
    );
  } finally {
    setActualizando(false);
  }
};

// =========================
// CONFIRMAR RETIRO DELIVERY
// =========================

const handleConfirmarRetiro = async () => {
  if (!pedido) {
    return;
  }

  const codigo = codigoRetiro.trim();

  if (!codigo) {
    setError("Ingresá el código de retiro");
    return;
  }

  try {
    setError("");
    setActualizando(true);

   if (!pedido.entrega_id) {
  setError("Este pedido no tiene una entrega asociada");
  return;
}

await confirmarRetiroComercio(
  pedido.entrega_id,
  codigo
);

    setCodigoRetiro("");

    await cargarPedido();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "No pudimos confirmar el retiro"
    );
  } finally {
    setActualizando(false);
  }
};


// =========================
// CONFIRMAR DEVOLUCIÓN
// =========================

const handleConfirmarDevolucion = async () => {
  if (!pedido?.entrega_id) {
    return;
  }

  const codigo = codigoDevolucion.trim();

  if (!codigo) {
    setError("Ingresá el código de devolución");
    return;
  }

  try {
    setError("");
   setActualizando(true);

    await confirmarDevolucionComercio(
      pedido.entrega_id,
      codigo
    );

    setCodigoDevolucion("");

    await cargarPedido();

  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "No pudimos confirmar la devolución"
    );
  } finally {
    setActualizando(false);
  }
};


// =========================
// INSPECCIONAR DEVOLUCIÓN
// =========================

const handleInspeccionarDevolucion = async (
  resultado: "OK" | "PROBLEMA"
) => {
  if (!pedido?.entrega_id) {
    return;
  }

  try {
    setError("");
    setActualizando(true);

    await inspeccionarDevolucionComercio(
      pedido.entrega_id,
      resultado
    );

    await cargarPedido();

  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "No pudimos inspeccionar la devolución"
    );
  } finally {
    setActualizando(false);
  }
};



  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>

        <LoadingState
          message="Cargando pedido..."
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
          to={`/mis-comercios/${id}/pedidos`}
        >
          ← Volver a pedidos
        </Link>

        <EmptyState
          title="No pudimos cargar el pedido"
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

        <Link
          className="back-link"
          to={`/mis-comercios/${id}/pedidos`}
        >
          ← Volver a pedidos
        </Link>

        <EmptyState
          title="Pedido no encontrado"
          description={
            "No encontramos la información de este pedido."
          }
        />

      </PageContainer>
    );
  }


  // =========================
  // SIGUIENTE ACCIÓN
  // =========================

  let siguienteEstado: string | null = null;
  let textoAccion = "";

  if (pedido.estado === "PENDIENTE") {
    siguienteEstado = "PREPARANDO";
    textoAccion = "Empezar a preparar";
  }

if (
  pedido.estado === "PREPARANDO" &&
  (
    pedido.tipo_entrega !== "DELIVERY" ||
    entrega?.estado === "LLEGADA_CONFIRMADA"
  )
) {
  siguienteEstado = "LISTO";
  textoAccion = "Marcar como listo";
}


 if (
  pedido.estado === "LISTO" &&
  pedido.tipo_entrega !== "DELIVERY"
) {
  siguienteEstado = "ENTREGADO";
  textoAccion = "Marcar como entregado";
}


  // =========================
  // FECHA
  // =========================

  const fechaPedido =
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


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <Link
        className="back-link"
        to={`/mis-comercios/${id}/pedidos`}
      >
        ← Volver a pedidos
      </Link>


      {/* =====================
          ENCABEZADO
      ===================== */}

      <section className="merchant-detail-header">

        <div>

          <span className="merchant-detail-header__eyebrow">
            Gestión de pedido
          </span>

          <h1>
            Pedido #{pedido.id}
          </h1>

          <p>
            {fechaPedido}
          </p>

        </div>


        <StatusBadge
          status={pedido.estado}
        />

      </section>


      {/* =====================
          CLIENTE
      ===================== */}

      <Card className="merchant-detail-customer">

       <div className="merchant-detail-customer__icon">
  <img
    src={cliente3d}
    alt=""
    className="merchant-detail-customer__image"
    aria-hidden="true"
  />
</div>


        <div className="merchant-detail-customer__content">

          <span className="merchant-detail-label">
            Cliente
          </span>

          <h2>
            {pedido.usuario.nombre}
          </h2>

          <p>
            Pedido realizado en{" "}
            <strong>
              {pedido.comercio.nombre}
            </strong>
          </p>

        </div>

      </Card>


      {/* =====================
          PRODUCTOS
      ===================== */}

      <Card className="merchant-detail-products">

        <div className="merchant-detail-products__header">

          <div>
            <span className="merchant-detail-label">
              Detalle
            </span>

            <h2>
              Productos del pedido
            </h2>
          </div>


          <span className="merchant-detail-products__count">
            {pedido.items.length === 1
              ? "1 producto"
              : `${pedido.items.length} productos`}
          </span>

        </div>


        <div className="merchant-detail-items">

          {pedido.items.map((item) => (

            <div
              className="merchant-detail-item"
              key={item.id}
            >

              <div className="merchant-detail-item__left">

                <div className="merchant-detail-item__icon">
                  📦
                </div>


                <div>

                  <strong className="merchant-detail-item__name">
                    {item.producto.nombre}
                  </strong>

                  <span className="merchant-detail-item__quantity">
                    {item.cantidad} × $
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


              <strong className="merchant-detail-item__subtotal">
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


        {/* TOTAL */}

        <div className="merchant-detail-total">

          <div>
            <span>Total del pedido</span>

            <small>
              Importe total de la compra
            </small>
          </div>


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

      </Card>


      {/* =====================
          ERROR ACTUALIZACIÓN
      ===================== */}

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* =====================
    DELIVERY - CÓDIGO DE LLEGADA
===================== */}

{pedido.tipo_entrega === "DELIVERY" &&
  entrega?.estado === "EN_COMERCIO" && (



  <Card className="merchant-detail-action">

    <div className="merchant-detail-action__content">

      <div>
        <span className="merchant-detail-label">
          Delivery
        </span>

        <h2>
          Confirmar llegada del repartidor
        </h2>

        <p>
          Ingresá el código que te muestra el repartidor.
        </p>
      </div>

    </div>

    <input
      type="text"
      value={codigoLlegada}
      onChange={(e) =>
        setCodigoLlegada(e.target.value.toUpperCase())
      }
      placeholder="Ej: A7K29P"
      maxLength={6}
      disabled={actualizando}
    />

    <Button
      fullWidth
      disabled={actualizando || !codigoLlegada.trim()}
      onClick={handleConfirmarLlegada}
    >
      {actualizando
        ? "CONFIRMANDO..."
        : "CONFIRMAR LLEGADA"}
    </Button>

  </Card>
)}


{/* =====================
    DELIVERY - CÓDIGO DE RETIRO
===================== */}

{pedido.tipo_entrega === "DELIVERY" &&
  pedido.estado === "LISTO" &&
  entrega?.estado === "LLEGADA_CONFIRMADA" && (

  <Card className="merchant-detail-action">

    <div className="merchant-detail-action__content">

      <div>
        <span className="merchant-detail-label">
          Delivery
        </span>

        <h2>
          Confirmar retiro del pedido
        </h2>

        <p>
          Ingresá el código de retiro que te muestra el repartidor.
        </p>
      </div>

    </div>

    <input
      type="text"
      value={codigoRetiro}
      onChange={(e) =>
        setCodigoRetiro(e.target.value.toUpperCase())
      }
      placeholder="Ej: X8P2KL"
      maxLength={6}
      disabled={actualizando}
    />

    <Button
      fullWidth
      disabled={actualizando || !codigoRetiro.trim()}
      onClick={handleConfirmarRetiro}
    >
      {actualizando
        ? "CONFIRMANDO..."
        : "CONFIRMAR RETIRO"}
    </Button>

  </Card>
)}


{/* =========================
    DELIVERY - CONFIRMAR DEVOLUCIÓN
========================= */}

{pedido.tipo_entrega === "DELIVERY" &&
  entrega?.estado === "DEVOLUCION_EN_COMERCIO" && (

  <Card className="merchant-detail-action">

    <div className="merchant-detail-action__content">

      <div>
        <span className="merchant-detail-label">
          Delivery
        </span>

        <h2>
          Confirmar devolución
        </h2>

        <p>
          Ingresá el código de devolución que te muestra el repartidor.
        </p>
      </div>

    </div>

    <input
      type="text"
      value={codigoDevolucion}
      onChange={(e) =>
        setCodigoDevolucion(
          e.target.value.toUpperCase()
        )
      }
      placeholder="Ej: D7K29P"
      maxLength={6}
      disabled={actualizando}
    />

    <Button
      fullWidth
      disabled={
        actualizando ||
        !codigoDevolucion.trim()
      }
      onClick={handleConfirmarDevolucion}
    >
      {actualizando
        ? "CONFIRMANDO..."
        : "CONFIRMAR DEVOLUCIÓN"}
    </Button>

  </Card>
)}


{/* =========================
    DELIVERY - INSPECCIONAR DEVOLUCIÓN
========================= */}

{pedido.tipo_entrega === "DELIVERY" &&
  entrega?.estado === "DEVOLUCION_CONFIRMADA" && (

  <Card className="merchant-detail-action">

    <div className="merchant-detail-action__content">

      <div>
        <span className="merchant-detail-label">
          Delivery
        </span>

        <h2>
          Revisar pedido devuelto
        </h2>

        <p>
          Revisá el pedido antes de finalizar la devolución.
        </p>
      </div>

    </div>

    <Button
      fullWidth
      disabled={actualizando}
      onClick={() =>
        handleInspeccionarDevolucion("OK")
      }
    >
      {actualizando
        ? "PROCESANDO..."
        : "PEDIDO DEVUELTO CORRECTAMENTE"}
    </Button>

    <Button
      fullWidth
      disabled={actualizando}
      onClick={() =>
        handleInspeccionarDevolucion("PROBLEMA")
      }
    >
      {actualizando
        ? "PROCESANDO..."
        : "HAY UN PROBLEMA CON EL PEDIDO"}
    </Button>

  </Card>
)}


      {/* =====================
          PRÓXIMA ACCIÓN
      ===================== */}

      {siguienteEstado && (

        <Card className="merchant-detail-action">

          <div className="merchant-detail-action__content">

            <div className="merchant-detail-action__icon">
              →
            </div>


            <div>

              <span className="merchant-detail-label">
                Próximo paso
              </span>

              <h2>
                ¿Qué sigue?
              </h2>

              <p>
                Actualizá el pedido para que
                el cliente pueda seguir su estado.
              </p>

            </div>

          </div>


          <div className="merchant-detail-action__button">

            <Button
              fullWidth
              disabled={actualizando}
              onClick={() =>
                cambiarEstado(
                  siguienteEstado
                )
              }
            >
              {actualizando
                ? "Actualizando..."
                : textoAccion}
            </Button>

          </div>

        </Card>

      )}


      {/* =====================
          ENTREGADO
      ===================== */}

      {pedido.estado === "ENTREGADO" && (

        <Card className="merchant-detail-finished merchant-detail-finished--success">

          <div className="merchant-detail-finished__icon">
            ✓
          </div>

          <div>
            <strong>
              Pedido completado
            </strong>

            <p>
              Este pedido fue entregado correctamente.
            </p>
          </div>

        </Card>

      )}


      {/* =====================
          CANCELADO
      ===================== */}

      {pedido.estado === "CANCELADO" && (

        <Card className="merchant-detail-finished merchant-detail-finished--cancelled">

          <div className="merchant-detail-finished__icon">
            ×
          </div>

          <div>
            <strong>
              Pedido cancelado
            </strong>

            <p>
              Este pedido fue cancelado por el cliente.
            </p>
          </div>

        </Card>

      )}

    </PageContainer>
  );
}


export default PedidoComercioDetallePage;