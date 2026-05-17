import { Activity, Heart, Sparkles, Swords } from "lucide-react";
import { cardStyle, formatCardGen, safeText } from "../lib/format.js";

const rarityTone = {
  gold: "border-amber-300/35 bg-amber-300/12 text-amber-100",
  violet: "border-violet/35 bg-violet/14 text-violet-100",
  azure: "border-cyan/35 bg-cyan/12 text-cyan"
};

function statValue(value) {
  const number = Math.max(0, Math.floor(Number(value || 0)));
  if (number >= 1000000) return `${Math.round(number / 100000) / 10}M`;
  if (number >= 1000) return `${Math.round(number / 100) / 10}K`;
  return String(number);
}

export default function CardTile({ card, copy, wished, count, compact = false }) {
  const style = cardStyle(card, copy);
  const gen = formatCardGen(copy?.gen || card?.gen);
  const wishCount = Number(count || 0);
  const imageUrl = card?.imageUrl || card?.image;
  const stats = card?.stats && typeof card.stats === "object" ? card.stats : null;
  const hasStats = stats && ["hp", "attack", "defense", "speed"].some((key) => Number(stats[key] || 0) > 0);

  return (
    <article className={`data-card group overflow-hidden rounded-lg border border-white/10 bg-panel/88 shadow-card ${compact ? "max-w-[18rem]" : ""}`}>
      <div className="relative aspect-[3/4] bg-white/[0.04]">
        {imageUrl ? (
          <img src={imageUrl} alt={safeText(card?.name, "Aron card")} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]" loading="lazy" />
        ) : (
          <div className="flex h-full w-full flex-col justify-between bg-[linear-gradient(145deg,rgba(134,240,240,0.16),rgba(143,0,242,0.14)_46%,rgba(240,143,176,0.12))] p-4">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-cyan">ARON Card</span>
            <span className="text-3xl font-black leading-tight text-white">{safeText(card?.name, "Unrevealed")}</span>
            <span className="text-sm font-bold text-white/56">{safeText(card?.series, "Series pending")}</span>
          </div>
        )}
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
      {hasStats ? (
        <div className="grid grid-cols-4 gap-1 border-t border-white/10 px-3 pt-3 text-[11px] font-black">
          <span className="truncate rounded-md bg-emerald-300/10 px-1.5 py-1 text-center text-emerald-100">HP {statValue(stats.hp)}</span>
          <span className="truncate rounded-md bg-rose/10 px-1.5 py-1 text-center text-rose">ATK {statValue(stats.attack)}</span>
          <span className="truncate rounded-md bg-cyan/10 px-1.5 py-1 text-center text-cyan">DEF {statValue(stats.defense)}</span>
          <span className="truncate rounded-md bg-amber-300/10 px-1.5 py-1 text-center text-amber-100">SPD {statValue(stats.speed)}</span>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-3 text-sm">
        <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-white/[0.05] px-2 py-1 font-bold text-white/72">
          {hasStats ? <Activity className="h-3.5 w-3.5 text-cyan" /> : <Sparkles className="h-3.5 w-3.5 text-violet" />}
          <span className="truncate">{hasStats ? `${stats.element || "Neutral"} / SPC ${statValue(stats.special)}` : gen || style.shortLabel}</span>
        </span>
        <span className={wished ? "rounded-md bg-rose/10 px-2 py-1 font-bold text-rose" : "rounded-md bg-white/[0.05] px-2 py-1 font-bold text-white/70"}>
          {hasStats ? <Swords className="mr-1 inline h-3.5 w-3.5" /> : <Heart className="mr-1 inline h-3.5 w-3.5" />}{hasStats ? gen || style.shortLabel : wishCount}
        </span>
      </div>
    </article>
  );
}
