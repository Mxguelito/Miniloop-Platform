import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { crearConsorcio } from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";


function CrearConsorcioPage() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");

  const [error, setError] = useState("");
  const [creando, setCreando] = useState(false);


  // =========================
  // CREAR CONSORCIO
  // =========================

  const guardarConsorcio = async () => {
    try {
      setError("");

      const nombreLimpio = nombre.trim();
      const direccionLimpia = direccion.trim();

      if (!nombreLimpio || !direccionLimpia) {
        setError(
          "Completá todos los campos para crear el consorcio."
        );
        return;
      }

      setCreando(true);

      await crearConsorcio({
        nombre: nombreLimpio,
        direccion: direccionLimpia,
      });

      navigate("/app");

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setCreando(false);
    }
  };


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-create-page">

        <Link
          className="back-link"
          to="/app"
        >
          ← Volver al inicio
        </Link>


        <PageHeader
          title="Crear consorcio"
          description="Creá el espacio de tu comunidad en MiniLoop."
        />


        <Card className="consortium-form-card">

          <div className="consortium-form-card__header">

            <h2>
              Datos del consorcio
            </h2>

            <p>
              Solo necesitamos la información
              básica para empezar.
            </p>

          </div>


          <div className="consortium-form">

            <FormField
              label="Nombre"
              placeholder="Ej: Consorcio Las Palmeras"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              disabled={creando}
            />


            <FormField
              label="Dirección"
              placeholder="Ej: Av. Corrientes 1234"
              value={direccion}
              onChange={(e) =>
                setDireccion(e.target.value)
              }
              disabled={creando}
            />


            {error && (
              <div className="error-message">
                {error}
              </div>
            )}


            <div className="consortium-form__actions">

              <Button
                variant="secondary"
                disabled={creando}
                onClick={() =>
                  navigate("/app")
                }
              >
                Cancelar
              </Button>


              <Button
                disabled={creando}
                onClick={guardarConsorcio}
              >
                {creando
                  ? "Creando..."
                  : "Crear consorcio"}
              </Button>

            </div>

          </div>

        </Card>

      </section>

    </PageContainer>
  );
}


export default CrearConsorcioPage;