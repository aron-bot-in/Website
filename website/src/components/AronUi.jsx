import { Archive, ChevronRight } from "lucide-react";

const chipTones = {
  cyan: "border-cyan/26 bg-cyan/10 text-cyan",
  violet: "border-violet/28 bg-violet/12 text-violet-100",
  rose: "border-rose/28 bg-rose/12 text-rose",
  gold: "border-amber-300/28 bg-amber-300/12 text-amber-100",
  green: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  muted: "border-white/12 bg-white/[0.045] text-white/56"
};

export function Panel({ eyebrow, title, description, action, children, className = "", contentClassName = "grid gap-3" }) {
  return (
    <section className={`rounded-lg border border-white/10 bg-panel/84 p-5 shadow-card ${className}`}>
      {(eyebrow || title || action) ? (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan">{eyebrow}</div> : null}
            {title ? <h2 className="mt-1 text-2xl font-black leading-tight text-white">{title}</h2> : null}
            {description ? <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/58">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}

export function Chip({ children, tone = "cyan", icon: Icon, className = "" }) {
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${chipTones[tone] || chipTones.cyan} ${className}`}>
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  );
}

export function StatRow({ icon: Icon, label, value, meta }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm">
      <span className="inline-flex min-w-0 items-center gap-2 font-bold text-white/60">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-cyan" /> : null}
        <span className="truncate">{label}</span>
      </span>
      <span className="min-w-0 text-right">
        <span className="block truncate font-black text-white">{value}</span>
        {meta ? <span className="block truncate text-[11px] font-bold text-white/38">{meta}</span> : null}
      </span>
    </div>
  );
}

export function InventoryRow({ icon: Icon = Archive, title, subtitle, amount, chips = [] }) {
  return (
    <article className="group grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 transition hover:border-cyan/24 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-cyan/18 bg-cyan/[0.08] text-cyan">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-black text-white">{title}</span>
        {subtitle ? <span className="mt-1 block truncate text-sm font-semibold text-white/50">{subtitle}</span> : null}
        {chips.length ? (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((chip, index) => (
              <Chip key={`${chip.label}-${index}`} tone={chip.tone || "muted"}>{chip.label}</Chip>
            ))}
          </span>
        ) : null}
      </span>
      {amount ? <span className="inline-flex items-center justify-end gap-1 text-right text-sm font-black text-cyan">{amount}</span> : <ChevronRight className="hidden h-4 w-4 justify-self-end text-white/24 sm:block" />}
    </article>
  );
}

export function EmptyState({ icon: Icon = Archive, title, children, action, className = "" }) {
  return (
    <div className={`rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-6 text-center ${className}`}>
      <Icon className="mx-auto h-9 w-9 text-cyan/80" />
      <h3 className="mt-4 text-xl font-black text-white">{title}</h3>
      {children ? <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-white/54">{children}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
