import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { crearUsuario } from "../services/api";
import type { Usuario } from "../services/api";

import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";
import BrandHeader from "../components/ui/BrandHeader";
import FormField from "../components/ui/FormField";

function RegisterPage() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [error, setError] =
    useState("");

  const [registrando, setRegistrando] =
    useState(false);


  // =========================
  // REGISTRAR
  // =========================

  const registrar = async () => {
    try {
      setError("");
      setUsuario(null);

      const nombreLimpio = nombre.trim();
      const emailLimpio = email.trim();

      if (
        !nombreLimpio ||
        !emailLimpio ||
        !password
      ) {
        setError(
          "Completá todos los campos para continuar."
        );
        return;
      }

      setRegistrando(true);

      const nuevoUsuario =
        await crearUsuario({
          nombre: nombreLimpio,
          email: emailLimpio,
          password,
        });

      setUsuario(nuevoUsuario);

      setNombre("");
      setEmail("");
      setPassword("");

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setRegistrando(false);
    }
  };


  // =========================
  // VISTA
  // =========================
return (
  <PageContainer>

    <section className="auth-page">

      {/* VOLVER A LANDING */}

      <div className="auth-back">
        <Link
          className="back-link"
          to="/"
        >
          ← Volver al inicio
        </Link>
      </div>


      <BrandHeader />


        <Card className="auth-card">

          {!usuario ? (
            <>

              <div className="auth-card__header">

                <h1>Crear cuenta</h1>

                <p>
                  Empezá a comprar y conectarte
                  con los comercios de tu barrio.
                </p>

              </div>


              <div className="auth-form">

               <FormField
  label="Tu nombre"
  type="text"
  placeholder="Ej: Víctor"
  value={nombre}
  onChange={(e) => setNombre(e.target.value)}
  autoComplete="name"
  disabled={registrando}
/>


               <FormField
  label="Correo electrónico"
  type="email"
  placeholder="nombre@correo.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  autoComplete="email"
  disabled={registrando}
/>


                <FormField
  label="Contraseña"
  type="password"
  placeholder="Creá una contraseña"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  autoComplete="new-password"
  disabled={registrando}
/>


                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}


                <button
                  className="
                    ui-button
                    ui-button--primary
                    ui-button--full
                  "
                  type="button"
                  disabled={registrando}
                  onClick={registrar}
                >
                  {registrando
                    ? "Creando cuenta..."
                    : "Crear mi cuenta"}
                </button>

              </div>


              <div className="auth-footer">

                <span>
                  ¿Ya tenés una cuenta?
                </span>

                <Link to="/login">
                  Iniciar sesión
                </Link>

              </div>

            </>
          ) : (
            <div className="auth-success">

              <div className="auth-success__icon">
                ✓
              </div>

              <h1>
                Tu cuenta está lista
              </h1>

              <p>
                Bienvenido,{" "}
                <strong>
                  {usuario.nombre}
                </strong>.
              </p>

              <p className="text-secondary">
                Ya podés iniciar sesión y
                empezar a usar MiniLoop.
              </p>

              <button
                className="
                  ui-button
                  ui-button--primary
                  ui-button--full
                "
                onClick={() =>
                  navigate("/login")
                }
              >
                Iniciar sesión
              </button>

            </div>
          )}

        </Card>


        <p className="auth-help">
          Simple, rápido y cerca de vos.
        </p>

      </section>

    </PageContainer>
  );
}


export default RegisterPage;