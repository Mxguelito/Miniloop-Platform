interface LoadingStateProps {
  message?: string;
}


function LoadingState({
  message = "Cargando...",
}: LoadingStateProps) {

  return (
    <div
      className="loading-state"
      role="status"
      aria-live="polite"
    >
      <div className="loading-state__spinner" />

      <p>
        {message}
      </p>
    </div>
  );
}


export default LoadingState;