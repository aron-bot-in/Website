import {
  ArrowRightLeft,
  Bot,
  CalendarDays,
  Command,
  Gem,
  Gift,
  Heart,
  Layers3,
  Swords,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import DataStatus from "../components/DataStatus.jsx";
import Page from "../components/Page.jsx";
import CardShowcase from "../components/home/CardShowcase.jsx";
import CosmeticsPreview from "../components/home/CosmeticsPreview.jsx";
import EventsPreview from "../components/home/EventsPreview.jsx";
import FeatureTiles from "../components/home/FeatureTiles.jsx";
import GuildLeaderboard from "../components/home/GuildLeaderboard.jsx";
import OnboardingSteps from "../components/home/OnboardingSteps.jsx";
import SearchPalette from "../components/home/SearchPalette.jsx";
import {
  activityStats,
  cosmeticsPreview,
  featureTiles,
  guildLeaderboard,
  homeSearchItems,
  seasonalEvents,
  showcaseCards
} from "../data/homeData.js";
import { dataStatuses, subscribeSiteStats } from "../lib/data.js";
import { compactNumber } from "../lib/format.js";

const activityIcons = {
  commands: Command,
  claimed: Gift,
  trades: ArrowRightLeft,
  wishlist: Heart,
  guilds: Users,
  events: CalendarDays
};

export default function Home() {
  const [stats, setStats] = useState({ players: 0, cards: 0, copies: 0, guilds: 0 });
  const [statsStatus, setStatsStatus] = useState(dataStatuses.loading);

  useEffect(() => subscribeSiteStats((value, status) => {
    setStats(value);
    setStatsStatus(status || dataStatuses.live);
  }), []);

  const supportHref = import.meta.env.VITE_SUPPORT_SERVER_URL || "/support";
  const inviteHref = import.meta.env.VITE_DISCORD_INVITE_URL || "/invite";

  return (
    <Page className="pb-16">
      <section className="grid min-h-[calc(100vh-145px)] items-center gap-10 lg:grid-cols-[1fr_0.78fr]">
        <div className="max-w-4xl">
          <div className="mb-5">
            <SearchPalette items={homeSearchItems} />
          </div>
          <div className="flex flex-wrap gap-2">
            <DataStatus status={statsStatus} />
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
            <ActionButton href={supportHref} icon={Users} variant="ghost">Support Server</ActionButton>
          </div>
        </div>

        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Live Overview</div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Metric label="Players" value={stats.players} icon={Users} />
            <Metric label="Servers" value={stats.guilds} icon={Swords} />
            <Metric label="Cards" value={stats.cards} icon={Gem} />
            <Metric label="Copies" value={stats.copies} icon={Layers3} />
          </div>
        </div>
      </section>

      <CardShowcase cards={showcaseCards} />
      <FeatureTiles features={featureTiles} />
      <GuildLeaderboard guilds={guildLeaderboard} />
      <CosmeticsPreview cosmetics={cosmeticsPreview} />
      <EventsPreview event={seasonalEvents} />

      <section className="mt-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Activity</div>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">More ways ARON is moving</h2>
          </div>
          <p className="max-w-xl text-sm font-bold leading-6 text-white/50">Live stats stay above. These activity metrics are mock fallbacks for the homepage until public endpoints exist.</p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activityStats.map((item) => (
            <Metric key={item.label} label={item.label} value={item.value} icon={activityIcons[item.icon] || Gem} />
          ))}
        </div>
      </section>

      <OnboardingSteps inviteHref={inviteHref} supportHref={supportHref} />
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
