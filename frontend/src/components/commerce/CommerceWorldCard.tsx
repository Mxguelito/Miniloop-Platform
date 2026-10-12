import { Link } from "react-router-dom";
import kiosco3d from "../../assets/comercios/kiosco-3d.png";
import comercio3d from "../../assets/comercios/comercio-3d.png";
import panaderia3d from "../../assets/comercios/panaderia-3d.png";

type CommerceWorldCardProps = {
  id: number;
  nombre: string;
  categoria: string;
  direccion: string;
};

export default function CommerceWorldCard({
  id,
  nombre,
  categoria,
  direccion,
}: CommerceWorldCardProps) {

    const imagenesPorCategoria: Record<string, string> = {
  kiosco: kiosco3d,
  panaderia: panaderia3d,
  "panadería": panaderia3d,
};

const categoriaNormalizada = categoria
  .trim()
  .toLowerCase();

const imagen =
  imagenesPorCategoria[categoriaNormalizada] ??
  comercio3d;
  return (
    <article className="commerce-world-card">

      <div className="commerce-world-card__visual">
  <img
    src={imagen}
    alt=""
    className="commerce-world-card__image"
    aria-hidden="true"
  />
</div>

      <div className="commerce-world-card__content">

        <span className="commerce-world-card__category">
          {categoria}
        </span>

        <h3 className="commerce-world-card__title">
          {nombre}
        </h3>

        <p className="commerce-world-card__address">
          <span aria-hidden="true">📍</span>
          {direccion}
        </p>

      </div>

      <Link
  to={`/comercios/${id}`}
  className="commerce-world-card__button"
>
  <span aria-hidden="true">▶</span>
  ENTRAR
</Link>

    </article>
  );
}