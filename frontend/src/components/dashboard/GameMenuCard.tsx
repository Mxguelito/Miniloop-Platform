type GameMenuCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant: "blue" | "orange" | "green" | "purple";
  badge?: number;
  disabled?: boolean;
  onClick?: () => void;
};



export default function GameMenuCard({
  title,
  description,
  icon,
  variant,
  badge,
  disabled = false,
  onClick,
}: GameMenuCardProps) {


  return (
    <button
      type="button"
      className={`game-menu-card game-menu-card--${variant}`}
      disabled={disabled}
      onClick={onClick}
    >

      {badge !== undefined && badge > 0 && (
  <span className="game-menu-card__badge">
    {badge}
  </span>
)}
      <div className="game-menu-card__icon">{icon}</div>

      <h2 className="game-menu-card__title">{title}</h2>

      <p className="game-menu-card__description">{description}</p>

      {disabled && (
        <span className="game-menu-card__status">Próximamente</span>
      )}
    </button>
  );
}