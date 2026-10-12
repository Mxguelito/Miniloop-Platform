import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { unirseAConsorcio } from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";


function UnirseConsorcioPage() {
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [uniendo, setUniendo] = useState(false);


  // =========================
  // UNIRSE
  // =========================

  const unirse = async () => {
    try {
      setError("");

      const codigoLimpio =
        codigo.trim().toUpperCase();

      if (!codigoLimpio) {
        setError(
          "Ingresá un código de invitación."
        );
        return;
      }

      setUniendo(true);

      const consorcio =
        await unirseAConsorcio(
          codigoLimpio
        );

      navigate(
        `/consorcios/${consorcio.id}`
      );

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setUniendo(false);
    }
  };


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-join-page">

        <Link
          className="back-link"
          to="/consorcios"
        >
          ← Volver a mis consorcios
        </Link>


        <PageHeader
          title="Unirme a un consorcio"
          description="Ingresá el código que te compartieron para sumarte a la comunidad."
        />


        <Card className="consortium-join-card">

          <div className="consortium-join-card__header">

            <h2>
              Código de invitación
            </h2>

            <p>
              Ingresá el código generado por
              el administrador del consorcio.
            </p>

          </div>


          <div className="consortium-join-form">

            <FormField
              label="Código"
              placeholder="Ej: AC028R"
              value={codigo}
              onChange={(e) =>
                setCodigo(
                  e.target.value.toUpperCase()
                )
              }
              disabled={uniendo}
            />


            {error && (
              <div className="error-message">
                {error}
              </div>
            )}


            <div className="consortium-join-form__actions">

              <Button
                variant="secondary"
                disabled={uniendo}
                onClick={() =>
                  navigate("/consorcios")
                }
              >
                Cancelar
              </Button>

              <Button
                disabled={uniendo}
                onClick={unirse}
              >
                {uniendo
                  ? "Uniéndote..."
                  : "Unirme al consorcio"}
              </Button>

            </div>

          </div>

        </Card>

      </section>

    </PageContainer>
  );
}


export default UnirseConsorcioPage;