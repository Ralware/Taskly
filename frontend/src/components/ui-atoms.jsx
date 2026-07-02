// Shared UI atoms — standardized heights, radii, focus states, typography.
// All controls target height 36px (h-9), rounded-md (6px), text-sm.

const BASE_INPUT =
  "h-9 w-full bg-black border border-[#1f1f22] rounded-md px-3 text-sm text-[#F2F2F2] " +
  "placeholder:text-[#71717A] focus:outline-none focus:border-[var(--acid)] transition-colors " +
  "disabled:opacity-50";

export function Input({ className = "", ...props }) {
  return <input className={`${BASE_INPUT} ${className}`} {...props} />;
}

export function Textarea({ className = "", rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full bg-black border border-[#1f1f22] rounded-md px-3 py-2 text-sm text-[#F2F2F2] placeholder:text-[#71717A] focus:outline-none focus:border-[var(--acid)] transition-colors resize-y ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`${BASE_INPUT} pr-8 appearance-none cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, className = "" }) {
  return (
    <label className={`block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5 ${className}`}>
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
        checked ? "bg-[var(--acid)]" : "bg-[#1f1f22] hover:bg-[#2a2a2e]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-black shadow-sm transition-transform duration-200 ease-out ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
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
      "bg-[#121214] text-[#F2F2F2] border border-[#1f1f22] hover:bg-[#1a1a1a] hover:border-[#333]",
    ghost: "text-[#A1A1AA] hover:text-[#F2F2F2] hover:bg-[#121214]",
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
