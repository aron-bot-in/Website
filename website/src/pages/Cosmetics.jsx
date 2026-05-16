import { Badge, Frame, Image, Sparkles, Stars, WandSparkles } from "lucide-react";
import Page from "../components/Page.jsx";

const categories = [
  ["Frames", "Metallic borders, animated trims, and rarity-inspired card edges.", Frame, "from-amber-300/24 to-rose/16"],
  ["Backgrounds", "Profile scenes and collection backdrops with seasonal themes.", Image, "from-cyan/22 to-violet/18"],
  ["Badges", "Tiny prestige marks for events, milestones, and collector identity.", Badge, "from-rose/22 to-white/10"],
  ["Profile Banners", "Wide profile headers designed around guilds, favorites, and flex moments.", Stars, "from-violet/22 to-cyan/14"],
  ["Card Effects", "Subtle shine, aura, and finish previews for future premium card styling.", WandSparkles, "from-rose/22 to-amber-200/14"]
];

export default function Cosmetics() {
  return (
    <Page className="pb-20">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-rose/16 via-violet/12 to-cyan/10 p-6 shadow-card sm:p-8">
        <div className="absolute -right-10 top-0 h-56 w-56 rounded-full bg-rose/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose/30 bg-rose/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-rose">
            <Sparkles className="h-4 w-4" /> Coming soon
          </div>
          <h1 className="mt-5 text-4xl font-black sm:text-6xl">Cosmetics Atelier</h1>
          <p className="mt-4 text-lg leading-8 text-white/66">
            Premium visual upgrades are previewed here as a game-like showcase. These panels are display-only and do not create database writes.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map(([title, text, Icon, gradient]) => (
          <article key={title} className="card-tilt overflow-hidden rounded-2xl border border-white/10 bg-panel/86 shadow-card">
            <div className={`grid aspect-[16/10] place-items-center bg-gradient-to-br ${gradient}`}>
              <div className="grid h-20 w-20 place-items-center rounded-2xl border border-white/15 bg-black/24 backdrop-blur">
                <Icon className="h-9 w-9 text-white" />
              </div>
            </div>
            <div className="p-5">
              <div className="mb-3 inline-flex rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan">Preview</div>
              <h2 className="text-2xl font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
            </div>
          </article>
        ))}
      </section>
    </Page>
  );
}
