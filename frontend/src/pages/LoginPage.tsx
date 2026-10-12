import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUsuario } from "../services/api";
import FormField from "../components/ui/FormField";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";
import BrandHeader from "../components/ui/BrandHeader";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");
  
  const [error, setError] =
    useState("");

  const [cargando, setCargando] =
    useState(false);


  // =========================
  // INICIAR SESIÓN
  // =========================

  const ingresar = async (
    event?: FormEvent
  ) => {
    event?.preventDefault();

    try {
      setError("");

      const emailLimpio =
        email.trim();

      if (!emailLimpio || !password) {
        setError(
          "Completá tu correo y contraseña para continuar."
        );
        return;
      }

      setCargando(true);

      const respuesta =
        await loginUsuario({
          email: emailLimpio,
          password,
        });

      localStorage.setItem(
        "access_token",
        respuesta.access_token
      );

      localStorage.setItem(
        "usuario",
        JSON.stringify(
          respuesta.usuario
        )
      );

      navigate("/app");

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "No se pudo iniciar sesión."
        );
      }

    } finally {
      setCargando(false);
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


      {/* MARCA */}

      <BrandHeader />


        {/* LOGIN */}

        <Card className="auth-card">

          <div className="auth-card__header">

            <h1>
              Iniciar sesión
            </h1>

            <p>
              Ingresá a MiniLoop y encontrá
              todo lo que necesitás cerca tuyo.
            </p>

          </div>


          <form
            className="auth-form"
            onSubmit={ingresar}
          >

            {/* EMAIL */}

<FormField
  label="Correo electrónico"
  type="email"
  placeholder="nombre@correo.com"
  value={email}
  onChange={(e) =>
    setEmail(e.target.value)
  }
  autoComplete="email"
  disabled={cargando}
/>


{/* PASSWORD */}

<FormField
  label="Contraseña"
  type="password"
  placeholder="Ingresá tu contraseña"
  value={password}
  onChange={(e) =>
    setPassword(e.target.value)
  }
  autoComplete="current-password"
  disabled={cargando}
/>


            {/* ERROR */}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}


            {/* BOTÓN */}

            <button
              className="
                ui-button
                ui-button--primary
                ui-button--full
              "
              type="submit"
              disabled={cargando}
            >
              {cargando
                ? "Ingresando..."
                : "Ingresar"}
            </button>

          </form>


          {/* REGISTRO */}

          <div className="auth-footer">

            <span>
              ¿Todavía no tenés una cuenta?
            </span>

            <Link to="/registro">
              Crear cuenta
            </Link>

          </div>

        </Card>


        <p className="auth-help">
          Tus comercios de siempre, más cerca.
        </p>

      </section>

    </PageContainer>
  );
}


export default LoginPage;