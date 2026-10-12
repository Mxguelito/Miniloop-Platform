import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { crearIngreso } from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";


function RegistrarIngresoPage() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [concepto, setConcepto] =
    useState("");

  const [monto, setMonto] =
    useState("");

  const [fecha, setFecha] =
    useState("");

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");


  // =========================
  // REGISTRAR INGRESO
  // =========================

  const registrarIngreso = async () => {
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

      await crearIngreso(
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

      <section className="consortium-income-create-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>


        <PageHeader
          title="Registrar ingreso"
          description={
            "Registrá un fondo o ingreso del consorcio."
          }
        />


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        <Card className="consortium-income-form-card">

          <div className="consortium-income-form">

            <FormField
              label="Concepto"
              placeholder="Ej: Saldo inicial"
              value={concepto}
              onChange={(e) =>
                setConcepto(e.target.value)
              }
              disabled={guardando}
            />


            <FormField
              label="Monto"
              type="number"
              placeholder="Ej: 500000"
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


            <div className="consortium-income-form__actions">

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
                onClick={registrarIngreso}
              >
                {guardando
                  ? "Registrando..."
                  : "Registrar ingreso"}
              </Button>

            </div>

          </div>

        </Card>

      </section>

    </PageContainer>
  );
}


export default RegistrarIngresoPage;