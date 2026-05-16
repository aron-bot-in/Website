import { Heart, Sparkles } from "lucide-react";
import { cardImage, cardStyle, formatCardGen, safeText } from "../lib/format.js";

const rarityTone = {
  gold: "border-amber-300/35 bg-amber-300/12 text-amber-100",
  violet: "border-violet/35 bg-violet/14 text-violet-100",
  azure: "border-cyan/35 bg-cyan/12 text-cyan"
};

export default function CardTile({ card, copy, wished, count, compact = false }) {
  const style = cardStyle(card, copy);
  const gen = formatCardGen(copy?.gen || card?.gen);
  const wishCount = Number(count || 0);

  return (
    <article className={`card-tilt shine group rounded-xl border border-white/10 bg-panel/86 p-3 shadow-card ${compact ? "max-w-[18rem]" : ""}`}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-white/5">
        <img src={cardImage(card)} alt={safeText(card?.name, "Aron card")} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute left-3 top-3">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${rarityTone[style.id] || rarityTone.azure}`}>
            <Sparkles className="h-3 w-3" />
            {style.label}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/88 to-transparent p-3">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan">{safeText(card?.series, "Unknown Series")}</div>
          <div className="line-clamp-2 text-lg font-black">{safeText(card?.name, "Unknown Card")}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-sm">
        <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 font-semibold text-white/70">
          <Sparkles className="h-3.5 w-3.5 text-violet" />
          {gen || style.shortLabel}
        </span>
        <span className={wished ? "rounded-md bg-rose/10 px-2 py-1 font-bold text-rose" : "rounded-md bg-white/5 px-2 py-1 font-bold text-white/70"}>
          <Heart className="mr-1 inline h-3.5 w-3.5" />{wishCount}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold uppercase tracking-[0.16em] text-white/46">
        <span>{copy?.code ? "Collected copy" : "Card preview"}</span>
        <span>{card?.active === false ? "Inactive" : "Available"}</span>
      </div>
    </article>
  );
}
