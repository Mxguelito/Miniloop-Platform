import { Link } from "react-router-dom";

interface BrandHeaderProps {
  tagline?: string;
}

function BrandHeader({
  tagline = "Tu barrio, conectado.",
}: BrandHeaderProps) {
  return (
    <div className="auth-brand">

      <Link
        to="/"
        className="auth-brand__link"
        aria-label="Ir al inicio de MiniLoop"
      >
        <span className="auth-brand__name">
          MINILOOP
        </span>
      </Link>

      <p className="auth-brand__tagline">
        {tagline}
      </p>

    </div>
  );
}

export default BrandHeader;