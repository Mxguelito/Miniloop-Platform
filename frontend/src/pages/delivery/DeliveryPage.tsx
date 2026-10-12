import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  obtenerMiPerfilRepartidor,
  iniciarJornadaDelivery,
  terminarJornadaDelivery,
  listarEntregasDisponibles,
  aceptarEntrega,
  obtenerEntregaActiva,
  llegarAlComercio,
  obtenerCodigoLlegada,
  obtenerCodigoRetiro,
  iniciarCaminoEntrega,
  llegarAlCliente,
  confirmarCodigoFinal,
  liberarEntrega,
  extenderLlegadaEntrega,
  crearIncidenciaEntrega,
  iniciarDevolucionEntrega,
  llegarDevolucionComercio,
  obtenerCodigoDevolucion,
  obtenerEstadisticasRepartidor,
  obtenerMisGanancias,
  type Repartidor,
  type EntregaDisponible,
  type EntregaActiva,
  type EstadisticasRepartidor,
  type GananciaRepartidor,
} from "../../services/api";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";

function DeliveryPage() {
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [repartidor, setRepartidor] =
    useState<Repartidor | null>(null);

  const [entregasDisponibles, setEntregasDisponibles] =
    useState<EntregaDisponible[]>([]);

  const [entregaActiva, setEntregaActiva] =
    useState<EntregaActiva | null>(null);

  const [estadisticas, setEstadisticas] =
    useState<EstadisticasRepartidor | null>(null);

  const [ganancias, setGanancias] =
    useState<GananciaRepartidor[]>([]);

  const [codigoLlegada, setCodigoLlegada] =
    useState<string | null>(null);

  const [codigoRetiro, setCodigoRetiro] =
    useState<string | null>(null);

  const [codigoDevolucion, setCodigoDevolucion] =
    useState<string | null>(null);

  // Código final ingresado por el repartidor
const [codigoFinal, setCodigoFinal] = useState("");

  const [motivoLiberacion, setMotivoLiberacion] =
    useState("");

  const [tipoIncidencia, setTipoIncidencia] =
    useState("");

  const [descripcionIncidencia, setDescripcionIncidencia] =
    useState("");

  const [error, setError] = useState("");
  
const [ahora, setAhora] = useState(Date.now());

useEffect(() => {
  if (entregaActiva?.estado !== "ESPERANDO_AL_CLIENTE") {
    return;
  }

  const intervalo = window.setInterval(() => {
    setAhora(Date.now());
  }, 1000);

  return () => window.clearInterval(intervalo);
}, [entregaActiva?.estado]);

const fechaLlegada =
  entregaActiva?.estado === "ESPERANDO_AL_CLIENTE"
    ? (
        entregaActiva as EntregaActiva & {
          fecha_llegada_cliente?: string | null;
        }
      ).fecha_llegada_cliente
    : null;

const segundosTranscurridos = fechaLlegada
  ? Math.max(
      0,
      Math.floor(
        (ahora - new Date(fechaLlegada).getTime()) / 1000
      )
    )
  : 0;

const segundosRestantes = Math.max(
  0,
  600 - segundosTranscurridos
);

const puedeDevolver =
  Boolean(fechaLlegada) &&
  segundosTranscurridos >= 600;

const tiempoRestante = `${String(
  Math.floor(segundosRestantes / 60)
).padStart(2, "0")}:${String(
  segundosRestantes % 60
).padStart(2, "0")}`;


  const tiposIncidencia = [
    {
      value: "PROBLEMA_CON_PEDIDO",
      label: "Problema con el pedido",
    },
    {
      value: "PROBLEMA_CON_CLIENTE",
      label: "Problema con el cliente",
    },
    {
      value: "PROBLEMA_CON_COMERCIO",
      label: "Problema con el comercio",
    },
    {
      value: "OTRO",
      label: "Otro problema",
    },
  ];

  // =========================
  // CARGAR PERFIL
  // =========================

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setError("");

        const perfil =
          await obtenerMiPerfilRepartidor();

        setRepartidor(perfil);

        if (!perfil) {
          setEstadisticas(null);
          setGanancias([]);
          setEntregaActiva(null);
          setEntregasDisponibles([]);
          return;
        }

        const stats =
          await obtenerEstadisticasRepartidor();

        setEstadisticas(stats);

        const historialGanancias =
          await obtenerMisGanancias();

        setGanancias(historialGanancias);

        const activa =
          await obtenerEntregaActiva();

        setEntregaActiva(activa);

        if (
          perfil.disponibilidad === "DISPONIBLE"
        ) {
          const entregas =
            await listarEntregasDisponibles();

          setEntregasDisponibles(entregas);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No pudimos cargar tu perfil Delivery."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, []);

  // =========================
  // INICIAR JORNADA
  // =========================

  const handleIniciarJornada = async () => {
    try {
      setError("");
      setProcesando(true);

      const actualizado =
        await iniciarJornadaDelivery();

      setRepartidor(actualizado);

      const entregas =
        await listarEntregasDisponibles();

      setEntregasDisponibles(entregas);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos iniciar la jornada"
      );
    } finally {
      setProcesando(false);
    }
  };

  // =========================
  // TERMINAR JORNADA
  // =========================

  const handleTerminarJornada = async () => {
    try {
      setError("");
      setProcesando(true);

      const actualizado =
        await terminarJornadaDelivery();

      setRepartidor(actualizado);
      setEntregasDisponibles([]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos terminar la jornada"
      );
    } finally {
      setProcesando(false);
    }
  };

  // =========================
  // ACEPTAR ENTREGA
  // =========================

  const handleAceptarEntrega = async (
    entregaId: number
  ) => {
    try {
      setError("");
      setProcesando(true);

      const entregaAceptada =
        await aceptarEntrega(entregaId);

      setEntregaActiva(entregaAceptada);

      const perfilActualizado =
        await obtenerMiPerfilRepartidor();

      setRepartidor(perfilActualizado);
      setEntregasDisponibles([]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos aceptar la entrega"
      );
    } finally {
      setProcesando(false);
    }
  };

  // =========================
  // LLEGAR AL COMERCIO
  // =========================

  const handleLlegarAlComercio = async () => {
    if (!entregaActiva) return;

    try {
      setError("");
      setProcesando(true);

      const entregaActualizada =
        await llegarAlComercio(
          entregaActiva.id
        );

      setEntregaActiva(entregaActualizada);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos registrar la llegada al comercio"
      );
    } finally {
      setProcesando(false);
    }
  };

  // =========================
  // EXTENDER LLEGADA
  // =========================

  const handleExtenderLlegada = async () => {
    if (!entregaActiva) return;

    try {
      setError("");
      setProcesando(true);

      const entregaActualizada =
        await extenderLlegadaEntrega(
          entregaActiva.id
        );

      setEntregaActiva(entregaActualizada);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos extender el tiempo de llegada"
      );
    } finally {
      setProcesando(false);
    }
  };

  // =========================
  // CÓDIGO LLEGADA
  // =========================

  const handleObtenerCodigoLlegada =
    async () => {
      if (!entregaActiva) return;

      try {
        setError("");
        setProcesando(true);

        const respuesta =
          await obtenerCodigoLlegada(
            entregaActiva.id
          );

        setCodigoLlegada(
          respuesta.codigo_llegada
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No pudimos obtener el código de llegada"
        );
      } finally {
        setProcesando(false);
      }
    };

  // =========================
  // CÓDIGO RETIRO
  // =========================

  const handleObtenerCodigoRetiro =
    async () => {
      if (!entregaActiva) return;

      try {
        setError("");
        setProcesando(true);

        const respuesta =
          await obtenerCodigoRetiro(
            entregaActiva.id
          );

        setCodigoRetiro(
          respuesta.codigo_retiro
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No pudimos obtener el código de retiro"
        );
      } finally {
        setProcesando(false);
      }
    };

  // =========================
  // CAMINO AL CLIENTE
  // =========================

  const handleIniciarCamino = async () => {
    if (!entregaActiva) return;

    try {
      setError("");
      setProcesando(true);

      const entregaActualizada =
        await iniciarCaminoEntrega(
          entregaActiva.id
        );

      setEntregaActiva(entregaActualizada);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos iniciar el camino al cliente"
      );
    } finally {
      setProcesando(false);
    }
  };

  // =========================
  // LLEGAR AL CLIENTE
  // =========================

  const handleLlegarAlCliente = async () => {
    if (!entregaActiva) return;

    try {
      setError("");
      setProcesando(true);

      const entregaActualizada =
        await llegarAlCliente(
          entregaActiva.id
        );

      setEntregaActiva(entregaActualizada);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos registrar la llegada al cliente"
      );
    } finally {
      setProcesando(false);
    }
  };

  // =========================
// CONFIRMAR ENTREGA FINAL
// =========================

const handleConfirmarEntregaFinal = async () => {
  if (!entregaActiva || procesando) return;

  const codigo = codigoFinal.trim().toUpperCase();

  if (!/^[A-Z0-9]{6}$/.test(codigo)) {
    setError("Ingresá un código válido de 6 caracteres.");
    return;
  }

  try {
    setError("");
    setProcesando(true);

    await confirmarCodigoFinal(entregaActiva.id, codigo);

    setCodigoFinal("");
    setEntregaActiva(null);

    const [perfil, stats, historial] = await Promise.all([
      obtenerMiPerfilRepartidor(),
      obtenerEstadisticasRepartidor(),
      obtenerMisGanancias(),
    ]);

    setRepartidor(perfil);
    setEstadisticas(stats);
    setGanancias(historial);

    if (perfil?.disponibilidad === "DISPONIBLE") {
      const disponibles = await listarEntregasDisponibles();
      setEntregasDisponibles(disponibles);
    } else {
      setEntregasDisponibles([]);
    }
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "No pudimos confirmar la entrega."
    );
  } finally {
    setProcesando(false);
  }
};

  
const handleActualizarEntrega = async () => {
  try {
    setError("");
    setProcesando(true);

    const activa = await obtenerEntregaActiva();
    setEntregaActiva(activa);

    const perfil = await obtenerMiPerfilRepartidor();
    setRepartidor(perfil);

    if (!activa) {
      const [stats, historial, disponibles] =
        await Promise.all([
          obtenerEstadisticasRepartidor(),
          obtenerMisGanancias(),
          perfil?.disponibilidad === "DISPONIBLE"
            ? listarEntregasDisponibles()
            : Promise.resolve([]),
        ]);

      setEstadisticas(stats);
      setGanancias(historial);
      setEntregasDisponibles(disponibles);
    }
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "No pudimos actualizar la entrega"
    );
  } finally {
    setProcesando(false);
  }
};


  // =========================
  // LIBERAR ENTREGA
  // =========================

  const handleLiberarEntrega = async () => {
    if (!entregaActiva) return;

    const motivo =
      motivoLiberacion.trim();

    if (!motivo) {
      setError(
        "Ingresá el motivo de la liberación"
      );
      return;
    }

    try {
      setError("");
      setProcesando(true);

      await liberarEntrega(
        entregaActiva.id,
        motivo
      );

      setEntregaActiva(null);
      setMotivoLiberacion("");

      const perfil =
        await obtenerMiPerfilRepartidor();

      setRepartidor(perfil);

      const entregas =
        await listarEntregasDisponibles();

      setEntregasDisponibles(entregas);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos liberar la entrega"
      );
    } finally {
      setProcesando(false);
    }
  };

  // =========================
  // INCIDENCIA
  // =========================

  const handleCrearIncidencia = async () => {
    if (!entregaActiva) return;

    const tipo =
      tipoIncidencia.trim();

    const descripcion =
      descripcionIncidencia.trim();

    if (!tipo) {
      setError(
        "Seleccioná el tipo de incidencia"
      );
      return;
    }

    if (!descripcion) {
      setError(
        "Ingresá una descripción"
      );
      return;
    }

    try {
      setError("");
      setProcesando(true);

      await crearIncidenciaEntrega(
        entregaActiva.id,
        tipo,
        descripcion
      );

      setTipoIncidencia("");
      setDescripcionIncidencia("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos registrar la incidencia"
      );
    } finally {
      setProcesando(false);
    }
  };

  // =========================
  // DEVOLUCIÓN
  // =========================

  const handleIniciarDevolucion = async () => {
    if (!entregaActiva) return;

    try {
      setError("");
      setProcesando(true);

      const entregaActualizada =
        await iniciarDevolucionEntrega(
          entregaActiva.id
        );

      setEntregaActiva(entregaActualizada);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos iniciar la devolución"
      );
    } finally {
      setProcesando(false);
    }
  };

  const handleLlegarDevolucionComercio =
    async () => {
      if (!entregaActiva) return;

      try {
        setError("");
        setProcesando(true);

        const entregaActualizada =
          await llegarDevolucionComercio(
            entregaActiva.id
          );

        setEntregaActiva(
          entregaActualizada
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No pudimos registrar la llegada al comercio"
        );
      } finally {
        setProcesando(false);
      }
    };

  const handleObtenerCodigoDevolucion =
    async () => {
      if (!entregaActiva) return;

      try {
        setError("");
        setProcesando(true);

        const respuesta =
          await obtenerCodigoDevolucion(
            entregaActiva.id
          );

        setCodigoDevolucion(
          respuesta.codigo_devolucion
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No pudimos obtener el código de devolución"
        );
      } finally {
        setProcesando(false);
      }
    };

  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>
        <LoadingState message="Cargando Delivery..." />
      </PageContainer>
    );
  }

  // =========================
  // ERROR INICIAL
  // =========================

  if (error && !repartidor) {
    return (
      <PageContainer>
        <PageHeader
          title="Delivery"
          description="Gestioná tus entregas con MiniLoop."
        />

        <EmptyState
          title="No pudimos cargar Delivery"
          description={error}
          action={
            <Button onClick={() => navigate("/app")}>
              Volver al inicio
            </Button>
          }
        />
      </PageContainer>
    );
  }

  // =========================
  // NO ES REPARTIDOR
  // =========================

  if (!repartidor) {
    return (
      <PageContainer>
        <button
          className="back-link"
          type="button"
          onClick={() => navigate("/app")}
        >
          ← Volver al inicio
        </button>

        <PageHeader
          title="Delivery"
          description="Repartí pedidos de tu zona con MiniLoop."
        />

        <Card className="delivery-welcome-card">
          <div className="delivery-welcome-card__content">
            <div>
              <span className="delivery-eyebrow">
                Empezá a repartir
              </span>

              <h2>
                Activá tu perfil de repartidor
              </h2>

              <p>
                Elegí tu zona de trabajo y tu medio
                de transporte para comenzar.
              </p>
            </div>

            <Button
              onClick={() =>
                navigate("/delivery/activar")
              }
            >
              Activar Delivery
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  // =========================
  // PANEL REPARTIDOR
  // =========================

  return (
    <PageContainer>
      <button
        className="back-link"
        type="button"
        onClick={() => navigate("/app")}
        disabled={procesando}
      >
        ← Volver al inicio
      </button>

      <PageHeader
        title="Delivery"
        description="Gestioná tu jornada y tus entregas."
      />

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* PERFIL */}

      <Card className="delivery-profile-card">
        <div className="delivery-profile-card__header">
          <div>
            <span className="delivery-eyebrow">
              Mi perfil
            </span>

            <h2>Repartidor MiniLoop</h2>
          </div>

          <StatusBadge
            status={repartidor.disponibilidad}
          />
        </div>

        <div className="delivery-profile-grid">
          <div className="delivery-info-item">
            <span>Estado</span>
            <strong>{repartidor.estado}</strong>
          </div>

          <div className="delivery-info-item">
            <span>Disponibilidad</span>
            <strong>
              {repartidor.disponibilidad}
            </strong>
          </div>

          <div className="delivery-info-item">
            <span>Transporte</span>
            <strong>
              {repartidor.transporte}
            </strong>
          </div>
        </div>

        <div className="delivery-profile-actions">
          {repartidor.disponibilidad ===
            "NO_DISPONIBLE" && (
            <Button
              fullWidth
              onClick={handleIniciarJornada}
              disabled={procesando}
            >
              {procesando
                ? "Iniciando..."
                : "Iniciar jornada"}
            </Button>
          )}

          {repartidor.disponibilidad ===
            "DISPONIBLE" && (
            <Button
              fullWidth
              onClick={handleTerminarJornada}
              disabled={procesando}
            >
              {procesando
                ? "Terminando..."
                : "Terminar jornada"}
            </Button>
          )}
        </div>
      </Card>

      {/* ESTADÍSTICAS */}

      {estadisticas && (
        <section className="delivery-section">
          <h2 className="delivery-section__title">
            Mis estadísticas
          </h2>

          <div className="delivery-stats-grid">
            <Card className="delivery-stat-card">
              <span>Entregas completadas</span>
              <strong>
                {estadisticas.entregas_completadas}
              </strong>
            </Card>

            <Card className="delivery-stat-card">
              <span>Ganancia total</span>
              <strong>
                $
                {Number(
                  estadisticas.ganancia_total
                ).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </Card>

            <Card className="delivery-stat-card">
              <span>Calificación</span>
              <strong>
                {estadisticas.calificacion_promedio !==
                null
                  ? estadisticas.calificacion_promedio.toFixed(
                      1
                    )
                  : "—"}
              </strong>
            </Card>

            <Card className="delivery-stat-card">
              <span>Bono pendiente</span>
              <strong>
                $
                {Number(
                  estadisticas.bono_pendiente
                ).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </Card>
          </div>
        </section>
      )}

      {/* GANANCIAS */}

      {ganancias.length > 0 && (
        <section className="delivery-section">
          <h2 className="delivery-section__title">
            Historial de ganancias
          </h2>

          <div className="delivery-earnings-list">
            {ganancias.map((ganancia) => (
              <Card
                key={ganancia.id}
                className="delivery-earning-card"
              >
                <div>
                  <span>
                    Entrega #{ganancia.entrega_id}
                  </span>

                  <strong>
                    $
                    {Number(
                      ganancia.monto
                    ).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>

                <span>
                  {new Date(
                    ganancia.fecha_creacion
                  ).toLocaleDateString("es-AR")}
                </span>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ENTREGAS DISPONIBLES */}

      {repartidor.disponibilidad ===
        "DISPONIBLE" && (
        <section className="delivery-section">
          <h2 className="delivery-section__title">
            Entregas disponibles
          </h2>

          {entregasDisponibles.length === 0 ? (
            <EmptyState
              title="No hay entregas disponibles"
              description="Cuando aparezca una entrega en tu zona, la vas a ver acá."
            />
          ) : (
            <div className="delivery-jobs-list">
              {entregasDisponibles.map(
                (entrega) => (
                  <Card
                    key={entrega.id}
                    className="delivery-job-card"
                  >
                    <div className="delivery-job-card__info">
                      <span>
                        Pedido #{entrega.pedido_id}
                      </span>

                      <strong>
                        $
                        {Number(
                          entrega.ganancia_repartidor
                        ).toLocaleString(
                          "es-AR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </strong>
                    </div>

                    <Button
                      fullWidth
                      disabled={procesando}
                      onClick={() =>
                        handleAceptarEntrega(
                          entrega.id
                        )
                      }
                    >
                      {procesando
                        ? "Aceptando..."
                        : "Aceptar entrega"}
                    </Button>
                  </Card>
                )
              )}
            </div>
          )}
        </section>
      )}

      {repartidor.disponibilidad ===
        "OCUPADO" &&
        !entregaActiva && (
          <Card>
            <p>
              Tenés una entrega activa. Terminá
              la entrega antes de finalizar tu
              jornada.
            </p>
          </Card>
        )}

      {/* ENTREGA ACTIVA */}

      {entregaActiva && (
        <section className="delivery-section">
          <h2 className="delivery-section__title">
            Entrega activa
          </h2>

          <Card className="delivery-active-card">
            <div className="delivery-active-card__header">
              <div>
                <span className="delivery-eyebrow">
                  Pedido
                </span>

                <h2>
                  #{entregaActiva.pedido_id}
                </h2>
              </div>

              <StatusBadge
                status={entregaActiva.estado}
              />
            </div>

            <div className="delivery-profile-grid">
              <div className="delivery-info-item">
                <span>Destino</span>
                <strong>
                  {entregaActiva.destino}
                </strong>
              </div>

              <div className="delivery-info-item">
                <span>Tu ganancia</span>
                <strong>
                  $
                  {Number(
                    entregaActiva.ganancia_repartidor
                  ).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
            </div>

            <div className="delivery-active-actions">

              {entregaActiva.estado ===
                "ASIGNADA" && (
                <>
                  <Button
                    fullWidth
                    disabled={procesando}
                    onClick={
                      handleLlegarAlComercio
                    }
                  >
                    {procesando
                      ? "Registrando..."
                      : "Llegué al comercio"}
                  </Button>

                  <Button
                    fullWidth
                    disabled={procesando}
                    onClick={
                      handleExtenderLlegada
                    }
                  >
                    Necesito más tiempo (+15 min)
                  </Button>
                </>
              )}

              {entregaActiva.estado ===
                "EN_COMERCIO" && (
                <div className="delivery-code-box">
                  {!codigoLlegada ? (
                    <Button
                      fullWidth
                      disabled={procesando}
                      onClick={
                        handleObtenerCodigoLlegada
                      }
                    >
                      Mostrar código de llegada
                    </Button>
                  ) : (
                    <>
                      <span>
                        Código de llegada
                      </span>
                      <strong>
                        {codigoLlegada}
                      </strong>
                      <p>
                        Mostrale este código al
                        comercio.
                      </p>
                    </>
                  )}
                </div>
              )}

              {entregaActiva.estado ===
                "LLEGADA_CONFIRMADA" && (
                <div className="delivery-code-box">
                  {!codigoRetiro ? (
                    <Button
                      fullWidth
                      disabled={procesando}
                      onClick={
                        handleObtenerCodigoRetiro
                      }
                    >
                      Mostrar código de retiro
                    </Button>
                  ) : (
                    <>
                      <span>
                        Código de retiro
                      </span>
                      <strong>
                        {codigoRetiro}
                      </strong>
                      <p>
                        Mostrale este código al
                        comercio.
                      </p>
                    </>
                  )}
                </div>
              )}

              {entregaActiva.estado ===
                "RETIRADO" && (
                <>
                  <Button
                    fullWidth
                    disabled={procesando}
                    onClick={handleIniciarCamino}
                  >
                    Iniciar camino al cliente
                  </Button>

                  <Button
                    fullWidth
                    disabled={procesando}
                    onClick={
                      handleIniciarDevolucion
                    }
                  >
                    Devolver al comercio
                  </Button>
                </>
              )}

              {entregaActiva.estado ===
                "EN_CAMINO" && (
                <Button
                  fullWidth
                  disabled={procesando}
                  onClick={
                    handleLlegarAlCliente
                  }
                >
                  Llegué al cliente
                </Button>
              )}
              
{entregaActiva.estado === "ESPERANDO_AL_CLIENTE" && (
  <div className="delivery-code-box">
    <span>Entrega en destino</span>

    <h3>Confirmar entrega</h3>

    <p>
      Solicitale al cliente su código final de
      6 caracteres para confirmar la entrega.
    </p>

    <input
      className="delivery-input"
      type="text"
      value={codigoFinal}
      onChange={(event) =>
        setCodigoFinal(
          event.target.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 6)
        )
      }
      placeholder="Código del cliente"
      maxLength={6}
      autoComplete="off"
      disabled={procesando}
    />

    <Button
      fullWidth
      disabled={procesando || codigoFinal.length !== 6}
      onClick={handleConfirmarEntregaFinal}
    >
      {procesando ? "Confirmando..." : "Confirmar entrega"}
    </Button>

    <Button
      fullWidth
      disabled={procesando}
      onClick={handleActualizarEntrega}
    >
      Actualizar estado
    </Button>

    <div className="delivery-secondary-box">
      <h3>¿El cliente no responde?</h3>

      {fechaLlegada ? (
        <p>
          {puedeDevolver
            ? "Ya podés iniciar la devolución."
            : `Podés iniciar la devolución en ${tiempoRestante}.`}
        </p>
      ) : (
        <p>
          No pudimos determinar el tiempo de espera.
          Actualizá la entrega.
        </p>
      )}

      <Button
        fullWidth
        disabled={procesando || !puedeDevolver}
        onClick={handleIniciarDevolucion}
      >
        {procesando ? "Procesando..." : "Iniciar devolución"}
      </Button>
    </div>
  </div>
)}


              {entregaActiva.estado ===
                "DEVOLUCION_EN_CAMINO" && (
                <Button
                  fullWidth
                  disabled={procesando}
                  onClick={
                    handleLlegarDevolucionComercio
                  }
                >
                  Llegué al comercio con la
                  devolución
                </Button>
              )}

              {entregaActiva.estado ===
                "DEVOLUCION_EN_COMERCIO" && (
                <div className="delivery-code-box">
                  {!codigoDevolucion ? (
                    <Button
                      fullWidth
                      disabled={procesando}
                      onClick={
                        handleObtenerCodigoDevolucion
                      }
                    >
                      Mostrar código de devolución
                    </Button>
                  ) : (
                    <>
                      <span>
                        Código de devolución
                      </span>

                      <strong>
                        {codigoDevolucion}
                      </strong>

                      <p>
                        Mostrale este código al
                        comercio.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* LIBERAR */}

            {[
              "ASIGNADA",
              "EN_COMERCIO",
              "LLEGADA_CONFIRMADA",
            ].includes(entregaActiva.estado) && (
              <div className="delivery-secondary-box">
                <h3>No puedo continuar</h3>

                <input
                  className="delivery-input"
                  type="text"
                  value={motivoLiberacion}
                  onChange={(event) =>
                    setMotivoLiberacion(
                      event.target.value
                    )
                  }
                  placeholder="Motivo de la liberación"
                  disabled={procesando}
                />

                <Button
                  fullWidth
                  onClick={handleLiberarEntrega}
                  disabled={
                    procesando ||
                    !motivoLiberacion.trim()
                  }
                >
                  {procesando
                    ? "Liberando..."
                    : "Liberar entrega"}
                </Button>
              </div>
            )}

            {/* INCIDENCIA */}

            <div className="delivery-secondary-box">
              <h3>¿Ocurrió un problema?</h3>

              <select
                className="delivery-form-field__select"
                value={tipoIncidencia}
                onChange={(event) =>
                  setTipoIncidencia(
                    event.target.value
                  )
                }
                disabled={procesando}
              >
                <option value="">
                  Seleccioná el problema
                </option>

                {tiposIncidencia.map(
                  (tipo) => (
                    <option
                      key={tipo.value}
                      value={tipo.value}
                    >
                      {tipo.label}
                    </option>
                  )
                )}
              </select>

              <textarea
                className="delivery-textarea"
                value={descripcionIncidencia}
                onChange={(event) =>
                  setDescripcionIncidencia(
                    event.target.value
                  )
                }
                placeholder="Contanos brevemente qué pasó"
                disabled={procesando}
              />

              <Button
                fullWidth
                onClick={handleCrearIncidencia}
                disabled={
                  procesando ||
                  !tipoIncidencia ||
                  !descripcionIncidencia.trim()
                }
              >
                {procesando
                  ? "Reportando..."
                  : "Reportar problema"}
              </Button>
            </div>
          </Card>
        </section>
      )}
    </PageContainer>
  );
}

export default DeliveryPage;