import { ArrowRightLeft, CalendarDays, Gem, Gift, Heart, Layers3, Sparkles, UserRound, Users } from "lucide-react";
import { Link } from "react-router-dom";

const icons = {
  cards: Gem,
  drops: Gift,
  wishlist: Heart,
  trading: ArrowRightLeft,
  guilds: Users,
  events: CalendarDays,
  profiles: UserRound,
  cosmetics: Sparkles
};

export default function FeatureTiles({ features }) {
  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Game Systems</div>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Everything collectors check first</h2>
        </div>
        <Layers3 className="hidden h-8 w-8 text-violet sm:block" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = icons[feature.icon] || Sparkles;
          return (
            <Link key={feature.title} to={feature.link} className="feature-tile data-card group rounded-lg border border-white/10 bg-panel/78 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-cyan/22 bg-cyan/10">
                  <Icon className="h-6 w-6 text-cyan" />
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/38 transition group-hover:text-white/70">Open</span>
              </div>
              <h3 className="mt-5 text-2xl font-black">{feature.title}</h3>
              <p className="mt-2 leading-7 text-white/58">{feature.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
