interface StatusBadgeProps {
  status: string;
  label?: string;
}


const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pedido recibido",
  PREPARANDO: "En preparación",
  LISTO: "Listo para retirar",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  GENERADA: "Generada",
  PAGADA: "Pagada",
};


function StatusBadge({
  status,
  label,
}: StatusBadgeProps) {

  const normalizedStatus =
    status.toUpperCase();

  const displayLabel =
    label ??
    STATUS_LABELS[normalizedStatus] ??
    status;

  return (
    <span
      className={
        `status-badge ` +
        `status-badge--${normalizedStatus.toLowerCase()}`
      }
    >
      {displayLabel}
    </span>
  );
}


export default StatusBadge;