import {
  ArrowRight,
  Bot,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Command,
  Gem,
  Gift,
  Images,
  Layers3,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  UserRound,
  Users,
  WandSparkles
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import DataStatus from "../components/DataStatus.jsx";
import Page from "../components/Page.jsx";
import SearchPalette from "../components/home/SearchPalette.jsx";
import { guildLeaderboard, homeSearchItems, showcaseCards } from "../data/homeData.js";
import { dataStatuses, subscribeSiteStats } from "../lib/data.js";
import { compactNumber } from "../lib/format.js";
import {
  fetchActiveEvent,
  fetchActivitySummary,
  fetchFeaturedCards,
  fetchGuildLeaderboard
} from "../lib/websiteApi.js";

const features = [
  ["Drops", "Timed Discord drops, claims, editions, and collector demand.", Gift, "/guide#drops"],
  ["Cosmetics", "Frames, backgrounds, glows, morphs, banners, and badges.", WandSparkles, "/cosmetics"],
  ["Albums", "Curated public collections with owned copies and style themes.", Images, "/guide#albums"],
  ["Decks", "Three-card lineups with HP, attack, defense, and speed.", Shield, "/guide#decks"],
  ["Guild Raids", "Shared bosses, damage boards, raid essence, and tokens.", Swords, "/guide#raids"],
  ["Events", "Limited quests, shops, currencies, rewards, and archives.", CalendarDays, "/events"]
];

const guideCards = [
  ["Cards", "Drops, copies, editions, wishlist demand", Sparkles, "/guide#cards"],
  ["Cosmetics", "Frames, backgrounds, glows, banners", WandSparkles, "/guide#cosmetics"],
  ["Profile", "Badges, bio, favorite card, banner", UserRound, "/guide#profile"],
  ["Events", "Quests, event shops, leaderboards", Trophy, "/guide#events"],
  ["Tagging", "Organize copies with custom labels", Layers3, "/guide#tagging"],
  ["Guilds", "Guild setup, raids, member progress", Users, "/guide#guilds"],
  ["Raids", "Deck attacks and raid-only rewards", Swords, "/guide#raids"],
  ["Albums", "Public sets and owned backgrounds", Images, "/guide#albums"],
  ["Commands", "Essential ARON command reference", Command, "/guide#commands"]
];

const fallbackActivity = [
  { label: "Daily commands", value: null },
  { label: "Active raids", value: null },
  { label: "Event activity", value: null }
];

export default function Home() {
  const [stats, setStats] = useState({ players: 0, cards: 0, copies: 0, guilds: 0 });
  const [statsStatus, setStatsStatus] = useState(dataStatuses.loading);
  const [cards, setCards] = useState(showcaseCards);
  const [guilds, setGuilds] = useState(guildLeaderboard);
  const [activeEvent, setActiveEvent] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => subscribeSiteStats((value, status) => {
    setStats(value || {});
    setStatsStatus(status || dataStatuses.live);
  }), []);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchFeaturedCards(),
      fetchGuildLeaderboard(),
      fetchActiveEvent(),
      fetchActivitySummary()
    ]).then(([featuredCards, nextGuilds, event, nextActivity]) => {
      if (!mounted) return;
      setCards(Array.isArray(featuredCards) && featuredCards.length ? featuredCards : showcaseCards);
      setGuilds(Array.isArray(nextGuilds) ? nextGuilds : []);
      setActiveEvent(event?.active ? event : null);
      setActivity(Array.isArray(nextActivity) ? nextActivity : []);
    }).catch(() => {
      if (!mounted) return;
      setCards(showcaseCards);
      setGuilds([]);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const inviteHref = import.meta.env.VITE_DISCORD_INVITE_URL || "/invite";
  const supportHref = import.meta.env.VITE_SUPPORT_SERVER_URL || "/support";
  const hasStats = useMemo(() => Object.values(stats || {}).some((value) => Number(value || 0) > 0), [stats]);

  return (
    <Page className="pb-14 pt-5">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-black/24 px-4 py-8 shadow-card sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />
        <div className="relative mx-auto max-w-5xl text-center">
          <Link to="/guide" className="mx-auto inline-flex max-w-xl items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-bold text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-cyan/26 hover:text-white">
            <Search className="h-4 w-4 text-cyan" />
            <span className="min-w-0 flex-1 truncate text-left">Search commands, cards, cosmetics, raids...</span>
            <kbd className="rounded-md border border-white/10 bg-black/24 px-2 py-0.5 text-[10px] text-white/42">Ctrl K</kbd>
          </Link>

          <div className="mt-10 text-[clamp(4.8rem,16vw,13rem)] font-black leading-[0.74] tracking-normal ghost-wordmark">ARON</div>
          <h1 className="mx-auto mt-4 max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Anime cards, raids, cosmetics, guilds, and events in one premium Discord bot.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-8 text-silver/78">
            Collect anime cards, style copies, build albums and decks, fight guild bosses, and follow event progress from a polished ARON web hub.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <SmartLink href={inviteHref}>
              <Button icon={Bot} className="w-full sm:w-auto">Invite Bot</Button>
            </SmartLink>
            <SmartLink href={supportHref}>
              <Button icon={MessageCircle} variant="ghost" className="w-full sm:w-auto">Join Support</Button>
            </SmartLink>
            <Link to="/guide">
              <Button icon={BookOpen} variant="ghost" className="w-full sm:w-auto">Open Guide</Button>
            </Link>
          </div>
        </div>

        <HeroCardMockup cards={cards} />
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Servers" value={stats.guilds} showValue={hasStats} icon={Users} />
        <StatTile label="Users" value={stats.players} showValue={hasStats} icon={UserRound} />
        <StatTile label="Cards" value={stats.cards} showValue={hasStats} icon={Gem} />
        <StatTile label="Copies" value={stats.copies} showValue={hasStats} icon={Sparkles} />
        <div className="rounded-2xl border border-white/10 bg-panel/72 p-4 shadow-card">
          <div className="text-sm font-bold text-white/56">Data status</div>
          <div className="mt-4"><DataStatus status={statsStatus} /></div>
        </div>
      </section>

      <section className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {features.map(([title, text, Icon, href]) => (
          <Link key={title} to={href} className="data-card group rounded-[1.75rem] border border-white/10 bg-panel/76 p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan/22 bg-cyan/10">
                <Icon className="h-6 w-6 text-cyan" />
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/38 group-hover:text-white">Open</span>
            </div>
            <h2 className="mt-5 text-2xl font-black">{title}</h2>
            <p className="mt-2 leading-7 text-silver/68">{text}</p>
          </Link>
        ))}
      </section>

      <section className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-black/26 shadow-card">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[350px] p-6 sm:p-8">
            <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-violet/18 blur-3xl" />
            <div className="relative">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Guide</div>
              <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Everything ARON teaches, one docs shell.</h2>
              <p className="mt-4 max-w-xl leading-8 text-silver/70">
                The guide is organized like a product manual: sidebar categories, command examples, article sections, and a right-side table of contents.
              </p>
              <Link to="/guide" className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan/28 bg-cyan/10 px-4 py-2 text-sm font-black text-cyan transition hover:bg-cyan/15">
                Read the guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="absolute bottom-6 right-6 hidden h-28 w-44 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm font-black text-white/58 sm:block">
              <Search className="mb-5 h-5 w-5 text-cyan" />
              Cards / Cosmetics / Profile / Events
            </div>
          </div>
          <div className="grid gap-3 border-t border-white/10 p-4 sm:grid-cols-2 lg:border-l lg:border-t-0 xl:grid-cols-3">
            {guideCards.map(([title, text, Icon, href]) => (
              <Link key={title} to={href} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan/24 hover:bg-white/[0.055]">
                <Icon className="h-5 w-5 text-cyan" />
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/54">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
        <ServerShowcase guilds={guilds} />
        <EventPanel event={activeEvent} activity={activity} />
      </section>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-panel/72 p-4 shadow-card sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan">
              <Search className="h-4 w-4" />
              Command palette
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/54">Jump to ARON commands, guide pages, raids, events, and dashboard views.</p>
          </div>
          <SearchPalette items={homeSearchItems} />
        </div>
      </section>
    </Page>
  );
}

function SmartLink({ href, children }) {
  const external = /^https?:\/\//i.test(String(href || ""));
  return external
    ? <a href={href} target="_blank" rel="noreferrer">{children}</a>
    : <Link to={href || "/"}>{children}</Link>;
}

function HeroCardMockup({ cards }) {
  const visible = Array.isArray(cards) && cards.length ? cards.slice(0, 3) : [
    { name: "Aero Vanguard", series: "ARON Originals", rarity: "Mythic" },
    { name: "Sakura Echo", series: "Event Cards", rarity: "Epic" },
    { name: "Void Monarch", series: "Raid Bosses", rarity: "Legendary" }
  ];

  return (
    <div className="relative mx-auto mt-10 min-h-[420px] max-w-5xl">
      <div className="absolute inset-x-12 bottom-8 h-36 rounded-full bg-violet/20 blur-3xl" />
      <div className="absolute left-1/2 top-6 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan/12 blur-3xl" />
      <div className="relative flex h-[420px] items-center justify-center gap-3 sm:gap-5">
        {visible.map((card, index) => (
          <CollectibleCard key={`${card.name}-${index}`} card={card} index={index} />
        ))}
      </div>
    </div>
  );
}

function CollectibleCard({ card, index }) {
  const center = index === 1;
  const name = card?.name || "ARON Card";
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <article className={`floating-card relative w-[30%] min-w-[96px] max-w-[250px] rounded-[1.7rem] border bg-gradient-to-b from-white/[0.11] to-white/[0.035] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.48)] backdrop-blur-xl ${center ? "z-10 scale-110 border-cyan/32" : "border-white/12 opacity-82"}`}>
      <div className="aspect-[3/4] overflow-hidden rounded-[1.2rem] border border-white/12 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.22),transparent_20%),radial-gradient(circle_at_28%_78%,rgba(240,143,176,0.20),transparent_24%),linear-gradient(145deg,rgba(134,240,240,0.20),rgba(143,0,242,0.34),rgba(8,8,16,0.96))]">
        {card?.image || card?.imageUrl ? <img src={card.image || card.imageUrl} alt="" className="h-full w-full object-cover opacity-74" /> : (
          <div className="grid h-full place-items-center">
            <div className="grid h-20 w-20 place-items-center rounded-full border border-white/16 bg-white/[0.08] text-3xl font-black text-white shadow-[0_0_32px_rgba(134,240,240,0.35)]">
              {initials || "AR"}
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 truncate text-[11px] font-black uppercase tracking-[0.16em] text-cyan">{card?.series || "ARON"}</div>
      <h3 className="mt-1 truncate text-lg font-black">{name}</h3>
      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full border border-violet/26 bg-violet/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan">{card?.rarity || "Featured"}</span>
        <Sparkles className="h-4 w-4 text-rose" />
      </div>
    </article>
  );
}

function StatTile({ label, value, icon: Icon, showValue }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-panel/72 p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-white/56">{label}</span>
        <Icon className="h-5 w-5 text-cyan" />
      </div>
      <div className="mt-3 text-3xl font-black">{showValue || Number(value || 0) > 0 ? compactNumber(value || 0) : "-"}</div>
    </div>
  );
}

function ServerShowcase({ guilds }) {
  const visible = Array.isArray(guilds) ? guilds.slice(0, 8) : [];
  return (
    <section className="rounded-[2rem] border border-white/10 bg-panel/76 p-5 shadow-card sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Community</div>
          <h2 className="mt-2 text-3xl font-black">Servers on the rise</h2>
        </div>
        <Users className="h-7 w-7 text-violet" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {visible.map((guild) => (
          <article key={guild.id || guild.rank || guild.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan/16 bg-cyan/10 text-sm font-black text-cyan">
              #{guild.rank || "?"}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-black">{guild.name || "ARON server"}</h3>
              <p className="mt-1 text-sm font-semibold text-white/50">{compactNumber(guild.members || 0)} members</p>
            </div>
          </article>
        ))}
        {!visible.length ? (
          <div className="col-span-full rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-white/56">
            Public guild showcase data is not available yet. This section will fill from the existing leaderboard API when data exists.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function EventPanel({ event, activity }) {
  const rows = activity.length ? activity : fallbackActivity;
  return (
    <aside className="rounded-[2rem] border border-white/10 bg-black/28 p-5 shadow-card">
      <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Events</div>
      <h2 className="mt-2 text-3xl font-black">{event?.name || "Event archive"}</h2>
      <p className="mt-3 leading-7 text-silver/68">
        {event?.description || "Seasonal ARON event pages use safe fallback artwork until live event data is exposed."}
      </p>
      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_25%_20%,rgba(134,240,240,0.22),transparent_28%),radial-gradient(circle_at_78%_80%,rgba(240,143,176,0.18),transparent_30%),linear-gradient(135deg,rgba(143,0,242,0.30),rgba(16,16,24,0.96))] p-5">
        <CalendarDays className="h-9 w-9 text-cyan" />
        <div className="mt-10 text-2xl font-black">{event?.currency || "sunTokens"}</div>
        <div className="mt-1 text-sm font-bold text-white/54">Quests, shop rewards, and leaderboard progress</div>
      </div>
      <div className="mt-5 grid gap-2">
        {rows.slice(0, 3).map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold">
            <span className="text-white/58">{item.label}</span>
            <span>{Number.isFinite(Number(item.value)) ? compactNumber(item.value) : "-"}</span>
          </div>
        ))}
      </div>
      <Link to="/events" className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-black text-white/72 hover:text-white">
        Open archive
        <ChevronRight className="h-4 w-4 text-cyan" />
      </Link>
    </aside>
  );
}
