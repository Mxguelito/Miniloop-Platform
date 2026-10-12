import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  listarLiquidaciones,
} from "../../services/api";

import type {
  Liquidacion,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";
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


function LiquidacionesPage() {

  const { id } = useParams();

  const [liquidaciones, setLiquidaciones] =
    useState<Liquidacion[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // CARGAR LIQUIDACIONES
  // =========================

  useEffect(() => {

    const cargarLiquidaciones = async () => {
      try {

        setError("");

        const consorcioId = Number(id);

        if (!consorcioId) {
          setError("Consorcio inválido");
          return;
        }

        const data =
          await listarLiquidaciones(
            consorcioId
          );

        setLiquidaciones(data);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        }

      } finally {
        setCargando(false);
      }
    };

    cargarLiquidaciones();

  }, [id]);


  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>

        <LoadingState
          message="Cargando liquidaciones..."
        />

      </PageContainer>
    );
  }


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-liquidations-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>


        <PageHeader
          title="Liquidaciones"
          description={
            "Consultá las liquidaciones generadas del consorcio."
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


        {liquidaciones.length === 0 ? (

          <EmptyState
            title="Todavía no hay liquidaciones"
            description={
              "Cuando se genere una liquidación aparecerá acá."
            }
          />

        ) : (

          <div className="consortium-liquidations-list">

            {liquidaciones.map(
              (liquidacion) => (

                <Card
                  key={liquidacion.id}
                  className="consortium-liquidation-card"
                >

                  <div className="consortium-liquidation-card__main">

                    <div>

                      <span className="consortium-liquidation-card__label">
                        Período
                      </span>

                      <h2>
                        {MESES[liquidacion.mes]}{" "}
                        {liquidacion.anio}
                      </h2>

                    </div>


                    <StatusBadge
                      status={liquidacion.estado}
                    />

                  </div>


                  <div className="consortium-liquidation-card__amount">

                    <span>
                      Total liquidado
                    </span>

                    <strong>
                      {Number(
                        liquidacion.total_gastos
                      ).toLocaleString(
                        "es-AR",
                        {
                          style: "currency",
                          currency: "ARS",
                        }
                      )}
                    </strong>

                  </div>


                  <div className="consortium-liquidation-card__footer">

                    <span>
                      Generada el{" "}
                      {new Date(
                        `${liquidacion.fecha_generacion}T00:00:00`
                      ).toLocaleDateString(
                        "es-AR"
                      )}
                    </span>

                  </div>

                  <Link
  className="ui-button ui-button--secondary"
  to={
    `/consorcios/${id}/liquidaciones/${liquidacion.id}`
  }
>
  Ver detalle
</Link>

                </Card>

              )
            )}

          </div>

        )}

      </section>

    </PageContainer>
  );
}


export default LiquidacionesPage;