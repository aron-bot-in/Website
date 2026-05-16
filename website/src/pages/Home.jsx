import {
  ArrowRight,
  BookOpen,
  Bot,
  Gem,
  Heart,
  Image,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import CardTile from "../components/CardTile.jsx";
import DataStatus from "../components/DataStatus.jsx";
import Page from "../components/Page.jsx";
import { dataStatuses, subscribeCardShowcase, subscribeGuildsPage, subscribeSiteStats } from "../lib/data.js";
import { compactNumber, fullNumber } from "../lib/format.js";

const emptyShowcase = { featured: [], topWishlisted: [], rareFinds: [], recentlyAdded: [] };

const featureTiles = [
  ["Collection", "Browse public card templates", "/collection", Gem],
  ["Wishlist", "Track wanted cards", "/wishlist", Heart],
  ["Guilds", "See public guild halls", "/guilds", Swords],
  ["Cosmetics", "Preview profile style", "/cosmetics", Sparkles],
  ["Verify", "Secure account checks", "/verify", ShieldCheck],
  ["Guide", "Learn the bot flow", "/guide", BookOpen]
];

const guideTiles = [
  ["Cards", "/collection", Gem],
  ["Cosmetics", "/cosmetics", Sparkles],
  ["Profile", "/dashboard", Users],
  ["Events", "/guide", Trophy],
  ["Guilds", "/guilds", Swords],
  ["Verification", "/verify", ShieldCheck]
];

export default function Home() {
  const [stats, setStats] = useState({ players: 0, cards: 0, copies: 0, guilds: 0 });
  const [statsStatus, setStatsStatus] = useState(dataStatuses.loading);
  const [showcase, setShowcase] = useState(emptyShowcase);
  const [showcaseStatus, setShowcaseStatus] = useState(dataStatuses.loading);
  const [guilds, setGuilds] = useState({});
  const [guildsStatus, setGuildsStatus] = useState(dataStatuses.loading);

  useEffect(() => subscribeSiteStats((value, status) => {
    setStats(value);
    setStatsStatus(status || dataStatuses.live);
  }), []);

  useEffect(() => subscribeCardShowcase(10, (value, status) => {
    setShowcase({ ...emptyShowcase, ...value });
    setShowcaseStatus(status || dataStatuses.live);
  }), []);

  useEffect(() => subscribeGuildsPage(80, (value, status) => {
    setGuilds(value);
    setGuildsStatus(status || dataStatuses.live);
  }), []);

  const heroCards = showcase.featured.slice(0, 4);
  const risingGuilds = useMemo(() => {
    return Object.values(guilds)
      .sort((left, right) => (right.memberIds?.length || 0) - (left.memberIds?.length || 0))
      .slice(0, 9);
  }, [guilds]);

  return (
    <Page className="pb-16">
      <section className="grid min-h-[calc(100vh-150px)] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="command-pill mb-5 flex max-w-md items-center gap-3 rounded-lg border border-white/10 bg-black/22 px-4 py-3 text-white/50">
            <Search className="h-4 w-4 text-cyan" />
            <span className="text-sm font-bold">Search commands, cards, guilds...</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <DataStatus status={statsStatus} />
            <DataStatus status={showcaseStatus} />
          </div>
          <h1 className="mt-6 text-7xl font-black leading-[0.84] tracking-normal sm:text-8xl lg:text-9xl">ARON</h1>
          <p className="mt-5 max-w-2xl text-2xl font-black leading-tight text-white sm:text-4xl">
            Collect cards, build wishlists, and rise with your guild on Discord.
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/62">
            A public website for your bot data: live Firebase cards, player summaries, guilds, and the same secure verification flow you already use.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={import.meta.env.VITE_DISCORD_INVITE_URL || "#"}><Button icon={Bot} className="w-full sm:w-auto">Invite Bot</Button></a>
            <a href={import.meta.env.VITE_SUPPORT_SERVER_URL || "#"}><Button variant="ghost" icon={Users} className="w-full sm:w-auto">Support Server</Button></a>
            <Link to="/collection"><Button variant="ghost" icon={ArrowRight} className="w-full sm:w-auto">Explore Cards</Button></Link>
          </div>
        </div>

        <div className="relative">
          <div className="grid gap-3 sm:grid-cols-2">
            {heroCards.length ? heroCards.map(({ card, count }, index) => (
              <div key={card.id} className={index % 2 ? "sm:translate-y-10" : ""}>
                <CardTile card={card} count={count} wished={count > 0} compact />
              </div>
            )) : (
              <div className="col-span-full rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/58">
                Card art appears here when public card data is available.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Metric label="Players" value={stats.players} icon={Users} />
        <Metric label="Servers" value={stats.guilds} icon={Swords} />
        <Metric label="Cards" value={stats.cards} icon={Gem} />
        <Metric label="Copies" value={stats.copies} icon={Layers3} />
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {featureTiles.map(([title, text, href, Icon]) => (
          <Link key={title} to={href} className="feature-tile rounded-lg border border-white/10 bg-panel/80 p-4 transition hover:-translate-y-1 hover:border-cyan/30">
            <Icon className="h-6 w-6 text-cyan" />
            <h2 className="mt-4 text-xl font-black">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/56">{text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-white/42">Open <ArrowRight className="h-3.5 w-3.5" /></span>
          </Link>
        ))}
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <SectionHead eyebrow="Card demand" title="Top wishlisted" status={showcaseStatus} href="/collection" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {showcase.topWishlisted.slice(0, 4).map(({ card, count }) => <CardTile key={card.id} card={card} count={count} wished />)}
            {!showcase.topWishlisted.length ? <Empty label="Wishlist rankings appear when public wishlist data is available." /> : null}
          </div>
        </div>

        <div>
          <SectionHead eyebrow="Guide" title="Start here" />
          <div className="mt-5 grid gap-3">
            {guideTiles.map(([title, href, Icon]) => (
              <Link key={title} to={href} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:bg-white/[0.07]">
                <span className="inline-flex items-center gap-3 font-black"><Icon className="h-5 w-5 text-cyan" />{title}</span>
                <ArrowRight className="h-4 w-4 text-white/38" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHead eyebrow="Community" title="Guilds on the rise" status={guildsStatus} href="/guilds" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {risingGuilds.map((guild, index) => <GuildCard key={guild.id || guild.name} guild={guild} rank={index + 1} />)}
          {!risingGuilds.length ? <Empty label="Public guild data appears here when available." /> : null}
        </div>
      </section>

      <section className="mt-12 rounded-lg border border-white/10 bg-panel/80 p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-rose">Secure route</div>
            <h2 className="mt-2 text-3xl font-black">Verification stays unchanged.</h2>
            <p className="mt-3 leading-7 text-white/62">
              The website keeps using your existing verification backend and token/result URLs. Firebase remains read-only for public bot summaries.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Info label="Root" value={import.meta.env.VITE_FIREBASE_DB_ROOT || "botData"} />
            <Info label="Router" value="Hash" />
            <Info label="API" value="Existing" />
          </div>
        </div>
      </section>
    </Page>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-white/10 bg-panel/80 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-white/56">{label}</span>
        <Icon className="h-5 w-5 text-cyan" />
      </div>
      <div className="mt-3 text-4xl font-black">{compactNumber(value)}</div>
    </div>
  );
}

function SectionHead({ eyebrow, title, status, href }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">{eyebrow}</div>
        <h2 className="mt-2 text-3xl font-black">{title}</h2>
        {status ? <DataStatus status={status} className="mt-3" /> : null}
      </div>
      {href ? <Link to={href} className="inline-flex items-center gap-2 text-sm font-black text-white/58 hover:text-white">View all <ArrowRight className="h-4 w-4" /></Link> : null}
    </div>
  );
}

function GuildCard({ guild, rank }) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-panel/80">
      <div className="relative h-24 bg-white/[0.04]" style={guild.bannerUrl ? { backgroundImage: `url(${guild.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute left-3 top-3 rounded-md border border-cyan/25 bg-cyan/12 px-2.5 py-1 text-xs font-black text-cyan">#{rank}</div>
        <Image className="absolute right-3 top-3 h-5 w-5 text-white/38" />
      </div>
      <div className="p-4">
        <h3 className="truncate text-xl font-black">{guild.name || "Unnamed guild"}</h3>
        <div className="mt-3 flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2 text-sm">
          <span className="inline-flex items-center gap-2 text-white/56"><Users className="h-4 w-4 text-cyan" />Members</span>
          <span className="font-black">{fullNumber(guild.memberIds?.length || 0)}</span>
        </div>
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-2 truncate text-lg font-black">{value}</div>
    </div>
  );
}

function Empty({ label }) {
  return <div className="col-span-full rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/58">{label}</div>;
}
