import { compactNumber } from "../lib/format.js";

export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-white/10 bg-panel/82 p-5 shadow-card transition hover:border-cyan/22">
      <div className="flex items-center justify-between">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-white/46">{label}</div>
        {Icon ? <Icon className="h-5 w-5 text-cyan" /> : null}
      </div>
      <div className="mt-3 text-3xl font-black text-white">{compactNumber(value)}</div>
    </div>
  );
}
