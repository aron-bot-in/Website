const toneBySource = {
  live: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  fallback: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  limited: "border-cyan/25 bg-cyan/10 text-cyan",
  unavailable: "border-white/15 bg-white/5 text-white/58",
  error: "border-rose/25 bg-rose/10 text-rose",
  loading: "border-white/15 bg-white/5 text-white/58"
};

export default function DataStatus({ status, className = "" }) {
  const source = status?.source || "loading";
  const label = status?.label || "Loading ARON data";
  return (
    <span className={`inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${toneBySource[source] || toneBySource.loading} ${className}`}>
      <span className={`mr-2 h-1.5 w-1.5 rounded-full bg-current ${source === "loading" ? "animate-pulse" : ""}`} />
      {label}
    </span>
  );
}
