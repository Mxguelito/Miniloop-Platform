interface BrandHeaderProps {
  tagline?: string;
}


function BrandHeader({
  tagline = "Tu barrio, conectado.",
}: BrandHeaderProps) {

  return (
    <header className="brand-header">

      <div className="brand-header__logo">
        MINILOOP
      </div>

      {tagline && (
        <p className="brand-header__tagline">
          {tagline}
        </p>
      )}

    </header>
  );
}


export default BrandHeader;