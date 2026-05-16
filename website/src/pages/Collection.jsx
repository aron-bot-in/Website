import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CardTile from "../components/CardTile.jsx";
import DataStatus from "../components/DataStatus.jsx";
import Page from "../components/Page.jsx";
import { dataStatuses, subscribeCardShowcase, subscribeCardsPage } from "../lib/data.js";

export default function Collection() {
  const [cards, setCards] = useState({});
  const [showcase, setShowcase] = useState({ featured: [], topWishlisted: [], rareFinds: [], recentlyAdded: [] });
  const [cardsStatus, setCardsStatus] = useState(dataStatuses.loading);
  const [showcaseStatus, setShowcaseStatus] = useState(dataStatuses.loading);
  const [search, setSearch] = useState("");
  useEffect(() => subscribeCardsPage(120, (value, status) => {
    setCards(value);
    setCardsStatus(status || dataStatuses.live);
  }), []);
  useEffect(() => subscribeCardShowcase(6, (value, status) => {
    setShowcase((current) => ({ ...current, ...value }));
    setShowcaseStatus(status || dataStatuses.live);
  }), []);
  const shown = useMemo(() => Object.values(cards).filter((card) => `${card.name} ${card.series}`.toLowerCase().includes(search.toLowerCase())).slice(0, 60), [cards, search]);
  return (
    <Page>
      <Header title="Card Gallery" subtitle="Browse Aron cards with collectible-grade presentation, rarity badges, and wishlist demand." search={search} setSearch={setSearch} status={cardsStatus} />
      <FeatureStrip title="Featured Cards" cards={showcase.featured.slice(0, 3)} status={showcaseStatus} />
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <MiniList title="Top Wishlisted" cards={showcase.topWishlisted.slice(0, 4)} status={showcaseStatus} />
        <MiniList title="Rare Finds" cards={showcase.rareFinds.slice(0, 4)} status={showcaseStatus} />
        <MiniList title="Recently Added" cards={showcase.recentlyAdded.slice(0, 4)} status={showcaseStatus} />
      </div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-rose">Full gallery</div>
          <h2 className="mt-2 text-2xl font-black">{shown.length} cards</h2>
          <DataStatus status={cardsStatus} className="mt-3" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((card) => <CardTile key={card.id} card={card} count={0} />)}
        {!shown.length ? <EmptyState status={cardsStatus} /> : null}
      </div>
    </Page>
  );
}

function Header({ title, subtitle, search, setSearch, status }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="text-sm font-black uppercase tracking-[0.24em] text-cyan">{title}</div>
        <p className="mt-2 max-w-2xl text-white/62">{subtitle}</p>
        <DataStatus status={status} className="mt-3" />
      </div>
      <label className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 sm:min-w-72 lg:w-auto">
        <Search className="h-4 w-4 text-cyan" />
        <input className="w-full bg-transparent text-sm outline-none placeholder:text-white/35" placeholder="Search card or series" value={search} onChange={(event) => setSearch(event.target.value)} />
      </label>
    </div>
  );
}

function FeatureStrip({ title, cards, status }) {
  if (!cards.length) return null;
  return (
    <section className="mb-8 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
      <div className="glass rounded-2xl p-6">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-rose">Spotlight</div>
        <h2 className="mt-2 text-3xl font-black">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-white/60">A rotating shelf of cards pulled from public card and wishlist data.</p>
        <DataStatus status={status} className="mt-4" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ card, count }) => <CardTile key={card.id} card={card} wished={count > 0} count={count} />)}
      </div>
    </section>
  );
}

function MiniList({ title, cards, status }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-black">{title}</h3>
        <DataStatus status={status} />
      </div>
      <div className="mt-4 grid gap-3">
        {cards.length ? cards.map(({ card, count }) => (
          <div key={card.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-2">
            <img src={card.imageUrl || card.image} alt="" className="h-14 w-11 rounded-md object-cover" loading="lazy" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{card.name}</div>
              <div className="truncate text-xs text-white/52">{card.series}</div>
            </div>
            <div className="rounded-full bg-rose/10 px-2 py-1 text-xs font-bold text-rose">{count || 0}</div>
          </div>
        )) : <div className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-white/54">{status?.source === "loading" ? "Loading public data." : "Coming soon when public data is available."}</div>}
      </div>
    </div>
  );
}

function EmptyState({ status }) {
  const text = status?.source === "loading"
    ? "Loading public card data."
    : status?.source === "fallback"
      ? "No cached cards matched this search."
      : "Coming soon when public card data is available.";
  return <div className="col-span-full rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/56">{text}</div>;
}
