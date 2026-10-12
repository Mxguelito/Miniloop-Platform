import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  listarIngresos,
} from "../../services/api";

import type {
  Ingreso,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";

function IngresosPage() {
  const { id } = useParams();

  const [ingresos, setIngresos] =
    useState<Ingreso[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================
  // CARGAR INGRESOS
  // =========================

  useEffect(() => {
    const cargarIngresos = async () => {
      try {
        setCargando(true);
        setError("");

        const consorcioId = Number(id);

        if (!consorcioId) {
          setError("Consorcio inválido");
          return;
        }

        const data =
          await listarIngresos(consorcioId);

        setIngresos(data);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setCargando(false);
      }
    };

    cargarIngresos();

  }, [id]);

  // =========================
  // TOTAL
  // =========================

  const totalIngresos = ingresos.reduce(
    (total, ingreso) =>
      total + Number(ingreso.monto),
    0
  );

  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>
        <LoadingState
          message="Cargando ingresos..."
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
          title="Ingresos"
          description={
            "Consultá los ingresos registrados del consorcio."
          }
        />

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!error && ingresos.length === 0 ? (
          <EmptyState
            title="Todavía no hay ingresos"
            description={
              "No se registraron ingresos en este consorcio."
            }
          />
        ) : !error && (
          <>
            <Card className="consortium-expenses-summary">
              <span>
                Total registrado
              </span>

              <strong>
                ${totalIngresos.toLocaleString("es-AR")}
              </strong>
            </Card>

            <div className="consortium-expenses-list">

              {ingresos.map((ingreso) => (
                <Card
                  key={ingreso.id}
                  className="consortium-expense-card"
                >
                  <div>
                    <h3>
                      {ingreso.concepto}
                    </h3>

                    <p>
                      {new Date(
                        `${ingreso.fecha}T00:00:00`
                      ).toLocaleDateString("es-AR")}
                    </p>
                  </div>

                  <strong>
                    $
                    {Number(
                      ingreso.monto
                    ).toLocaleString("es-AR")}
                  </strong>

                </Card>
              ))}

            </div>
          </>
        )}

      </section>
    </PageContainer>
  );
}

export default IngresosPage;