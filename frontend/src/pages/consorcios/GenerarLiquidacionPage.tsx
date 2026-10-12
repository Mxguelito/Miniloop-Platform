import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  generarLiquidacion,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";


function GenerarLiquidacionPage() {

  const { id } = useParams();
  const navigate = useNavigate();

  const fechaActual = new Date();

  const [mes, setMes] = useState(
    String(fechaActual.getMonth() + 1)
  );

  const [anio, setAnio] = useState(
    String(fechaActual.getFullYear())
  );

  const [generando, setGenerando] =
    useState(false);

  const [error, setError] =
    useState("");


  // =========================
  // GENERAR LIQUIDACIÓN
  // =========================

  const generar = async () => {
    try {

      setError("");

      const consorcioId = Number(id);
      const mesNumero = Number(mes);
      const anioNumero = Number(anio);

      if (!consorcioId) {
        setError("Consorcio inválido");
        return;
      }

      if (
        !Number.isInteger(mesNumero) ||
        mesNumero < 1 ||
        mesNumero > 12
      ) {
        setError(
          "Ingresá un mes válido entre 1 y 12."
        );
        return;
      }

      if (
        !Number.isInteger(anioNumero) ||
        anioNumero < 2000
      ) {
        setError(
          "Ingresá un año válido."
        );
        return;
      }

      setGenerando(true);

      const liquidacion =
        await generarLiquidacion(
          consorcioId,
          {
            mes: mesNumero,
            anio: anioNumero,
          }
        );

      navigate(
        `/consorcios/${consorcioId}`,
        {
          state: {
            mensaje:
              `Liquidación ${liquidacion.mes}/${liquidacion.anio} generada correctamente`,
          },
        }
      );

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setGenerando(false);
    }
  };


  return (
    <PageContainer>

      <section className="consortium-liquidation-create-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>


        <PageHeader
  title="Generar liquidación"
  description={
    "Seleccioná el período que querés liquidar."
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


        <Card className="consortium-liquidation-form-card">

          <div className="consortium-liquidation-form">

            <FormField
              label="Mes"
              type="number"
              value={mes}
              onChange={(e) =>
                setMes(e.target.value)
              }
              disabled={generando}
            />


            <FormField
              label="Año"
              type="number"
              value={anio}
              onChange={(e) =>
                setAnio(e.target.value)
              }
              disabled={generando}
            />


            <div className="consortium-liquidation-form__info">
  <strong>
    ¿Qué hará MiniLoop?
  </strong>
  <p>
    Agrupará las expensas cargadas
    para este período y calculará
    el total de la liquidación.
  </p>
</div>


            <div className="consortium-liquidation-form__actions">

              <Button
                variant="secondary"
                disabled={generando}
                onClick={() =>
                  navigate(
                    `/consorcios/${id}`
                  )
                }
              >
                Cancelar
              </Button>


              <Button
                disabled={generando}
                onClick={generar}
              >
                {generando
                  ? "Generando..."
                  : "Generar liquidación"}
              </Button>

            </div>

          </div>

        </Card>

      </section>

    </PageContainer>
  );
}


export default GenerarLiquidacionPage;