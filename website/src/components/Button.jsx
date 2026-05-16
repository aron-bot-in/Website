export default function Button({ children, icon: Icon, variant = "primary", className = "", type = "button", ...props }) {
  const styles = variant === "danger"
    ? "border-rose/35 bg-rose/12 text-rose hover:bg-rose/18"
    : variant === "ghost"
      ? "border-white/12 bg-white/[0.04] text-white hover:bg-white/[0.08]"
      : "border-cyan/40 bg-cyan text-ink shadow-[0_0_28px_rgba(64,230,255,0.18)] hover:bg-cyan/90";

  return (
    <button type={type} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`} {...props}>
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span className="truncate">{children}</span>
    </button>
  );
}
