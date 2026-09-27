import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "ghost";
};

export function Button({
  children,
  className = "",
  loading = false,
  loadingText = "Please wait...",
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] focus-visible:outline-[var(--accent)]"
      : "bg-transparent text-[var(--foreground)] hover:bg-[var(--accent-soft)] focus-visible:outline-[var(--accent)]";

  return (
    <button
      type="button"
      className={`inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}
