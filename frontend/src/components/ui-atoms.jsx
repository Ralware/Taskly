// Shared UI atoms — standardized heights, radii, focus states, typography.
// All controls target height 36px (h-9), rounded-md (6px), text-sm.

const BASE_INPUT =
  "h-9 w-full rounded-md border px-3 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--acid)] transition-colors " +
  "disabled:opacity-50";

export function Input({ className = "", ...props }) {
  return <input className={`${BASE_INPUT} ${className}`} style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--text-primary)" }} {...props} />;
}

export function Textarea({ className = "", rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full rounded-md border px-3 py-2 text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--acid)] transition-colors resize-y ${className}`}
      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--text-primary)" }}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`${BASE_INPUT} pr-8 appearance-none cursor-pointer ${className}`}
      style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--text-primary)" }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, className = "" }) {
  return (
    <label className={`block text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] mb-1.5 ${className}`}>
      {children}
    </label>
  );
}

/**
 * Switch — track 44x24 with 20x20 thumb.
 * Thumb sits at inset 2px on both axes; translates by exactly (44 - 20 - 2 - 2) = 20px.
 * Guarantees perfect vertical centering and equal L/R gap.
 */
export function Switch({ checked, onChange, testid, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-testid={testid}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--acid)]/40 ${
        checked ? "bg-[var(--acid)]" : "bg-[var(--border)] hover:bg-[var(--surface-raised)]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full shadow-sm transition-transform duration-200 ease-out ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
        style={{ backgroundColor: "var(--background)" }}
      />
    </button>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  testid,
  ...props
}) {
  const variants = {
    primary:
      "bg-[var(--acid)] text-black hover:bg-[var(--acid-hover)] focus:ring-2 focus:ring-[var(--acid)]/40",
    secondary:
      "bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-raised)] hover:border-[var(--border-hover)]",
    ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]",
    danger: "bg-transparent text-[#FF3366] hover:bg-[#FF3366]/10",
  };
  return (
    <button
      type={props.type || "button"}
      data-testid={testid}
      className={`inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
