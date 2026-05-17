import { Award, CalendarDays, Gem, Gift, Images, LayoutDashboard, Layers3, Shield, Sparkles, Stars, Swords, Users } from "lucide-react";
import { Link } from "react-router-dom";

const icons = {
  cards: Gem,
  drops: Gift,
  editions: Stars,
  albums: Images,
  achievements: Award,
  decks: Shield,
  guilds: Users,
  raids: Swords,
  events: CalendarDays,
  dashboard: LayoutDashboard,
  cosmetics: Sparkles
};

export default function FeatureTiles({ features }) {
  return (
    <section className="mt-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Feature Grid</div>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Everything feels collectible</h2>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-white/54">Drops, editions, cosmetics, albums, guild raids, events, and dashboard views are shaped around the Discord bot you already run.</p>
        </div>
        <Layers3 className="hidden h-8 w-8 text-violet sm:block" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = icons[feature.icon] || Sparkles;
          return (
            <Link key={feature.title} to={feature.link} className="feature-tile data-card group rounded-3xl border border-white/10 bg-panel/78 p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyan/22 bg-cyan/10 shadow-[0_0_22px_rgba(64,230,255,0.08)]">
                <Icon className="h-6 w-6 text-cyan" />
              </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/38 transition group-hover:border-cyan/25 group-hover:text-white/70">Open</span>
              </div>
              <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/58">{feature.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
