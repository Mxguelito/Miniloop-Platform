import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  crearExpensa,
  listarExpensas,
  listarUnidades,
  pagarExpensa,
} from "../../services/api";

import type {
  Expensa,
  Unidad,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";


const MESES = [
  "",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];


function ExpensasPage() {

  const { id } = useParams();

  const fechaActual = new Date();

  const [unidades, setUnidades] =
    useState<Unidad[]>([]);

  const [expensas, setExpensas] =
    useState<Expensa[]>([]);

  const [mes, setMes] =
    useState(fechaActual.getMonth() + 1);

  const [anio, setAnio] =
    useState(fechaActual.getFullYear());

  const [montos, setMontos] =
    useState<Record<number, string>>({});

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

    const [pagandoId, setPagandoId] =
  useState<number | null>(null);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");


  // =========================
  // CARGAR UNIDADES
  // =========================

  useEffect(() => {

    const cargar = async () => {
      try {

        setError("");

        const consorcioId = Number(id);

        if (!consorcioId) {
          setError("Consorcio inválido");
          return;
        }

        const data =
          await listarUnidades(consorcioId);

        setUnidades(data);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        }

      } finally {
        setCargando(false);
      }
    };

    cargar();

  }, [id]);


  // =========================
  // CARGAR EXPENSAS DEL PERÍODO
  // =========================

  useEffect(() => {

    const cargarExpensas = async () => {
      try {

        setError("");
        setMensaje("");

        const consorcioId = Number(id);

        if (!consorcioId) {
          return;
        }

        const data =
          await listarExpensas(
            consorcioId,
            mes,
            anio
          );

        setExpensas(data);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        }

      }
    };

    cargarExpensas();

  }, [id, mes, anio]);


  // =========================
  // CAMBIAR MONTO
  // =========================

  const cambiarMonto = (
    unidadId: number,
    valor: string
  ) => {

    setMontos((actuales) => ({
      ...actuales,
      [unidadId]: valor,
    }));
  };


  // =========================
  // GUARDAR EXPENSAS
  // =========================

  const guardarExpensas = async () => {
    try {

      setError("");
      setMensaje("");

      const consorcioId = Number(id);

      if (!consorcioId) {
        setError("Consorcio inválido");
        return;
      }


      // Solo unidades que todavía
      // no tienen expensa cargada.
      const unidadesConMonto =
        unidades.filter((unidad) => {

          const expensaExistente =
            expensas.find(
              (expensa) =>
                expensa.unidad_id === unidad.id
            );

          if (expensaExistente) {
            return false;
          }

          const monto =
            Number(montos[unidad.id]);

          return (
            !Number.isNaN(monto) &&
            monto > 0
          );
        });


      if (unidadesConMonto.length === 0) {

        setError(
          "Ingresá al menos un monto de expensa."
        );

        return;
      }


      setGuardando(true);


      for (const unidad of unidadesConMonto) {

        await crearExpensa(
          consorcioId,
          {
            unidad_id: unidad.id,
            mes,
            anio,
            monto: Number(
              montos[unidad.id]
            ),
          }
        );
      }


      // =========================
      // RECARGAR EXPENSAS
      // =========================

      const expensasActualizadas =
        await listarExpensas(
          consorcioId,
          mes,
          anio
        );

      setExpensas(
        expensasActualizadas
      );

      setMontos({});

      setMensaje(
        `Expensas de ${MESES[mes]} ${anio} guardadas correctamente.`
      );

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {

      setGuardando(false);

    }
  };

  // =========================
// REGISTRAR PAGO
// =========================

const registrarPago = async (
  expensaId: number
) => {
  try {

    setError("");
    setMensaje("");

    const consorcioId = Number(id);

    if (!consorcioId) {
      setError("Consorcio inválido");
      return;
    }

    setPagandoId(expensaId);

    await pagarExpensa(
      consorcioId,
      expensaId
    );

    const expensasActualizadas =
      await listarExpensas(
        consorcioId,
        mes,
        anio
      );

    setExpensas(expensasActualizadas);

    setMensaje(
      "Pago registrado correctamente."
    );

  } catch (err) {

    if (err instanceof Error) {
      setError(err.message);
    }

  } finally {

    setPagandoId(null);

  }
};


  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>

        <LoadingState
          message="Cargando unidades..."
        />

      </PageContainer>
    );
  }


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-expenses-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>


        <PageHeader
          title="Expensas"
          description={
            "Definí cuánto debe pagar cada unidad en el período."
          }
        />


        {/* =========================
            PERÍODO
        ========================= */}

        <Card className="consortium-expenses-period">

          <h2>
            Período
          </h2>

          <div className="consortium-expenses-period__fields">

            <label>

              Mes

              <select
                value={mes}
                onChange={(e) =>
                  setMes(
                    Number(e.target.value)
                  )
                }
                disabled={guardando}
              >

                {MESES.slice(1).map(
                  (nombre, index) => (

                    <option
                      key={nombre}
                      value={index + 1}
                    >
                      {nombre}
                    </option>

                  )
                )}

              </select>

            </label>


            <FormField
              label="Año"
              type="number"
              value={String(anio)}
              onChange={(e) =>
                setAnio(
                  Number(e.target.value)
                )
              }
              disabled={guardando}
            />

          </div>

        </Card>


        {/* =========================
            MENSAJES
        ========================= */}

        {error && (
          <div
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}


        {mensaje && (
          <div
            className="success-message"
            role="status"
          >
            {mensaje}
          </div>
        )}


        {/* =========================
            UNIDADES
        ========================= */}

        {unidades.length === 0 ? (

          <EmptyState
            title="No hay unidades"
            description={
              "Primero agregá las unidades del consorcio."
            }
          />

        ) : (

          <>

            <div className="consortium-expenses-list">

              {unidades.map((unidad) => {

                const expensaExistente =
                  expensas.find(
                    (expensa) =>
                      expensa.unidad_id === unidad.id
                  );

                return (

                  <Card
                    key={unidad.id}
                    className="consortium-expense-unit-card"
                  >

                    {/* =========================
                        INFORMACIÓN UNIDAD
                    ========================= */}

                    <div className="consortium-expense-unit-card__info">

                      <span>
                        Unidad
                      </span>

                      <h3>
                        {unidad.identificador}
                      </h3>

                      {unidad.metros_cuadrados && (

                        <p>
                          {Number(
                            unidad.metros_cuadrados
                          ).toLocaleString(
                            "es-AR"
                          )} m²
                        </p>

                      )}

                    </div>


                    {/* =========================
                        EXPENSA
                    ========================= */}

                    <div className="consortium-expense-unit-card__amount">

                      {expensaExistente ? (

                        <>

                          <span>
                            Expensa del período
                          </span>

                          <h3>
                            {Number(
                              expensaExistente.monto
                            ).toLocaleString(
                              "es-AR",
                              {
                                style: "currency",
                                currency: "ARS",
                              }
                            )}
                          </h3>

                         {expensaExistente.estado === "PAGADA" ? (

  <span>
    Pagada
  </span>

) : (

  <Button
    onClick={() =>
      registrarPago(
        expensaExistente.id
      )
    }
    disabled={
      pagandoId === expensaExistente.id
    }
  >
    {pagandoId === expensaExistente.id
      ? "Registrando..."
      : "Registrar pago"}
  </Button>

)}

                        </>

                      ) : (

                        <FormField
                          label="Monto"
                          type="number"
                          placeholder="Ej: 45000"
                          value={
                            montos[unidad.id] ?? ""
                          }
                          onChange={(e) =>
                            cambiarMonto(
                              unidad.id,
                              e.target.value
                            )
                          }
                          disabled={guardando}
                        />

                      )}

                    </div>

                  </Card>

                );

              })}

            </div>


            {/* =========================
                ACCIONES
            ========================= */}

           {expensas.length < unidades.length && (

  <div className="consortium-expenses-actions">

    <Button
      onClick={guardarExpensas}
      disabled={guardando}
    >

      {guardando
        ? "Guardando..."
        : "Guardar expensas"}

    </Button>

  </div>

)}

          </>

        )}

      </section>

    </PageContainer>
  );
}


export default ExpensasPage;