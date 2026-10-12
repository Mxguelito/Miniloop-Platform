import type {
  HTMLAttributes,
  ReactNode,
} from "react";


interface CardProps
  extends HTMLAttributes<HTMLDivElement> {

  children: ReactNode;
}


function Card({
  children,
  className = "",
  ...props
}: CardProps) {

  return (
    <div
      className={`ui-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}


export default Card;