import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  listarMisExpensas,
  obtenerComprobantePago,
  descargarComprobantePagoPdf,
} from "../../services/api";

import type {
  Expensa,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";


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


function MisExpensasPage() {

  const { id } = useParams();

  const [expensas, setExpensas] =
    useState<Expensa[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [consultandoComprobante, setConsultandoComprobante] =
    useState<number | null>(null);

    const [descargandoComprobante, setDescargandoComprobante] =
  useState<number | null>(null);


  // =========================
  // CARGAR MIS EXPENSAS
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
          await listarMisExpensas(
            consorcioId
          );

        setExpensas(data);

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
  // FORMATEAR MONEDA
  // =========================

  const formatearMoneda = (
    monto: number
  ) => {

    return monto.toLocaleString(
      "es-AR",
      {
        style: "currency",
        currency: "ARS",
      }
    );

  };


  // =========================
  // FORMATEAR FECHA
  // =========================

  const formatearFecha = (
    fecha: string
  ) => {

    const [anio, mes, dia] =
      fecha.split("-");

    return `${dia}/${mes}/${anio}`;

  };


  // =========================
  // VER COMPROBANTE
  // =========================

  const verComprobante = async (
    expensaId: number
  ) => {

    try {

      setError("");

      const consorcioId = Number(id);

      if (!consorcioId) {
        setError("Consorcio inválido");
        return;
      }

      setConsultandoComprobante(
        expensaId
      );

      const comprobante =
        await obtenerComprobantePago(
          consorcioId,
          expensaId
        );

      console.log(
        "COMPROBANTE:",
        comprobante
      );

      alert(
        [
          "Comprobante de pago",
          "",
          `N.º: ${comprobante.comprobante_id}`,
          `Consorcio: ${comprobante.consorcio_nombre}`,
          `Unidad: ${comprobante.unidad_identificador}`,
          `Período: ${MESES[comprobante.mes]} ${comprobante.anio}`,
          `Importe: ${formatearMoneda(Number(comprobante.monto))}`,
          `Fecha de pago: ${formatearFecha(comprobante.fecha_pago)}`,
          `Estado: ${comprobante.estado}`,
        ].join("\n")
      );

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {

      setConsultandoComprobante(
        null
      );

    }

  };

  // =========================
// DESCARGAR COMPROBANTE
// =========================

const descargarComprobante = async (
  expensaId: number
) => {

  try {

    setError("");

    const consorcioId = Number(id);

    if (!consorcioId) {
      setError("Consorcio inválido");
      return;
    }

    setDescargandoComprobante(
      expensaId
    );

    await descargarComprobantePagoPdf(
      consorcioId,
      expensaId
    );

  } catch (err) {

    if (err instanceof Error) {
      setError(err.message);
    }

  } finally {

    setDescargandoComprobante(
      null
    );

  }

};


  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>

        <LoadingState
          message="Cargando tus expensas..."
        />

      </PageContainer>
    );
  }


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-my-expenses-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>


        <PageHeader
          title="Mis expensas"
          description={
            "Consultá las expensas correspondientes a tu unidad."
          }
        />


        {error && (
          <div
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}


        {!error && expensas.length === 0 && (

          <EmptyState
            title="No tenés expensas"
            description={
              "Todavía no hay expensas registradas para tu unidad."
            }
          />

        )}


        {!error && expensas.length > 0 && (

          <div className="consortium-my-expenses-list">

            {expensas.map((expensa) => (

              <Card
                key={expensa.id}
                className="consortium-my-expense-card"
              >

                <div>

                  <span>
                    Período
                  </span>

                  <h3>
                    {expensa.mes
                      ? MESES[expensa.mes]
                      : "Sin período"}{" "}
                    {expensa.anio ?? ""}
                  </h3>

                </div>


                <div>

                  <span>
                    Unidad
                  </span>

                  <strong>
                    {expensa.unidad_identificador}
                  </strong>

                </div>


                <div>

                  <span>
                    Importe
                  </span>

                  <strong>
                    {formatearMoneda(
                      Number(expensa.monto)
                    )}
                  </strong>

                </div>


                <StatusBadge
                  status={expensa.estado}
                  label={
                    expensa.estado === "PENDIENTE"
                      ? "Pendiente de pago"
                      : expensa.estado === "PAGADA"
                        ? "Pagada"
                        : undefined
                  }
                />


                {expensa.estado === "PAGADA" && (

                  <div>

                    {expensa.fecha_pago && (

                      <p>
                        Pagada el{" "}
                        <strong>
                          {formatearFecha(
                            expensa.fecha_pago
                          )}
                        </strong>
                      </p>

                    )}


                    <Button
                      onClick={() =>
                        verComprobante(
                          expensa.id
                        )
                      }
                      disabled={
                        consultandoComprobante ===
                        expensa.id
                      }
                    >
                      {consultandoComprobante ===
                      expensa.id
                        ? "Cargando..."
                        : "Ver comprobante"}
                    </Button>

                    <Button
  onClick={() =>
    descargarComprobante(
      expensa.id
    )
  }
  disabled={
    descargandoComprobante ===
    expensa.id
  }
>
  {descargandoComprobante ===
  expensa.id
    ? "Descargando..."
    : "Descargar PDF"}
</Button>

                  </div>

                )}

              </Card>

            ))}

          </div>

        )}

      </section>

    </PageContainer>
  );
}


export default MisExpensasPage;