import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CardTile from "../components/CardTile.jsx";
import DataStatus from "../components/DataStatus.jsx";
import Page from "../components/Page.jsx";
import { dataStatuses, subscribeCardsPage, subscribeWishlistLeaderboardCounts } from "../lib/data.js";

export default function Collection() {
  const [cards, setCards] = useState({});
  const [wishlistCounts, setWishlistCounts] = useState({});
  const [status, setStatus] = useState(dataStatuses.loading);
  const [search, setSearch] = useState("");
  const [style, setStyle] = useState("all");

  useEffect(() => subscribeCardsPage(240, (value, nextStatus) => {
    setCards(value);
    setStatus(nextStatus || dataStatuses.live);
  }), []);

  useEffect(() => subscribeWishlistLeaderboardCounts((value) => setWishlistCounts(value || {})), []);

  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return Object.values(cards)
      .filter((card) => card?.active !== false)
      .filter((card) => style === "all" || String(card?.style || card?.class || "").toLowerCase() === style)
      .filter((card) => !needle || `${card?.name || ""} ${card?.series || ""}`.toLowerCase().includes(needle))
      .slice(0, 80);
  }, [cards, search, style]);

  return (
    <Page className="pb-16">
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Collection</div>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">Card gallery</h1>
          <p className="mt-3 max-w-2xl text-white/62">Read-only public card templates from Firebase with snapshot fallback.</p>
          <DataStatus status={status} className="mt-3" />
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_180px] lg:min-w-[520px]">
          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
            <Search className="h-4 w-4 text-cyan" />
            <input className="w-full bg-transparent text-sm outline-none placeholder:text-white/35" placeholder="Search cards or series" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
            <SlidersHorizontal className="h-4 w-4 text-cyan" />
            <select className="w-full bg-transparent text-sm font-bold outline-none" value={style} onChange={(event) => setStyle(event.target.value)}>
              <option className="bg-ink" value="all">All styles</option>
              <option className="bg-ink" value="azure">Azure</option>
              <option className="bg-ink" value="violet">Violet</option>
              <option className="bg-ink" value="gold">Gold</option>
            </select>
          </label>
        </div>
      </section>

      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">{shown.length} visible cards</h2>
        <span className="text-sm font-bold text-white/46">{Object.keys(cards).length} loaded</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((card) => <CardTile key={card.id} card={card} count={wishlistCounts?.[card.id] || 0} wished={Number(wishlistCounts?.[card.id] || 0) > 0} />)}
        {!shown.length ? (
          <div className="col-span-full rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/58">
            {status?.source === "loading" ? "Loading public cards." : "No public cards matched this filter."}
          </div>
        ) : null}
      </div>
    </Page>
  );
}
