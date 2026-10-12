import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import Button from "../../components/ui/Button";

import {
  obtenerMiPerfil,
} from "../../services/api";

import type {
  Usuario,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import LoadingState from "../../components/ui/LoadingState";
import StatusBadge from "../../components/ui/StatusBadge";


function PerfilPage() {
    
    const navigate = useNavigate();
  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // CARGAR PERFIL
  // =========================

  useEffect(() => {

    const cargarPerfil = async () => {
      try {
        setCargando(true);
        setError("");

        const data =
          await obtenerMiPerfil();

        setUsuario(data);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        }

      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();

  }, []);


  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <PageContainer>
        <LoadingState
          message="Cargando tu perfil..."
        />
      </PageContainer>
    );
  }


  // =========================
  // ERROR
  // =========================

  if (error || !usuario) {
    return (
      <PageContainer>

        <Link
          className="back-link"
          to="/app"
        >
          ← Volver al inicio
        </Link>

        <div className="error-message">
          {error || "No se pudo cargar tu perfil"}
        </div>

      </PageContainer>
    );
  }


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="profile-page">

        <Link
          className="back-link"
          to="/app"
        >
          ← Volver al inicio
        </Link>


        <PageHeader
          title="Mi perfil"
          description="Consultá la información de tu cuenta."
        />


        <Card className="profile-card">

          <div className="profile-card__avatar">
            {usuario.nombre
              .charAt(0)
              .toUpperCase()}
          </div>


          <div className="profile-card__header">

            <div>
              <h2>
                {usuario.nombre}
              </h2>

              <p>
                {usuario.email}
              </p>
            </div>

            <StatusBadge
              status={usuario.estado}
            />

          </div>


          <div className="profile-card__details">

            <div className="profile-detail">
              <span>
                Nombre
              </span>

              <strong>
                {usuario.nombre}
              </strong>
            </div>


            <div className="profile-detail">
              <span>
                Correo electrónico
              </span>

              <strong>
                {usuario.email}
              </strong>
            </div>

          </div>

          <div className="profile-card__actions">

  <Button
    onClick={() =>
      navigate("/perfil/editar")
    }
  >
    Editar perfil
  </Button>

</div>

        </Card>

      </section>

    </PageContainer>
  );
}


export default PerfilPage;