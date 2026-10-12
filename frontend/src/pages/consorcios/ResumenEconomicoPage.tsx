import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  obtenerResumenEconomico,
} from "../../services/api";

import type {
  ResumenEconomico,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import LoadingState from "../../components/ui/LoadingState";


function ResumenEconomicoPage() {

  const { id } = useParams();

  const [resumen, setResumen] =
    useState<ResumenEconomico | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // CARGAR RESUMEN
  // =========================

  useEffect(() => {

    const cargarResumen = async () => {
      try {

        setCargando(true);
        setError("");

        const consorcioId = Number(id);

        if (!consorcioId) {
          setError("Consorcio inválido");
          return;
        }

        const data =
          await obtenerResumenEconomico(
            consorcioId
          );

        setResumen(data);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        }

      } finally {
        setCargando(false);
      }
    };

    cargarResumen();

  }, [id]);


  // =========================
  // FORMATEAR DINERO
  // =========================

  const formatearDinero = (
    valor: number
  ) => {
    return Number(valor).toLocaleString(
      "es-AR"
    );
  };


  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>
        <LoadingState
          message="Cargando resumen económico..."
        />
      </PageContainer>
    );
  }


  // =========================
  // ERROR
  // =========================

  if (error || !resumen) {
    return (
      <PageContainer>

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>

        <div className="error-message">
          {error || "No pudimos obtener el resumen"}
        </div>

      </PageContainer>
    );
  }


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-summary-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>


        <PageHeader
          title="Resumen económico"
          description={
            "Consultá de forma clara el estado de los fondos del consorcio."
          }
        />


        <div className="consortium-summary-grid">

          <Card className="consortium-summary-card">

            <span>
              Total ingresos
            </span>

            <strong>
              $
              {formatearDinero(
                resumen.total_ingresos
              )}
            </strong>

          </Card>


          <Card className="consortium-summary-card">

            <span>
              Total gastos
            </span>

            <strong>
              $
              {formatearDinero(
                resumen.total_gastos
              )}
            </strong>

          </Card>


          <Card className="consortium-summary-card consortium-summary-card--balance">

            <span>
              Saldo disponible
            </span>

            <strong>
              $
              {formatearDinero(
                resumen.saldo
              )}
            </strong>

          </Card>

        </div>

      </section>

    </PageContainer>
  );
}


export default ResumenEconomicoPage;