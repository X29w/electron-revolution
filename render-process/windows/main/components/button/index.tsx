import type { ButtonHTMLAttributes, FC } from "react";
import "./index.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const Button: FC<ButtonProps> = ({ children, ...props }) => (
  <button type="button" className="btn" {...props}>
    {children}
  </button>
);

export default Button;
