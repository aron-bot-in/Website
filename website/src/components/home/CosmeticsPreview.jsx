import { Badge, Frame, Image, Lock, Sparkles, Unlock } from "lucide-react";
import { Link } from "react-router-dom";

const cosmeticIcons = {
  Frame,
  Background: Image,
  Badge
};

const toneBars = {
  gold: "from-amber-300/70 to-rose/70",
  cyan: "from-cyan/80 to-violet/70",
  rose: "from-rose/80 to-violet/70"
};

export default function CosmeticsPreview({ cosmetics }) {
  return (
    <section id="cosmetics" className="mt-14 scroll-mt-28">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Cosmetics</div>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Dress the collection, not just the count</h2>
          <p className="mt-3 max-w-2xl leading-8 text-white/62">Frames, backgrounds, badges, and locked chase items give profiles a little more table presence.</p>
          <Link to="/cosmetics" className="mt-5 inline-flex rounded-lg border border-cyan/35 bg-cyan px-4 py-2 text-sm font-black text-ink transition hover:bg-cyan/90">Open cosmetics</Link>
        </div>

        <div className="rounded-lg border border-white/10 bg-panel/82 p-4 shadow-card">
          <div className="grid gap-4 md:grid-cols-[240px_1fr]">
            <div className="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-lg border border-cyan/32 bg-gradient-to-br from-cyan/24 via-violet/20 to-rose/20 p-3 shadow-glow">
              <div className="rounded-md border-2 border-amber-200/60 bg-black/35 p-3">
                <div className="grid aspect-[3/4] place-items-center rounded-md bg-gradient-to-br from-ink via-panel to-violet/30">
                  <Sparkles className="h-16 w-16 text-cyan" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-black">Sample Hero</span>
                  <span className="rounded bg-cyan/12 px-2 py-1 text-[10px] font-black text-cyan">AUR</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {cosmetics.map((item) => {
                const Icon = cosmeticIcons[item.type] || Sparkles;
                const locked = item.state === "Locked";
                return (
                  <article key={item.name} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${toneBars[item.tone] || toneBars.cyan}`}>
                      <Icon className="h-6 w-6 text-ink" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-black">{item.name}</span>
                      <span className="text-sm font-bold text-white/50">{item.type} preview</span>
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-black ${locked ? "border-white/10 bg-white/[0.04] text-white/42" : "border-cyan/24 bg-cyan/10 text-cyan"}`}>
                      {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                      {item.state}
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
