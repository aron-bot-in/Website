import { BadgeCheck, BookOpen, Gem, Heart, Images, Shield, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Chip, EmptyState, Panel, StatRow } from "../components/AronUi.jsx";
import CardTile from "../components/CardTile.jsx";
import DataStatus from "../components/DataStatus.jsx";
import Page from "../components/Page.jsx";
import StatCard from "../components/StatCard.jsx";
import { dataStatuses, subscribeDashboard } from "../lib/data.js";

export default function PublicProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(dataStatuses.loading);

  useEffect(() => subscribeDashboard(id, (value, nextStatus) => {
    setData(value);
    setStatus(nextStatus || dataStatuses.live);
  }), [id]);

  const user = data?.user || {};
  const inventory = Array.isArray(user.inventory) ? user.inventory : [];
  const profile = user.profile || {};
  const favoriteCopy = profile.favoriteCard
    ? inventory.find((copy) => String(copy.code || copy.id || copy.cardId) === String(profile.favoriteCard) || String(copy.cardId) === String(profile.favoriteCard))
    : null;
  const showcase = [favoriteCopy, ...inventory].filter(Boolean).filter((copy, index, list) => {
    const key = copy.code || `${copy.cardId}-${copy.gen || index}`;
    return list.findIndex((item, itemIndex) => (item.code || `${item.cardId}-${item.gen || itemIndex}`) === key) === index;
  }).slice(0, 8);

  return (
    <Page>
      <section className="hero-shell mb-6 overflow-hidden rounded-lg border border-white/10 p-5 shadow-card sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-[0_0_26px_rgba(64,230,255,0.10)]">
              {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9 text-cyan" />}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Public profile</div>
              <h1 className="mt-1 truncate text-4xl font-black sm:text-5xl">{user.username || `Player ${id}`}</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/62">
                {profile.bio || "This trainer has not styled their profile bio yet."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <DataStatus status={status} />
                {profile.title ? <Chip tone="gold" icon={Sparkles}>{profile.title}</Chip> : <Chip tone="muted">No title set</Chip>}
              </div>
            </div>
          </div>
          <Panel className="bg-black/24" eyebrow="Identity" title="Profile Card">
            <div className="grid gap-3">
              <StatRow icon={Gem} label="Visible cards" value={inventory.length} />
              <StatRow icon={Heart} label="Wishlist" value={user.wishlist?.length || 0} />
              <StatRow icon={Shield} label="Guild" value={data?.guild?.name || "No public guild"} />
            </div>
          </Panel>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <StatCard label="Inventory" value={inventory.length} icon={Gem} />
        <StatCard label="Wishlist" value={user.wishlist?.length || 0} icon={Heart} />
        <StatCard label="Guild members" value={data?.guild?.memberIds?.length || 0} icon={BadgeCheck} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel eyebrow="Showcase" title="Featured cards" description="Only public inventory data is shown here. Private wallet and account data stay out of the page.">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {showcase.map((copy, index) => (
              <CardTile key={copy.code || `${copy.cardId}-${copy.gen || index}`} copy={copy} card={data?.cards?.[copy.cardId]} wished={user.wishlist?.includes(copy.cardId)} count={data?.wishlistLeaderboard?.[copy.cardId]} />
            ))}
            {data && !showcase.length ? (
              <EmptyState className="col-span-full" icon={Images} title="No cards are showcased yet.">
                This profile is public, but the trainer has not revealed any card copies for display.
              </EmptyState>
            ) : null}
          </div>
        </Panel>

        <div className="grid gap-4">
          <Panel eyebrow="Badges" title="Profile marks">
            <div className="flex flex-wrap gap-2">
              {profile.badges?.length ? profile.badges.map((badge) => <Chip key={badge} tone="violet" icon={BadgeCheck}>{badge}</Chip>) : <Chip tone="muted">No badges equipped</Chip>}
            </div>
          </Panel>
          <Panel eyebrow="Guide" title="Style your own profile" description="Profile edits happen through the bot and existing authenticated flows.">
            <Link to="/guide#profile" className="inline-flex items-center gap-2 rounded-lg border border-cyan/28 bg-cyan/10 px-3 py-2 text-sm font-black text-cyan transition hover:bg-cyan/15">
              <BookOpen className="h-4 w-4" />
              Open profile guide
            </Link>
          </Panel>
        </div>
      </section>
    </Page>
  );
}
