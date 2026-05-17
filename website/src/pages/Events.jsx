import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Coins,
  Gem,
  Gift,
  Sparkles,
  Star,
  Trophy,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Page from "../components/Page.jsx";
import { fetchActiveEvent } from "../lib/websiteApi.js";

const fallbackEvents = [
  {
    id: "summer_festival",
    name: "Summer Festival",
    description: "Limited-time summer event with event tokens, quests, shop rewards, and raid participation goals.",
    currency: "sunTokens",
    startsAt: 1780000000000,
    endsAt: 1782500000000,
    active: false,
    rewards: ["Summer Glow", "Festival Coin Pouch", "Festival Favor"],
    contributors: ["ARON event system", "Discord community"],
    cards: ["Drop Collector", "Festival Voter", "Raid Reveler"]
  },
  {
    id: "raid_frontier",
    name: "Raid Frontier",
    description: "A guild-focused archive shell for raid bosses, boss shards, guild tokens, and cosmetic reward drops.",
    currency: "raidEssence",
    active: false,
    rewards: ["Guild Tokens", "Boss Shards", "Raid Essence"],
    contributors: ["Guild raids", "Deck system"],
    cards: ["Shadow Dragon", "Frost Titan", "Ember Wyrm"]
  }
];

export default function Events() {
  const { eventId } = useParams();
  const [activeEvent, setActiveEvent] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchActiveEvent().then((event) => {
      if (!mounted) return;
      setActiveEvent(event?.active ? event : null);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const events = useMemo(() => {
    if (!activeEvent) return fallbackEvents;
    const normalized = {
      ...activeEvent,
      rewards: activeEvent.shopItems?.map((item) => item.name) || ["Event shop rewards"],
      contributors: ["Live ARON event data"],
      cards: activeEvent.quests?.map((quest) => quest.name) || ["Event quests"]
    };
    return [normalized, ...fallbackEvents.filter((event) => event.id !== normalized.id)];
  }, [activeEvent]);

  const selected = eventId ? events.find((event) => event.id === eventId) : null;

  if (selected) {
    return <EventDetail event={selected} siblings={events.filter((event) => event.id !== selected.id).slice(0, 2)} />;
  }

  return (
    <Page className="pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-panel/76 shadow-card">
        <div className="relative min-h-[360px] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(134,240,240,0.18),transparent_26%),radial-gradient(circle_at_78%_72%,rgba(240,143,176,0.16),transparent_30%),linear-gradient(135deg,rgba(143,0,242,0.22),rgba(16,16,24,0.96))]" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan/28 bg-cyan/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-cyan">
              <CalendarDays className="h-4 w-4" />
              Event archive
            </div>
            <h1 className="mt-6 text-5xl font-black leading-tight sm:text-7xl">ARON Events</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-silver/74">
              Seasonal event pages for ARON quests, event currencies, shop rewards, raid objectives, cosmetics, and archive details.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {events.map((event) => <EventCard key={event.id} event={event} />)}
      </section>
    </Page>
  );
}

function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`} className="data-card overflow-hidden rounded-[2rem] border border-white/10 bg-panel/76 shadow-card">
      <EventBanner event={event} compact />
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan">{event.active ? "Live now" : "Archive"}</div>
          <ChevronRight className="h-5 w-5 text-cyan" />
        </div>
        <h2 className="mt-3 text-3xl font-black">{event.name}</h2>
        <p className="mt-3 leading-7 text-silver/68">{event.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(event.rewards || []).slice(0, 3).map((reward) => (
            <span key={reward} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-white/58">{reward}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function EventDetail({ event, siblings }) {
  return (
    <Page className="pb-16">
      <Link to="/events" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-black text-white/70 hover:text-white">
        <ArrowLeft className="h-4 w-4 text-cyan" />
        Back to events
      </Link>

      <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-panel/76 shadow-card">
        <EventBanner event={event} />
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan">{event.active ? "Live event" : "Archived event"}</div>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">{event.name}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-silver/74">{event.description}</p>

            <DetailSection title="Rewards and shop">
              <div className="grid gap-3 sm:grid-cols-3">
                {(event.rewards || []).map((reward, index) => (
                  <RewardCard key={reward} reward={reward} index={index} />
                ))}
              </div>
            </DetailSection>

            <DetailSection title="Cards, quests, and objectives">
              <div className="grid gap-3 sm:grid-cols-3">
                {(event.cards || []).map((card) => (
                  <div key={card} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                    <Star className="h-5 w-5 text-cyan" />
                    <h3 className="mt-4 text-xl font-black">{card}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/54">Event archive entry from ARON-owned configuration.</p>
                  </div>
                ))}
              </div>
            </DetailSection>

            <DetailSection title="Contributors">
              <div className="flex flex-wrap gap-2">
                {(event.contributors || []).map((name) => (
                  <span key={name} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/62">
                    <Users className="h-4 w-4 text-cyan" />
                    {name}
                  </span>
                ))}
              </div>
            </DetailSection>
          </div>

          <aside className="grid content-start gap-4">
            <div className="rounded-3xl border border-white/10 bg-black/24 p-5">
              <CalendarDays className="h-6 w-6 text-cyan" />
              <div className="mt-4 text-sm font-bold text-white/50">Event currency</div>
              <div className="mt-1 text-2xl font-black">{event.currency || "event tokens"}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/24 p-5">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Sibling events</div>
              <div className="mt-4 grid gap-2">
                {siblings.map((sibling) => (
                  <Link key={sibling.id} to={`/events/${sibling.id}`} className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 font-black text-white/64 hover:text-white">
                    {sibling.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </Page>
  );
}

function EventBanner({ event, compact = false }) {
  return (
    <div className={`relative overflow-hidden bg-[radial-gradient(circle_at_22%_22%,rgba(134,240,240,0.28),transparent_25%),radial-gradient(circle_at_78%_72%,rgba(240,143,176,0.22),transparent_30%),linear-gradient(135deg,rgba(143,0,242,0.36),rgba(16,16,24,0.98))] ${compact ? "h-52" : "h-72"}`}>
      <div className="absolute inset-6 rounded-[2rem] border border-white/10" />
      <div className="absolute bottom-6 left-6 right-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/24 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan">
          <Sparkles className="h-4 w-4" />
          {event.currency || "event tokens"}
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="mt-9">
      <h2 className="text-3xl font-black">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function RewardCard({ reward, index }) {
  const icons = [Gift, Coins, Gem];
  const Icon = icons[index % icons.length];
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
      <Icon className="h-5 w-5 text-cyan" />
      <h3 className="mt-4 text-xl font-black">{reward}</h3>
      <p className="mt-2 text-sm leading-6 text-white/54">Reward display shell. Live details appear when the ARON API exposes them.</p>
    </div>
  );
}
