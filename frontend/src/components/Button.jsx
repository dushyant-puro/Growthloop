import { Loader2 } from "lucide-react";

/**
 * Reusable Button component for GrowthLoop SaaS UI
 * Variants: primary, secondary, ai, danger, icon, ghost
 */
export function Button({
  children,
  variant = "secondary",
  size = "md",
  icon: Icon,
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  onClick,
  title,
  ...props
}) {
  const variantClass = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ai: "btn-ai",
    danger: "btn-danger",
    icon: "btn-icon",
    ghost: "btn-ghost",
  }[variant] || "btn-secondary";

  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      {...props}
    >
      {loading ? (
        <Loader2 className="btn-spinner spin" size={variant === "icon" ? 16 : 14} />
      ) : Icon ? (
        <Icon size={variant === "icon" ? 17 : 15} className="btn-icon-svg" />
      ) : null}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
}

export default Button;
