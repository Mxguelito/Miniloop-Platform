import { Link } from "react-router-dom";

import type { Pedido } from "../../services/api";

import Card from "../ui/Card";
import StatusBadge from "../ui/StatusBadge";


interface OrderCardProps {
  pedido: Pedido;
}


function OrderCard({
  pedido,
}: OrderCardProps) {

  const fecha = new Date(
    pedido.fecha_creacion
  ).toLocaleDateString(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );


  return (
    <Card className="order-card">

      <div className="order-card__header">

        <div>
          <span className="order-card__number">
            Pedido #{pedido.id}
          </span>

          <h2 className="order-card__business">
            {pedido.comercio.nombre}
          </h2>
        </div>

        <StatusBadge
          status={pedido.estado}
        />

      </div>


      <div className="order-card__info">

        <div className="order-card__info-item">
          <span>Total</span>

          <strong>
            $
            {Number(
              pedido.total
            ).toLocaleString(
              "es-AR",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </strong>
        </div>


        <div className="order-card__info-item">
          <span>Fecha</span>

          <strong>
            {fecha}
          </strong>
        </div>

      </div>


      <Link
        className="order-card__link"
        to={`/mis-pedidos/${pedido.id}`}
      >
        Ver mi pedido
      </Link>

    </Card>
  );
}


export default OrderCard;