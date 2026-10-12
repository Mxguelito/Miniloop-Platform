import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  crearComunicado,
  listarComunicados,
  obtenerConsorcio,
} from "../../services/api";

import type {
  Comunicado,
  Consorcio,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";


function ComunicadosConsorcioPage() {
  const { id } = useParams();

  const [consorcio, setConsorcio] =
    useState<Consorcio | null>(null);

  const [comunicados, setComunicados] =
    useState<Comunicado[]>([]);

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [cargando, setCargando] = useState(true);
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState("");


  // =========================
  // CARGAR DATOS
  // =========================

  useEffect(() => {

    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const consorcioId = Number(id);

        if (!consorcioId) {
          setError("Consorcio inválido");
          return;
        }

        const [
          datosConsorcio,
          datosComunicados,
        ] = await Promise.all([
          obtenerConsorcio(consorcioId),
          listarComunicados(consorcioId),
        ]);

        setConsorcio(datosConsorcio);
        setComunicados(datosComunicados);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        }

      } finally {
        setCargando(false);
      }
    };

    cargarDatos();

  }, [id]);


  // =========================
  // PUBLICAR
  // =========================

  const publicar = async () => {
    try {
      setError("");

      const consorcioId = Number(id);
      const tituloLimpio = titulo.trim();
      const mensajeLimpio = mensaje.trim();

      if (
        !consorcioId ||
        !tituloLimpio ||
        !mensajeLimpio
      ) {
        setError(
          "Completá el título y el mensaje."
        );
        return;
      }

      setPublicando(true);

      const nuevoComunicado =
        await crearComunicado(
          consorcioId,
          {
            titulo: tituloLimpio,
            mensaje: mensajeLimpio,
          }
        );

      setComunicados((actuales) => [
        nuevoComunicado,
        ...actuales,
      ]);

      setTitulo("");
      setMensaje("");

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setPublicando(false);
    }
  };


  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>
        <LoadingState
          message="Cargando comunicados..."
        />
      </PageContainer>
    );
  }


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-communications-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>


        <PageHeader
          title="Comunicados"
          description="Novedades e información importante de tu comunidad."
        />


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {consorcio?.rol === "ADMINISTRADOR" && (

          <Card className="consortium-communication-form-card">

            <div className="consortium-communication-form-card__header">
              <h2>
                Publicar comunicado
              </h2>

              <p>
                Compartí información importante
                con los miembros del consorcio.
              </p>
            </div>


            <div className="consortium-communication-form">

              <FormField
                label="Título"
                placeholder="Ej: Corte de agua"
                value={titulo}
                onChange={(e) =>
                  setTitulo(e.target.value)
                }
                disabled={publicando}
              />


              <div className="consortium-communication-field">
                <label htmlFor="comunicado-mensaje">
                  Mensaje
                </label>

                <textarea
                  id="comunicado-mensaje"
                  placeholder="Escribí el comunicado..."
                  value={mensaje}
                  onChange={(e) =>
                    setMensaje(e.target.value)
                  }
                  disabled={publicando}
                  rows={4}
                />
              </div>


              <Button
                disabled={publicando}
                onClick={publicar}
              >
                {publicando
                  ? "Publicando..."
                  : "Publicar comunicado"}
              </Button>

            </div>

          </Card>
        )}


        <div className="consortium-communications-section">

          <h2>
            Últimos comunicados
          </h2>


          {comunicados.length === 0 ? (

            <EmptyState
              title="Todavía no hay comunicados"
              description="Cuando se publique una novedad, aparecerá acá."
            />

          ) : (

            <div className="consortium-communications-list">

              {comunicados.map((comunicado) => (

                <Card
                  key={comunicado.id}
                  className="consortium-communication-card"
                >

                  <h3>
                    {comunicado.titulo}
                  </h3>

                  <p>
                    {comunicado.mensaje}
                  </p>

                  <span className="consortium-communication-card__date">
                    {new Date(
                      comunicado.fecha_creacion
                    ).toLocaleString()}
                  </span>

                </Card>

              ))}

            </div>

          )}

        </div>

      </section>

    </PageContainer>
  );
}


export default ComunicadosConsorcioPage;