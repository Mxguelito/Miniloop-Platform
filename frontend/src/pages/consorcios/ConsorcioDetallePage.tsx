import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { obtenerConsorcio } from "../../services/api";
import type { Consorcio } from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import Card from "../../components/ui/Card";
import LoadingState from "../../components/ui/LoadingState";
import StatusBadge from "../../components/ui/StatusBadge";

import consorcio3d from "../../assets/dashboard/consorcio-3d.png";

function ConsorcioDetallePage() {
  const { id } = useParams();

  const [consorcio, setConsorcio] =
    useState<Consorcio | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================
  // CARGAR CONSORCIO
  // =========================

  useEffect(() => {
    const cargarConsorcio = async () => {
      try {
        setCargando(true);
        setError("");

        const consorcioId = Number(id);

        if (!consorcioId) {
          setError("Consorcio inválido");
          return;
        }

        const data =
          await obtenerConsorcio(consorcioId);

        setConsorcio(data);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setCargando(false);
      }
    };

    cargarConsorcio();

  }, [id]);

  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>
        <LoadingState
          message="Cargando consorcio..."
        />
      </PageContainer>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !consorcio) {
    return (
      <PageContainer>

        <Link
          className="back-link"
          to="/consorcios"
        >
          ← Volver a mis consorcios
        </Link>

        <div className="error-message">
          {error || "Consorcio no encontrado"}
        </div>

      </PageContainer>
    );
  }

  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-detail-page">

        <Link
          className="back-link"
          to="/consorcios"
        >
          ← Volver a mis consorcios
        </Link>

        {/* =========================
            HERO
        ========================= */}

        <div className="consortium-detail-hero">

          <span className="consortium-detail-hero__eyebrow">
            MI COMUNIDAD
          </span>

          <h1>
            {consorcio.nombre}
          </h1>

          <div className="consortium-detail-hero__address">

            <span className="consortium-detail-hero__pin">
              ●
            </span>

            <span>
              {consorcio.direccion}
            </span>

          </div>

        </div>

        <Card className="consortium-detail-card">

          {/* =========================
              ESTADO
          ========================= */}

          <div className="consortium-detail-card__header">

            <div className="consortium-detail-card__visual">

              <img
                src={consorcio3d}
                alt=""
                className="consortium-detail-card__image"
                aria-hidden="true"
              />

            </div>

            <div className="consortium-detail-card__info">

              <span className="consortium-detail-card__label">
                TU CONSORCIO
              </span>

              <h2>
                {consorcio.nombre}
              </h2>

              <p>
                {consorcio.direccion}
              </p>

              <StatusBadge
                status={consorcio.estado}
              />

            </div>

          </div>

          {/* =========================
              COMUNIDAD
          ========================= */}

          <div className="consortium-detail-section">

            <h2>
              Comunidad
            </h2>

            <p>
              Gestioná las personas y accesos
              de tu consorcio.
            </p>

            <div className="consortium-detail-actions">

              <Link
                className="ui-button ui-button--secondary"
                to={`/consorcios/${consorcio.id}/miembros`}
              >
                Miembros
              </Link>

              <Link
                className="ui-button ui-button--secondary"
                to={`/consorcios/${consorcio.id}/comunicados`}
              >
                Comunicados
              </Link>

              <Link
                className="ui-button ui-button--secondary"
                to={`/consorcios/${consorcio.id}/mis-expensas`}
              >
                Mis expensas
              </Link>

              {consorcio.rol === "ADMINISTRADOR" && (
                <Link
                  className="ui-button ui-button--secondary"
                  to={`/consorcios/${consorcio.id}/invitaciones`}
                >
                  Invitaciones
                </Link>
              )}

            </div>

          </div>

          {/* =========================
              ADMINISTRACIÓN
          ========================= */}

          {consorcio.rol === "ADMINISTRADOR" && (

            <div className="consortium-detail-section">

              <h2>
                Administración
              </h2>

              <p>
                Gestioná el circuito económico
                de tu consorcio paso a paso.
              </p>

              <div className="consortium-detail-actions">

                {/* PASO 1 */}

                <Link
                  className="ui-button ui-button--secondary"
                  to={`/consorcios/${consorcio.id}/unidades`}
                >
                  1. Unidades
                </Link>

                {/* PASO 2 */}

                <Link
                  className="ui-button ui-button--secondary"
                  to={`/consorcios/${consorcio.id}/expensas`}
                >
                  2. Expensas
                </Link>

                {/* PASO 3 */}

                <Link
                  className="ui-button ui-button--secondary"
                  to={`/consorcios/${consorcio.id}/liquidaciones/nueva`}
                >
                  3. Generar liquidación
                </Link>

                {/* PASO 4 */}

                <Link
                  className="ui-button ui-button--secondary"
                  to={`/consorcios/${consorcio.id}/liquidaciones`}
                >
                  4. Ver liquidaciones
                </Link>

                {/* PASO 5 */}

                <Link
                  className="ui-button ui-button--secondary"
                  to={`/consorcios/${consorcio.id}/ingresos`}
                >
                  5. Ver ingresos
                </Link>

                {/* PASO 6 */}

                <Link
                  className="ui-button ui-button--secondary"
                  to={`/consorcios/${consorcio.id}/ingresos/nuevo`}
                >
                  6. Registrar ingreso
                </Link>

                {/* PASO 7 */}

                <Link
                  className="ui-button ui-button--secondary"
                  to={`/consorcios/${consorcio.id}/gastos`}
                >
                  7. Ver gastos
                </Link>

                {/* PASO 8 */}

                <Link
                  className="ui-button ui-button--secondary"
                  to={`/consorcios/${consorcio.id}/gastos/nuevo`}
                >
                  8. Registrar gasto
                </Link>

                {/* PASO 9 */}

                <Link
                  className="ui-button ui-button--secondary"
                  to={`/consorcios/${consorcio.id}/resumen-economico`}
                >
                  9. Resumen económico
                </Link>

              </div>

            </div>

          )}

        </Card>

      </section>

    </PageContainer>
  );
}

export default ConsorcioDetallePage;