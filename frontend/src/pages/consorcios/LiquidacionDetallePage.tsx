import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  obtenerDetalleLiquidacion,
} from "../../services/api";

import type {
  LiquidacionDetalle,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import LoadingState from "../../components/ui/LoadingState";
import StatusBadge from "../../components/ui/StatusBadge";


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


function LiquidacionDetallePage() {

  const { id, liquidacionId } = useParams();

  const [liquidacion, setLiquidacion] =
    useState<LiquidacionDetalle | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // CARGAR DETALLE
  // =========================

  useEffect(() => {

    const cargarDetalle = async () => {
      try {

        setError("");

        const consorcioId = Number(id);

        const liquidacionNumero =
          Number(liquidacionId);

        if (
          !consorcioId ||
          !liquidacionNumero
        ) {
          setError(
            "Liquidación inválida"
          );

          return;
        }

       const data =
  await obtenerDetalleLiquidacion(
    consorcioId,
    liquidacionNumero
  );

console.log("DETALLE:", data);
console.log("EXPENSAS:", data.expensas);

setLiquidacion(data);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        }

      } finally {

        setCargando(false);

      }
    };

    cargarDetalle();

  }, [id, liquidacionId]);


  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>

        <LoadingState
          message="Cargando liquidación..."
        />

      </PageContainer>
    );
  }


  // =========================
  // ERROR
  // =========================

  if (error || !liquidacion) {
    return (
      <PageContainer>

        <Link
          className="back-link"
          to={`/consorcios/${id}/liquidaciones`}
        >
          ← Volver a liquidaciones
        </Link>

        <div className="error-message">
          {error || "Liquidación no encontrada"}
        </div>

      </PageContainer>
    );
  }


  // =========================
  // TOTALES
  // =========================

  const totalExpensas =
    liquidacion.expensas.reduce(
      (total, expensa) =>
        total + Number(expensa.monto),
      0
    );

  const totalCobrado =
    liquidacion.expensas
      .filter(
        (expensa) =>
          expensa.estado === "PAGADA"
      )
      .reduce(
        (total, expensa) =>
          total + Number(expensa.monto),
        0
      );

  const totalPendiente =
    totalExpensas - totalCobrado;


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
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-liquidation-detail-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}/liquidaciones`}
        >
          ← Volver a liquidaciones
        </Link>


        <PageHeader
          title={
            `${MESES[liquidacion.mes]} ${liquidacion.anio}`
          }
          description={
            "Resumen de las expensas del período."
          }
        />


        {/* =========================
            RESUMEN
        ========================= */}

        <div className="consortium-liquidation-summary-grid">

          <Card className="consortium-liquidation-summary-card">

            <span>
              Total expensas
            </span>

            <strong>
              {formatearMoneda(
                totalExpensas
              )}
            </strong>

          </Card>


          <Card className="consortium-liquidation-summary-card">

            <span>
              Total cobrado
            </span>

            <strong>
              {formatearMoneda(
                totalCobrado
              )}
            </strong>

          </Card>


          <Card className="consortium-liquidation-summary-card">

            <span>
              Total pendiente
            </span>

            <strong>
              {formatearMoneda(
                totalPendiente
              )}
            </strong>

          </Card>

        </div>


        {/* =========================
            ESTADO LIQUIDACIÓN
        ========================= */}

        <Card className="consortium-liquidation-detail-summary">

          <div>

            <span>
              Estado de la liquidación
            </span>

          </div>

          <StatusBadge
            status={liquidacion.estado}
          />

        </Card>


        {/* =========================
            EXPENSAS
        ========================= */}

        <section className="consortium-liquidation-expenses">

          <h2>
            Expensas del período
          </h2>

          <p>
            Estado de pago de cada unidad
            para este período.
          </p>


          <div className="consortium-liquidation-expenses__list">

            {liquidacion.expensas.map(
              (expensa) => (

                <Card
                  key={expensa.id}
                  className="consortium-expense-card"
                >

                  <div>

                    <span>
                      Unidad
                    </span>

                    <h3>
                      {expensa.unidad_identificador}
                    </h3>

                  </div>


                  <div>

                    <span>
                      Expensa
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
                        : undefined
                    }
                  />

                </Card>

              )
            )}

          </div>

        </section>

      </section>

    </PageContainer>
  );
}


export default LiquidacionDetallePage;