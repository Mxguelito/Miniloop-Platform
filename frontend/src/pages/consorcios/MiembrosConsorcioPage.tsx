import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  listarMiembrosConsorcio,
  listarUnidades,
  asignarUnidadMiembro,
} from "../../services/api";

import type {
  MiembroConsorcio,
  Unidad,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import LoadingState from "../../components/ui/LoadingState";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import miembroRobot3d from "../../assets/consorcios/miembro-robot-3d.png";


function MiembrosConsorcioPage() {

  const { id } = useParams();

  const [miembros, setMiembros] =
    useState<MiembroConsorcio[]>([]);

  const [unidades, setUnidades] =
    useState<Unidad[]>([]);

  const [unidadesSeleccionadas, setUnidadesSeleccionadas] =
    useState<Record<number, string>>({});

  const [asignando, setAsignando] =
    useState<number | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");


  // =========================
  // CARGAR DATOS
  // =========================

  useEffect(() => {

    const cargarDatos = async () => {
      try {

        setCargando(true);
        setError("");

        const consorcioId = Number(id);

        if (!consorcioId) {
          setError("Consorcio inválido");
          return;
        }

        const [
          miembrosData,
          unidadesData,
        ] = await Promise.all([
          listarMiembrosConsorcio(
            consorcioId
          ),
          listarUnidades(
            consorcioId
          ),
        ]);

        setMiembros(miembrosData);
        setUnidades(unidadesData);
        const seleccionesIniciales: Record<number, string> = {};

miembrosData.forEach((miembro) => {
  if (miembro.unidad_id) {
    seleccionesIniciales[miembro.id] =
      String(miembro.unidad_id);
  }
});

setUnidadesSeleccionadas(
  seleccionesIniciales
);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        }

      } finally {

        setCargando(false);

      }
    };

    cargarDatos();

  }, [id]);


  // =========================
  // CAMBIAR UNIDAD
  // =========================

  const cambiarUnidad = (
    miembroId: number,
    unidadId: string
  ) => {

    setUnidadesSeleccionadas(
      (actuales) => ({
        ...actuales,
        [miembroId]: unidadId,
      })
    );

  };


  // =========================
  // ASIGNAR UNIDAD
  // =========================

  const asignarUnidad = async (
    miembroId: number
  ) => {

    try {

      setError("");
      setMensaje("");

      const consorcioId = Number(id);

      const unidadId = Number(
        unidadesSeleccionadas[miembroId]
      );

      if (!consorcioId) {
        setError("Consorcio inválido");
        return;
      }

      if (!unidadId) {
        setError(
          "Seleccioná una unidad."
        );
        return;
      }

      setAsignando(miembroId);

      await asignarUnidadMiembro(
        consorcioId,
        miembroId,
        unidadId
      );

      setMensaje(
        "Unidad asignada correctamente."
      );

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {

      setAsignando(null);

    }

  };


  // =========================
  // CARGANDO
  // =========================

  if (cargando) {

    return (
      <PageContainer>

        <LoadingState
          message="Cargando miembros..."
        />

      </PageContainer>
    );

  }


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-members-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>


        <PageHeader
          title="Miembros"
          description={
            "Personas que forman parte de este consorcio."
          }
        />


        {error && (
          <div
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}


        {mensaje && (
          <div
            className="success-message"
            role="status"
          >
            {mensaje}
          </div>
        )}


        <div className="consortium-members-list">

          {miembros.map((miembro) => (

            <Card
              key={miembro.id}
              className="consortium-member-card"
            >

              <div className="consortium-member-card__content">

                <div className="consortium-member-card__info">

                 <div className="consortium-member-card__avatar">
  <img
    src={miembroRobot3d}
    alt=""
    className="consortium-member-card__avatar-image"
    aria-hidden="true"
  />
</div>

                  <div className="consortium-member-card__text">

                    <h3>
                      {miembro.nombre}
                    </h3>

                    <p>
                      {miembro.email}
                    </p>

                  </div>

                </div>


                <StatusBadge
                  status={miembro.rol}
                />

              </div>


              <div className="consortium-member-card__unit">

  <label>

    Unidad asignada

    <select
      value={
        unidadesSeleccionadas[
          miembro.id
        ] ?? ""
      }
      onChange={(e) =>
        cambiarUnidad(
          miembro.id,
          e.target.value
        )
      }
      disabled={
        asignando === miembro.id
      }
    >

      <option value="">
        Seleccionar unidad
      </option>

      {unidades.map(
        (unidad) => (

          <option
            key={unidad.id}
            value={unidad.id}
          >
            {unidad.identificador}
          </option>

        )
      )}

    </select>

  </label>


  <Button
    onClick={() =>
      asignarUnidad(
        miembro.id
      )
    }
    disabled={
      asignando === miembro.id
    }
  >
    {asignando === miembro.id
      ? "Asignando..."
      : "Asignar"}
  </Button>

</div>

            </Card>

          ))}

        </div>

      </section>

    </PageContainer>
  );
}


export default MiembrosConsorcioPage;