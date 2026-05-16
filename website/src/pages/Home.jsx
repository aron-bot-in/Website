import { ArrowRight, Bot, Gem, Heart, ShieldCheck, Sparkles, Swords, Trophy, Users, WandSparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Page from "../components/Page.jsx";
import Button from "../components/Button.jsx";
import DataStatus from "../components/DataStatus.jsx";
import StatCard from "../components/StatCard.jsx";
import CardTile from "../components/CardTile.jsx";
import { dataStatuses, subscribeCardShowcase, subscribeSiteStats } from "../lib/data.js";

const emptyShowcase = { featured: [], topWishlisted: [], rareFinds: [], recentlyAdded: [] };

export default function Home() {
  const [stats, setStats] = useState({ players: 0, cards: 0, copies: 0, guilds: 0 });
  const [showcase, setShowcase] = useState(emptyShowcase);
  const [statsStatus, setStatsStatus] = useState(dataStatuses.loading);
  const [showcaseStatus, setShowcaseStatus] = useState(dataStatuses.loading);

  useEffect(() => subscribeSiteStats((value, status) => {
    setStats(value);
    setStatsStatus(status || dataStatuses.live);
  }), []);
  useEffect(() => subscribeCardShowcase(6, (value, status) => {
    setShowcase({ ...emptyShowcase, ...value });
    setShowcaseStatus(status || dataStatuses.live);
  }), []);

  const heroCards = showcase.featured.slice(0, 3);

  return (
    <Page className="pb-20">
      <section className="grid min-h-[calc(100vh-150px)] items-center gap-10 pb-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose/30 bg-rose/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-rose">
            <Sparkles className="h-4 w-4" /> Premium Discord collection
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <DataStatus status={statsStatus} />
            <DataStatus status={showcaseStatus} />
          </div>
          <h1 className="mt-6 text-6xl font-black leading-[0.9] sm:text-7xl lg:text-8xl">ARON</h1>
          <p className="mt-4 bg-gradient-to-r from-white via-rose-100 to-cyan bg-clip-text text-4xl font-black leading-tight text-transparent sm:text-5xl">
            Collect. Trade. Flex.
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            A premium anime card collecting experience for Discord. Browse the card gallery, track your wishlist, and turn every drop into a showcase moment.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={import.meta.env.VITE_DISCORD_INVITE_URL || "#"}><Button icon={Bot} className="min-h-12 w-full sm:w-auto">Invite Bot</Button></a>
            <Link to="/support"><Button variant="ghost" icon={ShieldCheck} className="min-h-12 w-full sm:w-auto">Join Support Server</Button></Link>
            <Link to="/dashboard"><Button variant="ghost" icon={ArrowRight} className="min-h-12 w-full sm:w-auto">View Dashboard</Button></Link>
          </div>
        </div>

        <div className="relative mx-auto h-[520px] w-full max-w-[650px] sm:h-[600px]">
          <div className="hero-radar absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose/10 sm:h-[470px] sm:w-[470px]" />
          {heroCards.length ? heroCards.map(({ card, count }, index) => (
            <motion.div
              key={card.id}
              className={`absolute w-[min(68vw,17rem)] ${index === 0 ? "left-0 top-16 z-20 sm:left-8" : index === 1 ? "right-0 top-4 z-10 sm:right-4" : "bottom-8 left-[18%] z-30 sm:left-[34%]"}`}
              animate={{ y: [0, -14, 0], rotate: index === 1 ? [7, 3, 7] : [-6, -2, -6] }}
              transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
            >
              <CardTile card={card} wished={count > 0} count={count} compact />
            </motion.div>
          )) : (
            <div className="absolute inset-0 grid place-items-center">
              <motion.div
                className="w-[min(76vw,20rem)] rounded-2xl border border-rose/25 bg-panel/86 p-5 shadow-card"
                animate={{ y: [0, -14, 0], rotate: [-4, -1, -4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="grid aspect-[3/4] place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-rose/20 via-violet/16 to-cyan/18">
                  <WandSparkles className="h-16 w-16 text-rose" />
                </div>
                <div className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-rose">Live card showcase</div>
                <div className="mt-1 text-2xl font-black">Cards appear when public data loads</div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Players" value={stats.players} icon={Users} />
        <StatCard label="Card Templates" value={stats.cards} icon={Gem} />
        <StatCard label="Unique Copies" value={stats.copies} icon={Heart} />
        <StatCard label="Guilds" value={stats.guilds} icon={Swords} />
      </section>

      <CardSection title="Featured Cards" eyebrow="Showcase" cards={showcase.featured} status={showcaseStatus} />
      <CardSection title="Top Wishlisted" eyebrow="Player demand" cards={showcase.topWishlisted} status={showcaseStatus} />
      <div className="grid gap-8 lg:grid-cols-2">
        <CardSection title="Rare Finds" eyebrow="Premium styles" cards={showcase.rareFinds.slice(0, 4)} status={showcaseStatus} compact />
        <CardSection title="Recently Added" eyebrow="Fresh gallery" cards={showcase.recentlyAdded.slice(0, 4)} status={showcaseStatus} compact />
      </div>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          ["Drops", "Watch for card drops in Discord and build your collection over time.", Zap],
          ["Wishlist", "Track cards you care about and see what other collectors are chasing.", Heart],
          ["Guilds", "Group up with other players and give your profile a home.", Trophy]
        ].map(([title, text, Icon]) => (
          <div key={title} className="glass rounded-2xl p-5">
            <Icon className="h-6 w-6 text-rose" />
            <h3 className="mt-4 text-xl font-black">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
          </div>
        ))}
      </section>
    </Page>
  );
}

function CardSection({ title, eyebrow, cards, status, compact = false }) {
  return (
    <section className="mb-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-rose">{eyebrow}</div>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">{title}</h2>
          <DataStatus status={status} className="mt-3" />
        </div>
        <Link to="/collection" className="hidden text-sm font-bold text-white/58 transition hover:text-white sm:block">View all</Link>
      </div>
      <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"}`}>
        {cards.length ? cards.map(({ card, count }) => <CardTile key={card.id} card={card} wished={count > 0} count={count} />) : (
          <div className="col-span-full rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/58">Card previews will appear when public card data is available.</div>
        )}
      </div>
    </section>
  );
}
