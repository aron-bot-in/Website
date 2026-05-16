import { ArrowRight, Bot, Gem, Heart, ShieldCheck, Swords, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import CardTile from "../components/CardTile.jsx";
import DataStatus from "../components/DataStatus.jsx";
import Page from "../components/Page.jsx";
import StatCard from "../components/StatCard.jsx";
import { dataStatuses, subscribeCardShowcase, subscribeSiteStats } from "../lib/data.js";

const emptyShowcase = { featured: [], topWishlisted: [], rareFinds: [], recentlyAdded: [] };

export default function Home() {
  const [stats, setStats] = useState({ players: 0, cards: 0, copies: 0, guilds: 0 });
  const [statsStatus, setStatsStatus] = useState(dataStatuses.loading);
  const [showcase, setShowcase] = useState(emptyShowcase);
  const [showcaseStatus, setShowcaseStatus] = useState(dataStatuses.loading);

  useEffect(() => subscribeSiteStats((value, status) => {
    setStats(value);
    setStatsStatus(status || dataStatuses.live);
  }), []);

  useEffect(() => subscribeCardShowcase(8, (value, status) => {
    setShowcase({ ...emptyShowcase, ...value });
    setShowcaseStatus(status || dataStatuses.live);
  }), []);

  const heroCards = showcase.featured.slice(0, 3);

  return (
    <Page className="pb-16">
      <section className="grid min-h-[calc(100vh-160px)] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <DataStatus status={statsStatus} />
            <DataStatus status={showcaseStatus} />
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] sm:text-7xl">
            Live Aron card data, rebuilt clean.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/64">
            Browse public cards, guilds, wishlists, and player dashboards from Firebase while verification keeps using the existing secure backend.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={import.meta.env.VITE_DISCORD_INVITE_URL || "#"}><Button icon={Bot} className="w-full sm:w-auto">Invite Bot</Button></a>
            <Link to="/collection"><Button variant="ghost" icon={Gem} className="w-full sm:w-auto">Open Collection</Button></Link>
            <Link to="/verify"><Button variant="ghost" icon={ShieldCheck} className="w-full sm:w-auto">Verify</Button></Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {heroCards.length ? heroCards.map(({ card, count }, index) => (
            <div key={card.id} className={index === 1 ? "sm:mt-12" : index === 2 ? "sm:mt-24" : ""}>
              <CardTile card={card} count={count} wished={count > 0} />
            </div>
          )) : (
            <div className="col-span-full rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/58">
              Public card previews appear here when Firebase or the cached snapshot is available.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <StatCard label="Players" value={stats.players} icon={Users} />
        <StatCard label="Cards" value={stats.cards} icon={Gem} />
        <StatCard label="Copies" value={stats.copies} icon={Heart} />
        <StatCard label="Guilds" value={stats.guilds} icon={Swords} />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Public demand</div>
              <h2 className="mt-2 text-3xl font-black">Top wishlisted</h2>
            </div>
            <Link to="/collection" className="inline-flex items-center gap-2 text-sm font-black text-white/58 hover:text-white">View gallery <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {showcase.topWishlisted.slice(0, 4).map(({ card, count }) => <CardTile key={card.id} card={card} count={count} wished />)}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-panel/80 p-5">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-rose">Data model</div>
          <div className="mt-4 grid gap-3 text-sm text-white/66">
            <Info label="Firebase root" value={import.meta.env.VITE_FIREBASE_DB_ROOT || "botData"} />
            <Info label="Routing" value="GitHub Pages HashRouter" />
            <Info label="Verification" value="Existing backend API" />
          </div>
        </div>
      </section>
    </Page>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-white/[0.04] px-3 py-2">
      <span>{label}</span>
      <span className="text-right font-black text-white">{value}</span>
    </div>
  );
}
