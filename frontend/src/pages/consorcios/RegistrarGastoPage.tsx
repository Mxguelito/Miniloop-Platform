import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { crearGasto } from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";


function RegistrarGastoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  // =========================
  // REGISTRAR GASTO
  // =========================

  const registrarGasto = async () => {
    try {
      setError("");

      const consorcioId = Number(id);
      const montoNumero = Number(monto);

      if (!consorcioId) {
        setError("Consorcio inválido");
        return;
      }

      if (
        !concepto.trim() ||
        !monto ||
        !fecha
      ) {
        setError(
          "Completá todos los campos."
        );
        return;
      }

      if (
        Number.isNaN(montoNumero) ||
        montoNumero <= 0
      ) {
        setError(
          "Ingresá un monto válido."
        );
        return;
      }

      setGuardando(true);

      await crearGasto(
        consorcioId,
        {
          concepto: concepto.trim(),
          monto: montoNumero,
          fecha,
        }
      );

      navigate(
        `/consorcios/${consorcioId}`
      );

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setGuardando(false);
    }
  };


  return (
    <PageContainer>

      <section className="consortium-expense-create-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>


        <PageHeader
          title="Registrar gasto"
          description={
            "Agregá un gasto realizado por el consorcio."
          }
        />


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        <Card className="consortium-expense-form-card">

          <div className="consortium-expense-form">

            <FormField
              label="Concepto"
              placeholder="Ej: Electricidad"
              value={concepto}
              onChange={(e) =>
                setConcepto(e.target.value)
              }
              disabled={guardando}
            />


            <FormField
              label="Monto"
              type="number"
              placeholder="Ej: 180000"
              value={monto}
              onChange={(e) =>
                setMonto(e.target.value)
              }
              disabled={guardando}
            />


            <FormField
              label="Fecha"
              type="date"
              value={fecha}
              onChange={(e) =>
                setFecha(e.target.value)
              }
              disabled={guardando}
            />


            <div className="consortium-expense-form__actions">

              <Button
                variant="secondary"
                disabled={guardando}
                onClick={() =>
                  navigate(`/consorcios/${id}`)
                }
              >
                Cancelar
              </Button>

              <Button
                disabled={guardando}
                onClick={registrarGasto}
              >
                {guardando
                  ? "Registrando..."
                  : "Registrar gasto"}
              </Button>

            </div>

          </div>

        </Card>

      </section>

    </PageContainer>
  );
}


export default RegistrarGastoPage;