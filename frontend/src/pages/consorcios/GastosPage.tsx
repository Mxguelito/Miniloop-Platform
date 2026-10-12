import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  listarGastos,
} from "../../services/api";

import type {
  Gasto,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";


function GastosPage() {

  const { id } = useParams();

  const [gastos, setGastos] =
    useState<Gasto[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // CARGAR GASTOS
  // =========================

  useEffect(() => {

    const cargarGastos = async () => {
      try {
        setCargando(true);
        setError("");

        const consorcioId = Number(id);

        if (!consorcioId) {
          setError("Consorcio inválido");
          return;
        }

        const data =
          await listarGastos(consorcioId);

        setGastos(data);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        }

      } finally {
        setCargando(false);
      }
    };

    cargarGastos();

  }, [id]);


  // =========================
  // TOTAL
  // =========================

  const totalGastos = gastos.reduce(
    (total, gasto) =>
      total + Number(gasto.monto),
    0
  );


  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>
        <LoadingState
          message="Cargando gastos..."
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
          title="Gastos"
          description={
            "Consultá los gastos registrados del consorcio."
          }
        />


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {!error && gastos.length === 0 ? (

          <EmptyState
            title="Todavía no hay gastos"
            description={
              "No se registraron gastos en este consorcio."
            }
          />

        ) : !error && (

          <>
            <Card className="consortium-expenses-summary">

              <span>
                Total registrado
              </span>

              <strong>
                ${totalGastos.toLocaleString("es-AR")}
              </strong>

            </Card>


            <div className="consortium-expenses-list">

              {gastos.map((gasto) => (

                <Card
                  key={gasto.id}
                  className="consortium-expense-card"
                >

                  <div>
                    <h3>
                      {gasto.concepto}
                    </h3>

                    <p>
                      {new Date(
                        `${gasto.fecha}T00:00:00`
                      ).toLocaleDateString("es-AR")}
                    </p>
                  </div>


                  <strong>
                    $
                    {Number(
                      gasto.monto
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


export default GastosPage;