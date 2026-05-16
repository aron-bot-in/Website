import { BadgeCheck, Coins, Gem, Heart, Layers3, Sparkles, Star, Timer, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Page from "../components/Page.jsx";
import RequireLogin from "../components/RequireLogin.jsx";
import DataStatus from "../components/DataStatus.jsx";
import StatCard from "../components/StatCard.jsx";
import CardTile from "../components/CardTile.jsx";
import { dataStatuses, subscribeDashboard } from "../lib/data.js";
import { fullNumber, fromNow } from "../lib/format.js";
import { useAuthStore } from "../store/authStore.js";

export default function Dashboard() {
  const { identity } = useAuthStore();
  const [data, setData] = useState(null);
  const [dataStatus, setDataStatus] = useState(dataStatuses.loading);

  useEffect(() => {
    if (!identity?.discordId) return undefined;
    return subscribeDashboard(identity.discordId, (value, status) => {
      setData(value);
      setDataStatus(status || dataStatuses.live);
    });
  }, [identity?.discordId]);

  const user = data?.user || {};
  const inventory = Array.isArray(user.inventory) ? user.inventory : [];
  const wishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
  const cards = data?.cards || {};
  const wallet = user.wallet || {};
  const ownedCardIds = useMemo(() => new Set(inventory.map((copy) => String(copy.cardId))), [inventory]);
  const collectionPercent = Object.keys(cards).length ? Math.round((ownedCardIds.size / Object.keys(cards).length) * 100) : 0;
  const topInventory = inventory.slice(0, 6);
  const wishlistCards = wishlist.map((cardId) => cards?.[cardId]).filter(Boolean).slice(0, 4);
  const recentActivity = [
    ["Last drop", fromNow(Number(user.lastDropAt || 0) + 30 * 60 * 1000)],
    ["Last claim", fromNow(Number(user.lastClaimAt || 0) + 30 * 60 * 1000)],
    ["Cards claimed", fullNumber(user.stats?.cardsClaimed || 0)],
    ["Cards dropped", fullNumber(user.stats?.cardsDropped || 0)]
  ];

  return (
    <Page>
      <RequireLogin>
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-rose/16 via-violet/10 to-cyan/10 p-6 shadow-card sm:p-8">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-rose/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-rose">Player dashboard</div>
              <h1 className="mt-2 text-4xl font-black sm:text-5xl">{identity?.username || user.username || "Aron Player"}</h1>
              <p className="mt-3 max-w-2xl text-white/64">Your collection, wishlist, guild, and progress in one cleaner player hub.</p>
              <DataStatus status={dataStatus} className="mt-4" />
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm font-black text-cyan">
              <BadgeCheck className="h-4 w-4" /> {user.id ? "Public profile ready" : "Public profile pending"}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Cards Owned" value={inventory.length} icon={Gem} />
          <StatCard label="Wishlist" value={wishlist.length} icon={Heart} />
          <StatCard label="Coins" value={wallet.coins || 0} icon={Coins} />
          <StatCard label="Quest Points" value={user.questState?.totalPoints || user.stats?.questPoints || 0} icon={Trophy} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Top Cards</h2>
                <p className="mt-1 text-sm text-white/56">A quick look at the cards currently visible from your public inventory.</p>
              </div>
              <Sparkles className="h-6 w-6 text-rose" />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {topInventory.map((copy) => <CardTile key={copy.code || `${copy.cardId}-${copy.gen}`} copy={copy} card={cards[copy.cardId]} wished={wishlist.includes(copy.cardId)} count={data?.wishlistLeaderboard?.[copy.cardId]} />)}
              {!topInventory.length ? <EmptyCard status={dataStatus} /> : null}
            </div>
          </div>

          <div className="grid gap-4">
            <ProgressPanel percent={collectionPercent} owned={ownedCardIds.size} total={Object.keys(cards).length} />
            <InfoPanel title="Wishlist" icon={Heart} rows={wishlistCards.length ? wishlistCards.map((card) => [card.name, card.series]) : [["No cards shown", "Wishlist items appear here when public data is available."]]} />
            <InfoPanel title="Guild" icon={Users} rows={[
              ["Name", data?.guild?.name || "No guild"],
              ["Members", fullNumber(data?.guild?.memberIds?.length || 0)],
              ["Status", data?.guild ? "Active member" : "Unranked"]
            ]} />
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <InfoPanel title="Recent Activity" icon={Timer} rows={recentActivity} />
          <InfoPanel title="Server/Bot Stats" icon={Star} rows={[
            ["Visible card templates", fullNumber(Object.keys(cards).length)],
            ["Visible wishlist cards", fullNumber(wishlistCards.length)],
            ["Public inventory copies", fullNumber(inventory.length)]
          ]} />
        </section>
      </RequireLogin>
    </Page>
  );
}

function ProgressPanel({ percent, owned, total }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-lg font-black"><Layers3 className="h-5 w-5 text-cyan" />Collection Progress</h2>
      <div className="mt-5">
        <div className="flex items-end justify-between">
          <div className="text-4xl font-black">{percent}%</div>
          <div className="text-sm font-bold text-white/56">{fullNumber(owned)} / {fullNumber(total)}</div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-gradient-to-r from-rose via-violet to-cyan" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
        </div>
      </div>
    </div>
  );
}

function InfoPanel({ title, icon: Icon, rows }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-lg font-black"><Icon className="h-5 w-5 text-rose" />{title}</h2>
      <div className="mt-4 grid gap-3">
        {rows.map(([label, value]) => (
          <div key={`${title}-${label}`} className="flex items-center justify-between gap-4 rounded-xl bg-white/5 px-3 py-2 text-sm">
            <span className="min-w-0 truncate text-white/62">{label}</span>
            <span className="text-right font-bold text-white/86">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyCard({ status }) {
  const text = status?.source === "loading"
    ? "Loading public inventory."
    : status?.source === "fallback"
      ? "No cached public inventory copies found."
      : "No public inventory copies found yet.";
  return <div className="col-span-full rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/56">{text}</div>;
}
