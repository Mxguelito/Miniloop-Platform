import { useEffect, useState } from "react";

import "../../styles/miniloop-run.css";

import miniloopRunRider from "../../assets/landing/miniloop-run-rider.png";
import miniloopRunPackage from "../../assets/landing/miniloop-run-package.png";
import miniloopRunBuilding from "../../assets/landing/miniloop-run-building.png";
import miniloopRunMarket from "../../assets/landing/miniloop-run-market.png";

export default function MiniLoopRun() {
  const [jugando, setJugando] = useState(false);
  const [posicion, setPosicion] = useState(13);

  // true = paquete disponible
  // false = paquete recogido
  const [paquetes, setPaquetes] = useState([
    true,
    true,
    true,
  ]);

  const posicionesPaquetes = [34, 57, 77];

  const paquetesRecogidos =
    paquetes.filter((paquete) => !paquete).length;

  const completado = paquetesRecogidos === 3;

  // =========================
  // INICIAR / REINICIAR
  // =========================

  const iniciarJuego = () => {
    setPosicion(13);

    setPaquetes([
      true,
      true,
      true,
    ]);

    setJugando(true);
  };

  // =========================
  // MOVIMIENTO
  // =========================

  useEffect(() => {
    if (!jugando || completado) return;

    const moverJugador = (event: KeyboardEvent) => {
      const tecla = event.key.toLowerCase();

      // IZQUIERDA
      if (
        tecla === "arrowleft" ||
        tecla === "a"
      ) {
        event.preventDefault();

        setPosicion((actual) =>
          Math.max(7, actual - 3)
        );
      }

      // DERECHA
      if (
        tecla === "arrowright" ||
        tecla === "d"
      ) {
        event.preventDefault();

        setPosicion((actual) =>
          Math.min(93, actual + 3)
        );
      }
    };

    window.addEventListener(
      "keydown",
      moverJugador
    );

    return () => {
      window.removeEventListener(
        "keydown",
        moverJugador
      );
    };
  }, [jugando, completado]);

  // =========================
  // COLISIONES
  // =========================

  useEffect(() => {
    if (!jugando || completado) return;

    setPaquetes((actuales) =>
      actuales.map((visible, index) => {
        if (!visible) {
          return false;
        }

        const posicionPaquete =
          posicionesPaquetes[index];

        const distancia = Math.abs(
          posicion - posicionPaquete
        );

        // Si el jugador está cerca,
        // recoge el paquete.
        if (distancia <= 3) {
          return false;
        }

        return true;
      })
    );
  }, [posicion, jugando, completado]);

  return (
    <section className="miniloop-run">

      {/* =========================
          HEADER
      ========================= */}

      <div className="miniloop-run__header">

        <div>
          <span className="miniloop-run__eyebrow">
            ¿UN MINUTO LIBRE?
          </span>

          <h2 className="miniloop-run__title">
            MiniLoop Run
          </h2>

          <p className="miniloop-run__description">
            Recolectá paquetes y conectá el barrio.
          </p>
        </div>

        <div className="miniloop-run__counter">
          {completado
            ? "✓ BARRIO CONECTADO"
            : `📦 ${paquetesRecogidos}/3`}
        </div>

      </div>

      {/* =========================
          JUEGO
      ========================= */}

      <div className="miniloop-run__game">

        {!jugando ? (

          /* =========================
             PANTALLA INICIAL
          ========================= */

          <div className="miniloop-run__start">

            <p>
              El barrio empieza acá.
            </p>

            <button
              type="button"
              className="miniloop-run__play"
              onClick={iniciarJuego}
            >
              ▶ JUGAR
            </button>

          </div>

        ) : (

          /* =========================
             MUNDO DEL JUEGO
          ========================= */

          <div className="miniloop-run__world">

            {/* =========================
                EDIFICIO MINILOOP
            ========================= */}

            <div className="miniloop-run__building">
              <img
                src={miniloopRunBuilding}
                alt=""
                className="miniloop-run__building-image"
                aria-hidden="true"
              />
            </div>

            {/* =========================
                MINI MARKET 24 HS
            ========================= */}

            <div className="miniloop-run__shop">
              <img
                src={miniloopRunMarket}
                alt=""
                className="miniloop-run__shop-image"
                aria-hidden="true"
              />
            </div>

            {/* =========================
                PAQUETE 1
            ========================= */}

            {paquetes[0] && (
              <div
                className="
                  miniloop-run__package
                  miniloop-run__package--1
                "
              >
                <img
                  src={miniloopRunPackage}
                  alt="Paquete MiniLoop"
                  className="miniloop-run__package-image"
                />
              </div>
            )}

            {/* =========================
                PAQUETE 2
            ========================= */}

            {paquetes[1] && (
              <div
                className="
                  miniloop-run__package
                  miniloop-run__package--2
                "
              >
                <img
                  src={miniloopRunPackage}
                  alt="Paquete MiniLoop"
                  className="miniloop-run__package-image"
                />
              </div>
            )}

            {/* =========================
                PAQUETE 3
            ========================= */}

            {paquetes[2] && (
              <div
                className="
                  miniloop-run__package
                  miniloop-run__package--3
                "
              >
                <img
                  src={miniloopRunPackage}
                  alt="Paquete MiniLoop"
                  className="miniloop-run__package-image"
                />
              </div>
            )}

            {/* =========================
                CALLE
            ========================= */}

            <div className="miniloop-run__road" />

            {/* =========================
                REPARTIDOR
            ========================= */}

            <div
              className="miniloop-run__player"
              style={{
                left: `${posicion}%`,
              }}
            >
              <img
                src={miniloopRunRider}
                alt="Repartidor MiniLoop"
                className="miniloop-run__player-image"
              />
            </div>

            {/* =========================
                VICTORIA
            ========================= */}

            {completado && (
              <div className="miniloop-run__victory">

                <span className="miniloop-run__victory-check">
                  ✓
                </span>

                <div>
                  <strong>
                    ¡Barrio conectado!
                  </strong>

                  <p>
                    Entregaste todos los paquetes.
                  </p>
                </div>

                <button
                  type="button"
                  className="miniloop-run__restart"
                  onClick={iniciarJuego}
                >
                  ↻ JUGAR DE NUEVO
                </button>

              </div>
            )}

          </div>
        )}

      </div>

    </section>
  );
}