import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  activarRepartidor,
  listarZonas,
  type Zona,
} from "../../services/api";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import LoadingState from "../../components/ui/LoadingState";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";


function ActivarDeliveryPage() {
  const navigate = useNavigate();

  const [zonas, setZonas] = useState<Zona[]>([]);
  const [zonaId, setZonaId] = useState("");
  const [transporte, setTransporte] = useState("");

  const [cargandoZonas, setCargandoZonas] = useState(true);
  const [activando, setActivando] = useState(false);
  const [error, setError] = useState("");


  // =========================
  // CARGAR ZONAS
  // =========================

  useEffect(() => {
    const cargarZonas = async () => {
      try {
        setError("");

        const data = await listarZonas();

        setZonas(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No pudimos cargar las zonas"
        );
      } finally {
        setCargandoZonas(false);
      }
    };

    cargarZonas();
  }, []);


  // =========================
  // ACTIVAR DELIVERY
  // =========================

  const handleActivar = async () => {
    if (!zonaId) {
      setError("Seleccioná una zona");
      return;
    }

    if (!transporte) {
      setError("Seleccioná un medio de transporte");
      return;
    }

    try {
      setError("");
      setActivando(true);

      await activarRepartidor({
        zona_id: Number(zonaId),
        transporte,
      });

      navigate("/delivery");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos activar Delivery"
      );
    } finally {
      setActivando(false);
    }
  };


  // =========================
  // PANTALLA
  // =========================

  return (
    <PageContainer>

      <Link
        className="back-link"
        to="/delivery"
      >
        ← Volver a Delivery
      </Link>


      <PageHeader
        title="Activar Delivery"
        description="Elegí dónde querés repartir y cómo vas a realizar tus entregas."
      />


      <Card className="delivery-activate-card">

        {cargandoZonas ? (

          <LoadingState message="Cargando zonas..." />

        ) : (

          <div className="delivery-activate-form">

            <div className="delivery-form-field">

              <label
                className="delivery-form-field__label"
                htmlFor="delivery-zona"
              >
                Zona de trabajo
              </label>

              <select
                id="delivery-zona"
                className="delivery-form-field__select"
                value={zonaId}
                onChange={(event) =>
                  setZonaId(event.target.value)
                }
                disabled={activando}
              >
                <option value="">
                  Seleccioná una zona
                </option>

                {zonas.map((zona) => (
                  <option
                    key={zona.id}
                    value={zona.id}
                  >
                    {zona.nombre}
                  </option>
                ))}
              </select>

            </div>


            <div className="delivery-form-field">

              <label
                className="delivery-form-field__label"
                htmlFor="delivery-transporte"
              >
                Medio de transporte
              </label>

              <select
                id="delivery-transporte"
                className="delivery-form-field__select"
                value={transporte}
                onChange={(event) =>
                  setTransporte(event.target.value)
                }
                disabled={activando}
              >
                <option value="">
                  Seleccioná tu transporte
                </option>

                <option value="A_PIE">
                  A pie
                </option>

                <option value="BICI">
                  Bicicleta
                </option>

                <option value="MOTO">
                  Moto
                </option>

                <option value="AUTO">
                  Auto
                </option>
              </select>

            </div>


            {error && (
              <div
                className="error-message"
                role="alert"
              >
                {error}
              </div>
            )}


            <div className="delivery-activate-actions">

              <Button
                fullWidth
                disabled={activando}
                onClick={handleActivar}
              >
                {activando
                  ? "Activando..."
                  : "Activar Delivery"}
              </Button>

            </div>

          </div>

        )}

      </Card>

    </PageContainer>
  );
}


export default ActivarDeliveryPage;