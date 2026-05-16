import { Heart, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { compactNumber } from "../../lib/format.js";

const tones = {
  rose: "from-rose/40 via-violet/30 to-cyan/18 border-rose/30 shadow-[0_0_34px_rgba(255,79,184,0.12)]",
  cyan: "from-cyan/34 via-violet/24 to-white/8 border-cyan/30 shadow-[0_0_34px_rgba(64,230,255,0.12)]",
  violet: "from-violet/40 via-rose/22 to-cyan/16 border-violet/35 shadow-[0_0_34px_rgba(157,101,255,0.14)]",
  gold: "from-amber-300/34 via-rose/18 to-violet/24 border-amber-200/30 shadow-[0_0_34px_rgba(252,211,77,0.1)]"
};

export default function CardShowcase({ cards }) {
  return (
    <section id="cards" className="mt-10 scroll-mt-28">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Card Showcase</div>
          <h2 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">Collect, Trade, Flex</h2>
          <p className="mt-3 max-w-2xl text-white/62">Preview featured ARON cards with demand, editions, and ownership signals before you jump back into Discord.</p>
        </div>
        <Link to="/guide#cards" className="w-fit rounded-lg border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/72 transition hover:border-cyan/30 hover:text-white">Card guide</Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.id} className="data-card group overflow-hidden rounded-lg border border-white/10 bg-panel/86 shadow-card">
            <div className={`relative aspect-[3/4] overflow-hidden border-b bg-gradient-to-br ${tones[card.tone] || tones.cyan}`}>
              <div className="absolute inset-4 rounded-lg border border-white/18 bg-black/20" />
              <div className="absolute inset-x-0 top-5 flex justify-between px-5">
                <span className="rounded-md border border-white/14 bg-black/28 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">{card.tier}</span>
                <span className="rounded-md border border-white/14 bg-black/28 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan">{card.edition}</span>
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid h-28 w-28 place-items-center rounded-full border border-white/20 bg-white/[0.08] text-4xl font-black text-white shadow-glow transition duration-500 group-hover:scale-110">
                  {card.initials}
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/88 via-black/48 to-transparent p-4">
                <div className="truncate text-[11px] font-black uppercase tracking-[0.18em] text-cyan">{card.series}</div>
                <h3 className="mt-1 truncate text-2xl font-black">{card.name}</h3>
              </div>
            </div>
            <div className="grid gap-3 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-md bg-white/[0.05] px-2.5 py-1 font-bold text-white/70">
                  <Heart className="h-4 w-4 text-rose" />
                  {compactNumber(card.wishlist)} wishlisted
                </span>
                <Sparkles className="h-5 w-5 text-cyan" />
              </div>
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/18 px-3 py-2 text-sm font-bold text-white/58">
                <UserRound className="h-4 w-4 text-cyan" />
                <span className="truncate">{card.status}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
