import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  crearUnidad,
  listarUnidades,
} from "../../services/api";

import type {
  Unidad,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";


function UnidadesPage() {
  const { id } = useParams();

  const [unidades, setUnidades] =
    useState<Unidad[]>([]);

  const [identificador, setIdentificador] =
    useState("");

  const [metrosCuadrados, setMetrosCuadrados] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");


  // =========================
  // CARGAR UNIDADES
  // =========================

  const cargarUnidades = async () => {
    try {
      setError("");

      const consorcioId = Number(id);

      if (!consorcioId) {
        setError("Consorcio inválido");
        return;
      }

      const data =
        await listarUnidades(consorcioId);

      setUnidades(data);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setCargando(false);
    }
  };


  useEffect(() => {
    cargarUnidades();
  }, [id]);


  // =========================
  // CREAR UNIDAD
  // =========================

  const guardarUnidad = async () => {
    try {
      setError("");
      setMensaje("");

      const consorcioId = Number(id);

      const metrosNumero =
        metrosCuadrados
          ? Number(metrosCuadrados)
          : null;


      if (!identificador.trim()) {
        setError(
          "Ingresá el identificador de la unidad."
        );
        return;
      }


      if (
        metrosNumero !== null &&
        (
          Number.isNaN(metrosNumero) ||
          metrosNumero <= 0
        )
      ) {
        setError(
          "Ingresá metros cuadrados válidos."
        );
        return;
      }


      setGuardando(true);


      await crearUnidad(
        consorcioId,
        {
          identificador:
            identificador.trim(),

          metros_cuadrados:
            metrosNumero,
        }
      );


      setIdentificador("");
      setMetrosCuadrados("");

      setMensaje(
        "Unidad agregada correctamente."
      );


      await cargarUnidades();

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setGuardando(false);
    }
  };


  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>
        <LoadingState
          message="Cargando unidades..."
        />
      </PageContainer>
    );
  }


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>
      <section className="consortium-units-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>


        <PageHeader
          title="Unidades"
          description={
            "Administrá las unidades del consorcio."
          }
        />


        {/* =========================
            RESUMEN
        ========================= */}

        <Card className="consortium-units-summary">
          <span>
            Unidades registradas
          </span>

          <strong>
            {unidades.length}
          </strong>

          <p>
            Cada unidad puede tener sus propias
            expensas y movimientos asociados.
          </p>
        </Card>


        {/* =========================
            FORMULARIO
        ========================= */}

        <Card className="consortium-units-form-card">

          <h2>
            Agregar unidad
          </h2>


          <div className="consortium-units-form">

            <FormField
              label="Unidad"
              placeholder="Ej: 1° A"
              value={identificador}
              onChange={(e) =>
                setIdentificador(
                  e.target.value
                )
              }
              disabled={guardando}
            />


            <FormField
              label="Metros cuadrados"
              type="number"
              placeholder="Ej: 50"
              value={metrosCuadrados}
              onChange={(e) =>
                setMetrosCuadrados(
                  e.target.value
                )
              }
              disabled={guardando}
            />


            <Button
              onClick={guardarUnidad}
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : "Agregar unidad"}
            </Button>

          </div>

        </Card>


        {mensaje && (
          <div
            className="success-message"
            role="status"
          >
            {mensaje}
          </div>
        )}


        {error && (
          <div
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}


        {/* =========================
            LISTADO
        ========================= */}

        <section className="consortium-units-list-section">

          <h2>
            Unidades registradas
          </h2>


          {unidades.length === 0 ? (

            <EmptyState
              title="Todavía no hay unidades"
              description={
                "Agregá la primera unidad del consorcio."
              }
            />

          ) : (

            <div className="consortium-units-list">

              {unidades.map((unidad) => (

                <Card
                  key={unidad.id}
                  className="consortium-unit-card"
                >

                  <div>
                    <h3>
                      {unidad.identificador}
                    </h3>

                    <p>
                      {unidad.metros_cuadrados
                        ? `${Number(
                            unidad.metros_cuadrados
                          ).toLocaleString(
                            "es-AR"
                          )} m²`
                        : "Superficie no informada"}
                    </p>
                  </div>

                </Card>

              ))}

            </div>

          )}

        </section>

      </section>
    </PageContainer>
  );
}


export default UnidadesPage;