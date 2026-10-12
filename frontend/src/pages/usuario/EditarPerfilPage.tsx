import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  actualizarMiPerfil,
  obtenerMiPerfil,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import LoadingState from "../../components/ui/LoadingState";


function EditarPerfilPage() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");


  // =========================
  // CARGAR PERFIL
  // =========================

  useEffect(() => {

    const cargarPerfil = async () => {
      try {
        setCargando(true);
        setError("");

        const usuario =
          await obtenerMiPerfil();

        setNombre(usuario.nombre);
        setEmail(usuario.email);

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
  // GUARDAR
  // =========================

  const guardarCambios = async () => {
    try {
      setError("");

      const nombreLimpio = nombre.trim();
      const emailLimpio = email.trim();

      if (!nombreLimpio || !emailLimpio) {
        setError(
          "Completá el nombre y el correo electrónico."
        );
        return;
      }

      setGuardando(true);

      const usuarioActualizado =
        await actualizarMiPerfil({
          nombre: nombreLimpio,
          email: emailLimpio,
        });

      // Actualizamos también el usuario guardado
      // por el login.
      localStorage.setItem(
        "usuario",
        JSON.stringify(usuarioActualizado)
      );

      navigate("/perfil");

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
          message="Cargando tu perfil..."
        />
      </PageContainer>
    );
  }


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="profile-edit-page">

        <Link
          className="back-link"
          to="/perfil"
        >
          ← Volver a mi perfil
        </Link>


        <PageHeader
          title="Editar mi perfil"
          description="Actualizá la información de tu cuenta."
        />


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        <Card className="profile-edit-card">

          <div className="profile-edit-form">

            <FormField
              label="Nombre"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              disabled={guardando}
            />


            <FormField
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              disabled={guardando}
            />


            <div className="profile-edit-actions">

              <Button
                variant="secondary"
                disabled={guardando}
                onClick={() =>
                  navigate("/perfil")
                }
              >
                Cancelar
              </Button>

              <Button
                disabled={guardando}
                onClick={guardarCambios}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar cambios"}
              </Button>

            </div>

          </div>

        </Card>

      </section>

    </PageContainer>
  );
}


export default EditarPerfilPage;