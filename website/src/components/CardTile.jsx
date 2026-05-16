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
    <article className={`data-card group overflow-hidden rounded-lg border border-white/10 bg-panel/88 shadow-card ${compact ? "max-w-[18rem]" : ""}`}>
      <div className="relative aspect-[3/4] bg-white/[0.04]">
        <img src={cardImage(card)} alt={safeText(card?.name, "Aron card")} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" loading="lazy" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] backdrop-blur ${rarityTone[style.id] || rarityTone.azure}`}>
            <Sparkles className="h-3 w-3" />
            {style.label}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/58 to-transparent p-3">
          <div className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-cyan">{safeText(card?.series, "Unknown Series")}</div>
          <div className="line-clamp-2 text-lg font-black leading-tight">{safeText(card?.name, "Unknown Card")}</div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-3 text-sm">
        <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-white/[0.05] px-2 py-1 font-bold text-white/72">
          <Sparkles className="h-3.5 w-3.5 text-violet" />
          <span className="truncate">{gen || style.shortLabel}</span>
        </span>
        <span className={wished ? "rounded-md bg-rose/10 px-2 py-1 font-bold text-rose" : "rounded-md bg-white/[0.05] px-2 py-1 font-bold text-white/70"}>
          <Heart className="mr-1 inline h-3.5 w-3.5" />{wishCount}
        </span>
      </div>
    </article>
  );
}
