import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";


interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {

  children: ReactNode;

  variant?: "primary" | "secondary" | "danger";

  fullWidth?: boolean;
}


function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {

  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    fullWidth ? "ui-button--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}


export default Button;