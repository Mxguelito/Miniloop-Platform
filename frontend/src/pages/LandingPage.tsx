import { useNavigate } from "react-router-dom";

import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";
import miniloopHero3d from "../assets/landing/miniloop-hero-3d-v2.png";

import MiniLoopRun from "../components/minigame/MiniLoopRun";

import consorcio3d from "../assets/landing/landing-consorcio-3d.png";
import comercio3d from "../assets/landing/landing-comercio-3d.png";
import delivery3d from "../assets/landing/landing-delivery-3d.png";

import miniloopEcosystem3d from "../assets/landing/miniloop-ecosystem-3d.png";
import miniloopInfinity3d from "../assets/landing/miniloop-infinity-3d.png";



function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="landing-navbar">

        <div className="landing-navbar__content">

          <button
            className="landing-logo"
            onClick={() => navigate("/")}
          >
            MINILOOP
          </button>

          <nav className="landing-navbar__actions">

            <button
              className="landing-login"
              onClick={() => navigate("/login")}
            >
              Iniciar sesión
            </button>

            <button
              className="ui-button ui-button--primary"
              onClick={() => navigate("/registro")}
            >
              Crear cuenta
            </button>

          </nav>

        </div>

      </header>


      {/* =========================
          HERO
      ========================= */}

      <PageContainer>

        <section className="landing-hero">

          <div className="landing-hero__content">

            <span className="landing-eyebrow">
              TU BARRIO, CONECTADO
            </span>

            <h1>
              Tu día a día,
              <span> más simple.</span>
            </h1>

            <p className="landing-hero__description">
              Comprá en comercios cercanos,
              administrá tu comunidad y resolvé
              lo que necesitás desde un solo lugar.
            </p>

            <div className="landing-hero__actions">

              <button
                className="ui-button ui-button--primary landing-hero__primary"
                onClick={() => navigate("/registro")}
              >
                Empezar ahora
              </button>

              <button
                className="landing-hero__secondary"
                onClick={() => navigate("/login")}
              >
                Ya tengo una cuenta →
              </button>

            </div>

            <p className="landing-hero__note">
              Simple. Cercano. Todo conectado.
            </p>

          </div>


      {/* VISUAL 3D */}
<div className="landing-hero__visual">
  <img
    src={miniloopHero3d}
    alt="Ecosistema MiniLoop"
    className="landing-hero__image"
  />
</div>

        </section>
        {/* =========================
    MINI JUEGO
========================= */}
<MiniLoopRun />


        {/* =========================
            ECOSISTEMA
        ========================= */}

        <section className="landing-features">

          <div className="landing-section-header">

            <span className="landing-eyebrow">
              TODO EN UN SOLO LUGAR
            </span>

            <h2>
              Lo que necesitás,
              cerca tuyo.
            </h2>

            <p>
              MiniLoop conecta las cosas que forman
              parte de tu día a día.
            </p>

          </div>


          <div className="landing-features__grid">

            <Card className="landing-feature-card">

             <div className="landing-feature-card__visual">
  <img
    src={consorcio3d}
    alt=""
    className="landing-feature-card__image"
    aria-hidden="true"
  />
</div>

              <h3>
                Consorcios
              </h3>

              <p>
                Administrá información, avisos,
                gastos y servicios de tu comunidad
                de manera simple.
              </p>

              <span className="landing-feature-card__status">
                Próximamente
              </span>

            </Card>


            <Card className="landing-feature-card landing-feature-card--featured">

             <div className="landing-feature-card__visual">
  <img
    src={comercio3d}
    alt=""
    className="landing-feature-card__image"
    aria-hidden="true"
  />
</div>

              <h3>
                Comercios
              </h3>

              <p>
                Encontrá comercios de tu barrio,
                elegí productos y hacé tus pedidos
                en pocos pasos.
              </p>

             <div className="landing-feature-card__available">
  <span className="landing-feature-card__available-dot" />

  <button
    className="landing-feature-card__link"
    onClick={() => navigate("/registro")}
  >
      COMPRAR →
  </button>
</div>

            </Card>


            <Card className="landing-feature-card">

          <div className="landing-feature-card__visual">
  <img
    src={delivery3d}
    alt=""
    className="landing-feature-card__image"
    aria-hidden="true"
  />
</div>

              <h3>
                Delivery
              </h3>

              <p>
                Recibí tus compras de forma simple
                y seguí cada pedido desde MiniLoop.
              </p>

              <span className="landing-feature-card__status">
                Próximamente
              </span>

            </Card>

          </div>

        </section>


       {/* =========================
    CONCEPTO
========================= */}
<section className="landing-concept">

  <div className="landing-concept__visual">
    <img
      src={miniloopEcosystem3d}
      alt=""
      className="landing-concept__image"
      aria-hidden="true"
    />
  </div>

  <div className="landing-concept__content">
    <span className="landing-eyebrow">
      HECHO PARA LO COTIDIANO
    </span>

    <h2>
      Menos complicaciones.
      <br />
      Más soluciones.
    </h2>

    <p>
      MiniLoop conecta personas,
      comercios y comunidades para hacer
      más simples esas tareas que forman
      parte de todos los días.
    </p>
  </div>

</section>


        {/* =========================
            CTA FINAL
        ========================= */}

        <section className="landing-cta">

          <div>

            <span className="landing-cta__eyebrow">
              EMPEZÁ HOY
            </span>

            <h2>
              Todo empieza cerca.
            </h2>

            <p>
              Sumate a MiniLoop y empezá a
              conectar con tu barrio.
            </p>

          </div>


          <div className="landing-cta__actions">

            <button
              className="landing-cta__primary"
              onClick={() => navigate("/registro")}
            >
              Crear mi cuenta
            </button>

            <button
              className="landing-cta__login"
              onClick={() => navigate("/login")}
            >
              Iniciar sesión
            </button>

          </div>

        </section>

      </PageContainer>


     {/* =========================
    FOOTER
========================= */}
<footer className="landing-footer">
  <div className="landing-footer__content">

    <div className="landing-footer__brand">
      <img
        src={miniloopInfinity3d}
        alt=""
        className="landing-footer__logo"
        aria-hidden="true"
      />

      <div className="landing-footer__brand-text">
        <strong>MINILOOP</strong>

        <p>
          Tu barrio, conectado.
        </p>
      </div>
    </div>

    <span className="landing-footer__copyright">
      © 2026 MiniLoop
    </span>

  </div>
</footer>

    </main>
  );
}


export default LandingPage;