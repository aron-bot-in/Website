import {
  ArrowRight,
  Bot,
  Gem,
  Gift,
  Heart,
  Image,
  Layers3,
  Search,
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
import { dataStatuses, subscribeGuildsPage, subscribeSiteStats, subscribeTopWishlistedCards } from "../lib/data.js";
import { cardImage, cardStyle, compactNumber, fullNumber, safeText } from "../lib/format.js";

const featureTiles = [
  ["Cards", "Browse anime card templates, rarities, editions, and public card art.", "/collection", Gem],
  ["Wishlist", "Track the cards players want most and keep favorites close.", "/wishlist", Heart],
  ["Guilds", "Join friends, grow your roster, and climb public guild rankings.", "/guilds", Swords],
  ["Events", "Follow seasonal drops, limited rewards, and special collection moments.", "/guide", Gift]
];

export default function Home() {
  const [stats, setStats] = useState({ players: 0, cards: 0, copies: 0, guilds: 0 });
  const [statsStatus, setStatsStatus] = useState(dataStatuses.loading);
  const [topWishlisted, setTopWishlisted] = useState([]);
  const [cardsStatus, setCardsStatus] = useState(dataStatuses.loading);
  const [guilds, setGuilds] = useState({});
  const [guildsStatus, setGuildsStatus] = useState(dataStatuses.loading);

  useEffect(() => subscribeSiteStats((value, status) => {
    setStats(value);
    setStatsStatus(status || dataStatuses.live);
  }), []);

  useEffect(() => subscribeTopWishlistedCards(8, (value, status) => {
    setTopWishlisted(Array.isArray(value) ? value : []);
    setCardsStatus(status || dataStatuses.live);
  }), []);

  useEffect(() => subscribeGuildsPage(80, (value, status) => {
    setGuilds(value);
    setGuildsStatus(status || dataStatuses.live);
  }), []);

  const heroCards = topWishlisted.slice(0, 4);
  const supportHref = import.meta.env.VITE_SUPPORT_SERVER_URL || "/support";
  const inviteHref = import.meta.env.VITE_DISCORD_INVITE_URL || "/invite";
  const risingGuilds = useMemo(() => {
    return Object.values(guilds)
      .sort((left, right) => (right.memberIds?.length || 0) - (left.memberIds?.length || 0))
      .slice(0, 6);
  }, [guilds]);

  return (
    <Page className="pb-16">
      <section className="grid min-h-[calc(100vh-145px)] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-3xl">
          <div className="command-pill mb-5 flex w-fit max-w-full items-center gap-3 rounded-full border border-cyan/18 bg-black/28 px-4 py-3 text-white/58">
            <Search className="h-4 w-4 text-cyan" />
            <span className="truncate text-sm font-black">Discord Card Index</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <DataStatus status={statsStatus} />
            <DataStatus status={cardsStatus} />
          </div>
          <h1 className="mt-7 text-7xl font-black leading-[0.84] tracking-normal sm:text-8xl lg:text-9xl">ARON</h1>
          <p className="mt-6 max-w-3xl text-3xl font-black leading-tight text-white sm:text-5xl">
            Collect anime cards, build wishlists, and rise with your guild on Discord.
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/64">
            ARON is a Discord card collecting bot where players discover anime cards, claim drops, track collections, wishlist favorites, trade with friends, and show their guild progress through a public card index.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ActionButton href={inviteHref} icon={Bot}>Invite Bot</ActionButton>
            <Link to="/collection"><Button variant="ghost" icon={ArrowRight} className="w-full sm:w-auto">Explore Cards</Button></Link>
            <ActionButton href={supportHref} icon={Users} variant="ghost">Support Server</ActionButton>
          </div>
        </div>

        <HeroWishlistedPanel entries={heroCards} status={cardsStatus} />
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Metric label="Players" value={stats.players} icon={Users} />
        <Metric label="Servers" value={stats.guilds} icon={Swords} />
        <Metric label="Cards" value={stats.cards} icon={Gem} />
        <Metric label="Copies" value={stats.copies} icon={Layers3} />
      </section>

      <section className="mt-12">
        <SectionHead eyebrow="Play ARON" title="Built for card collectors" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featureTiles.map(([title, text, href, Icon]) => (
            <Link key={title} to={href} className="feature-tile group rounded-lg border border-white/10 bg-panel/80 p-5 transition hover:-translate-y-1 hover:border-cyan/35 hover:bg-white/[0.055]">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/10">
                <Icon className="h-5 w-5 text-cyan" />
              </div>
              <h2 className="mt-5 text-2xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-white/58">{text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/44 group-hover:text-cyan">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHead eyebrow="Live Data" title="Most wishlisted cards" status={cardsStatus} href="/collection" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topWishlisted.slice(0, 8).map(({ card, count }) => (
            <CardTile key={card.id} card={card} count={count} wished />
          ))}
          {!topWishlisted.length ? <Empty label={cardsStatus.source === "loading" ? "Loading wishlist rankings from Firebase." : "Wishlist rankings appear here when public wishlist counts are available."} /> : null}
        </div>
      </section>

      <section className="mt-12">
        <SectionHead eyebrow="Community" title="Guilds on the rise" status={guildsStatus} href="/guilds" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {risingGuilds.map((guild, index) => <GuildCard key={guild.id || guild.name} guild={guild} rank={index + 1} />)}
          {!risingGuilds.length ? <Empty label={guildsStatus.source === "loading" ? "Loading public guilds from Firebase." : "Public guild data appears here when available."} /> : null}
        </div>
      </section>
    </Page>
  );
}

function ActionButton({ href, children, icon, variant = "primary" }) {
  const isExternal = /^https?:\/\//i.test(String(href || ""));
  const content = <Button icon={icon} variant={variant} className="w-full sm:w-auto">{children}</Button>;

  return isExternal
    ? <a href={href} target="_blank" rel="noreferrer">{content}</a>
    : <Link to={href}>{content}</Link>;
}

function HeroWishlistedPanel({ entries, status }) {
  const primary = entries[0]?.card;
  const primaryCount = entries[0]?.count || 0;

  return (
    <div className="relative">
      <div className="glass overflow-hidden rounded-lg p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Most wishlisted</div>
            <h2 className="mt-2 text-2xl font-black">Top cards from Firebase</h2>
          </div>
          <DataStatus status={status} />
        </div>

        {entries.length ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <FeaturedHeroCard card={primary} count={primaryCount} />
            <div className="grid gap-3">
              {entries.slice(1, 4).map(({ card, count }, index) => (
                <MiniWishCard key={card.id} card={card} count={count} rank={index + 2} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/58">
            {status.source === "loading" ? "Loading top wishlisted cards from Firebase." : "Top wishlisted cards appear here when wishlist counts are available."}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedHeroCard({ card, count }) {
  const rarity = cardStyle(card);

  return (
    <article className="data-card overflow-hidden rounded-lg border border-cyan/20 bg-white/[0.045] shadow-card">
      <div className="relative aspect-[3/4] min-h-[22rem] bg-white/[0.04]">
        <img src={cardImage(card)} alt={safeText(card?.name, "ARON card")} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/62 to-transparent p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-md border border-cyan/35 bg-cyan/12 px-2.5 py-1 text-xs font-black uppercase tracking-[0.14em] text-cyan">#1</span>
            <span className="rounded-md border border-rose/35 bg-rose/12 px-2.5 py-1 text-xs font-black uppercase tracking-[0.14em] text-rose">{fullNumber(count)} wishlists</span>
          </div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan">{safeText(card?.series, "Unknown Series")}</div>
          <h3 className="mt-1 text-3xl font-black leading-tight">{safeText(card?.name, "Unknown Card")}</h3>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-white/[0.08] px-3 py-2 text-sm font-black text-white/78">
            <Sparkles className="h-4 w-4 text-violet" />
            {rarity.label}
          </div>
        </div>
      </div>
    </article>
  );
}

function MiniWishCard({ card, count, rank }) {
  const rarity = cardStyle(card);

  return (
    <article className="data-card flex min-h-[7.5rem] overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
      <div className="relative w-24 shrink-0 bg-white/[0.04] sm:w-28">
        <img src={cardImage(card)} alt={safeText(card?.name, "ARON card")} className="h-full w-full object-cover" loading="lazy" />
        <span className="absolute left-2 top-2 rounded-md border border-cyan/30 bg-ink/[0.85] px-2 py-1 text-[10px] font-black text-cyan">#{rank}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div>
          <div className="truncate text-[11px] font-black uppercase tracking-[0.14em] text-cyan">{safeText(card?.series, "Unknown Series")}</div>
          <h3 className="mt-1 line-clamp-2 text-lg font-black leading-tight">{safeText(card?.name, "Unknown Card")}</h3>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-black">
          <span className="rounded-md bg-white/[0.06] px-2 py-1 text-white/68">{rarity.label}</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-rose/10 px-2 py-1 text-rose"><Heart className="h-3.5 w-3.5" />{fullNumber(count)}</span>
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-white/10 bg-panel/80 p-5 transition hover:-translate-y-1 hover:border-cyan/30">
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
        <h2 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h2>
        {status ? <DataStatus status={status} className="mt-3" /> : null}
      </div>
      {href ? <Link to={href} className="inline-flex items-center gap-2 text-sm font-black text-white/58 transition hover:text-white">View all <ArrowRight className="h-4 w-4" /></Link> : null}
    </div>
  );
}

function GuildCard({ guild, rank }) {
  return (
    <article className="data-card overflow-hidden rounded-lg border border-white/10 bg-panel/80">
      <div className="relative h-28 bg-white/[0.04]" style={guild.bannerUrl ? { backgroundImage: `url(${guild.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 to-transparent" />
        <div className="absolute left-3 top-3 rounded-md border border-cyan/25 bg-cyan/12 px-2.5 py-1 text-xs font-black text-cyan">#{rank}</div>
        <Image className="absolute right-3 top-3 h-5 w-5 text-white/38" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-xl font-black">{guild.name || "Unnamed guild"}</h3>
          <Trophy className="h-5 w-5 shrink-0 text-cyan" />
        </div>
        {guild.description ? <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-white/56">{guild.description}</p> : <p className="mt-2 min-h-12 text-sm leading-6 text-white/38">Guild progress and public member data from ARON.</p>}
        <div className="mt-4 flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2 text-sm">
          <span className="inline-flex items-center gap-2 text-white/56"><Users className="h-4 w-4 text-cyan" />Members</span>
          <span className="font-black">{fullNumber(guild.memberIds?.length || 0)}</span>
        </div>
      </div>
    </article>
  );
}

function Empty({ label }) {
  return <div className="col-span-full rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/58">{label}</div>;
}
