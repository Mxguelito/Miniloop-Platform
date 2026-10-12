import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  generarInvitacionConsorcio,
} from "../../services/api";

import type {
  InvitacionConsorcio,
} from "../../services/api";

import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";


function InvitacionesConsorcioPage() {
  const { id } = useParams();

  const [invitacion, setInvitacion] =
    useState<InvitacionConsorcio | null>(null);

  const [generando, setGenerando] =
    useState(false);

  const [error, setError] =
    useState("");


  // =========================
  // GENERAR INVITACIÓN
  // =========================

  const generarInvitacion = async () => {
    try {
      setError("");

      const consorcioId = Number(id);

      if (!consorcioId) {
        setError("Consorcio inválido");
        return;
      }

      setGenerando(true);

      const nuevaInvitacion =
        await generarInvitacionConsorcio(
          consorcioId
        );

      setInvitacion(nuevaInvitacion);

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      }

    } finally {
      setGenerando(false);
    }
  };


  // =========================
  // VISTA
  // =========================

  return (
    <PageContainer>

      <section className="consortium-invitations-page">

        <Link
          className="back-link"
          to={`/consorcios/${id}`}
        >
          ← Volver al consorcio
        </Link>


        <PageHeader
          title="Invitaciones"
          description="Generá un código para sumar una persona a tu consorcio."
        />


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {!invitacion ? (

          <Card className="consortium-invitation-create">

            <div>
              <h2>
                Nueva invitación
              </h2>

              <p>
                Generá un código y compartilo
                con la persona que querés sumar.
              </p>
            </div>


            <Button
              disabled={generando}
              onClick={generarInvitacion}
            >
              {generando
                ? "Generando..."
                : "Generar invitación"}
            </Button>

          </Card>

        ) : (

          <Card className="consortium-invitation-result">

            <div className="consortium-invitation-result__header">

              <div>
                <h2>
                  Invitación creada
                </h2>

                <p>
                  Compartí este código con
                  la persona que querés sumar.
                </p>
              </div>

              <StatusBadge
                status={invitacion.estado}
              />

            </div>


            <div className="consortium-invitation-code">

              <span>
                Código de invitación
              </span>

              <strong>
                {invitacion.codigo}
              </strong>

            </div>

          </Card>

        )}

      </section>

    </PageContainer>
  );
}


export default InvitacionesConsorcioPage;