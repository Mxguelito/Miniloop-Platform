import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  listarMisConsorcios,
} from "../../services/api";

import type {
  Consorcio,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import consorcio3d from "../../assets/dashboard/consorcio-3d.png";


function ConsorciosPage() {
  const navigate = useNavigate();

  const [consorcios, setConsorcios] =
    useState<Consorcio[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // CARGAR CONSORCIOS
  // =========================

  useEffect(() => {

    const cargarConsorcios = async () => {
      try {
        setCargando(true);
        setError("");

        const data =
          await listarMisConsorcios();

        setConsorcios(data);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        }

      } finally {
        setCargando(false);
      }
    };

    cargarConsorcios();

  }, []);


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-page">

        <Link
          className="back-link"
          to="/app"
        >
          ← Volver al inicio
        </Link>


        <PageHeader
          title="Mis consorcios"
          description="Accedé a las comunidades de las que formás parte."
        />


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {cargando ? (

          <LoadingState
            message="Cargando tus consorcios..."
          />

        ) : consorcios.length === 0 ? (

          <EmptyState
  title="Todavía no tenés consorcios"
  description="Creá tu primera comunidad para empezar."
/>

        ) : (

          <div className="consortium-grid">

            {consorcios.map((consorcio) => (

              <Card
                key={consorcio.id}
                className="consortium-card"
              >

               <div className="consortium-card__icon">
  <img
    src={consorcio3d}
    alt=""
    className="consortium-card__image"
    aria-hidden="true"
  />
</div>


                <div className="consortium-card__content">

                  <h3>
                    {consorcio.nombre}
                  </h3>

                  <p className="consortium-card__address">
                    {consorcio.direccion}
                  </p>

                  <StatusBadge
                    status={consorcio.estado}
                  />

                </div>


                <Button
  variant="secondary"
  onClick={() =>
    navigate(`/consorcios/${consorcio.id}`)
  }
>
  Ver consorcio
</Button>

              </Card>

            ))}

          </div>

        )}


        <div className="consortium-create">

  <Button
    variant="secondary"
    onClick={() =>
      navigate("/consorcios/unirse")
    }
  >
    Unirme con código
  </Button>

  <Button
    onClick={() =>
      navigate("/consorcios/nuevo")
    }
  >
    + Crear consorcio
  </Button>

</div>

      </section>

    </PageContainer>
  );
}


export default ConsorciosPage;