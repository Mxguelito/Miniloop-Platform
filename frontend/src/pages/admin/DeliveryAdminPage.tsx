import { useEffect, useState } from "react";

import {
  listarIncidenciasDelivery,
  resolverIncidenciaDelivery,
  regenerarCodigoEntregaAdmin,
  type IncidenciaEntrega,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

function DeliveryAdminPage() {

    const [incidencias, setIncidencias] =
  useState<IncidenciaEntrega[]>([]);

const [cargando, setCargando] =
  useState(true);

const [error, setError] =
  useState("");

  

const [resoluciones, setResoluciones] =
  useState<Record<number, string>>({});



const [incidenciaResolviendo, setIncidenciaResolviendo] =
  useState<number | null>(null);

  const [entregaRegenerando, setEntregaRegenerando] =
  useState<number | null>(null);

  const [mensaje, setMensaje] =
  useState("");


  useEffect(() => {
  const cargarIncidencias = async () => {
    try {
      setError("");
      setCargando(true);

      const data =
        await listarIncidenciasDelivery();

      setIncidencias(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos cargar las incidencias"
      );
    } finally {
      setCargando(false);
    }
  };

  cargarIncidencias();
}, []);


// =========================
// RESOLVER INCIDENCIA
// =========================

const handleResolverIncidencia = async (
  incidenciaId: number
) => {
  const resolucion =
    resoluciones[incidenciaId]?.trim() ?? "";

  if (!resolucion) {
    setError("Escribí una resolución");
    return;
  }

  try {
    setError("");
    setIncidenciaResolviendo(incidenciaId);

    await resolverIncidenciaDelivery(
      incidenciaId,
      resolucion
    );

    setIncidencias((actuales) =>
      actuales.filter(
        (incidencia) =>
          incidencia.id !== incidenciaId
      )
    );

    setResoluciones((actuales) => {
      const nuevas = { ...actuales };

      delete nuevas[incidenciaId];

      return nuevas;
    });
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "No pudimos resolver la incidencia"
    );
  } finally {
    setIncidenciaResolviendo(null);
  }
};


// =========================
// REGENERAR CÓDIGO
// =========================

const handleRegenerarCodigo = async (
  entregaId: number
) => {
  try {
    setError("");
    setMensaje("");
    setEntregaRegenerando(entregaId);

    await regenerarCodigoEntregaAdmin(
      entregaId
    );

    setMensaje(
      `Código de la entrega #${entregaId} regenerado correctamente.`
    );
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "No pudimos regenerar el código"
    );
  } finally {
    setEntregaRegenerando(null);
  }
};



  return (
    <PageContainer>
      <PageHeader
        title="Administración Delivery"
        description="Gestioná las incidencias del sistema de entregas."
      />


      {mensaje && (
  <p className="delivery-admin__mensaje">
    {mensaje}
  </p>
)}

     <Card>
  <h2>Incidencias Delivery</h2>

  {cargando && (
    <p>Cargando incidencias...</p>
  )}

  {error && (
    <p>{error}</p>
  )}

  {!cargando &&
    !error &&
    incidencias.length === 0 && (
      <p>
        No hay incidencias abiertas.
      </p>
    )}

  {!cargando &&
    !error &&
    incidencias.map((incidencia) => (
      <div
        key={incidencia.id}
        className="delivery-admin__incidencia"
      >
        <h3>
          Incidencia #{incidencia.id}
        </h3>

        <p>
          Entrega:{" "}
          <strong>
            #{incidencia.entrega_id}
          </strong>
        </p>

        <p>
          Tipo:{" "}
          <strong>
            {incidencia.tipo}
          </strong>
        </p>

        <p>
          Estado:{" "}
          <strong>
            {incidencia.estado}
          </strong>
        </p>

        {incidencia.descripcion && (
          <p>
            {incidencia.descripcion}
          </p>
        )}

        <p>
          Fecha:{" "}
          {new Date(
            incidencia.fecha_creacion
          ).toLocaleString("es-AR")}
        </p>

       <textarea
  value={resoluciones[incidencia.id] ?? ""}
  onChange={(e) =>
    setResoluciones((actuales) => ({
      ...actuales,
      [incidencia.id]: e.target.value,
    }))
  }
  placeholder="Escribí la resolución..."
  rows={3}
/>

<button
  type="button"
  onClick={() =>
    handleResolverIncidencia(incidencia.id)
  }
  disabled={
    incidenciaResolviendo === incidencia.id ||
    !(resoluciones[incidencia.id]?.trim())
  }
>
  {incidenciaResolviendo === incidencia.id
    ? "RESOLVIENDO..."
    : "RESOLVER INCIDENCIA"}
</button>

<button
  type="button"
  onClick={() =>
    handleRegenerarCodigo(
      incidencia.entrega_id
    )
  }
  disabled={
    entregaRegenerando ===
    incidencia.entrega_id
  }
>
  {entregaRegenerando ===
  incidencia.entrega_id
    ? "REGENERANDO..."
    : "REGENERAR CÓDIGO"}
</button>


      </div>
    ))}
</Card>
    </PageContainer>
  );
}

export default DeliveryAdminPage;