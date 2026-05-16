import { Coins, Gem, Heart, Timer, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CardTile from "../components/CardTile.jsx";
import DataStatus from "../components/DataStatus.jsx";
import Page from "../components/Page.jsx";
import RequireLogin from "../components/RequireLogin.jsx";
import StatCard from "../components/StatCard.jsx";
import { dataStatuses, subscribeDashboard } from "../lib/data.js";
import { fullNumber, fromNow } from "../lib/format.js";
import { useAuthStore } from "../store/authStore.js";

export default function Dashboard() {
  const { identity } = useAuthStore();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(dataStatuses.loading);

  useEffect(() => {
    if (!identity?.discordId) return undefined;
    return subscribeDashboard(identity.discordId, (value, nextStatus) => {
      setData(value);
      setStatus(nextStatus || dataStatuses.live);
    });
  }, [identity?.discordId]);

  const user = data?.user || {};
  const cards = data?.cards || {};
  const inventory = Array.isArray(user.inventory) ? user.inventory : [];
  const wishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
  const ownedIds = useMemo(() => new Set(inventory.map((copy) => String(copy.cardId))), [inventory]);
  const completion = Object.keys(cards).length ? Math.round((ownedIds.size / Object.keys(cards).length) * 100) : 0;

  return (
    <Page>
      <RequireLogin>
        <section className="rounded-lg border border-white/10 bg-panel/80 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Player dashboard</div>
              <h1 className="mt-2 text-4xl font-black">{identity?.username || user.username || "Aron Player"}</h1>
              <p className="mt-2 max-w-2xl text-white/62">Public profile data only. Private bot data stays off the browser.</p>
              <DataStatus status={status} className="mt-3" />
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/70">
              Discord ID <span className="ml-2 text-white">{identity?.discordId}</span>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-4">
          <StatCard label="Inventory" value={inventory.length} icon={Gem} />
          <StatCard label="Wishlist" value={wishlist.length} icon={Heart} />
          <StatCard label="Coins" value={user.wallet?.coins || 0} icon={Coins} />
          <StatCard label="Quest points" value={user.questState?.totalPoints || user.stats?.questPoints || 0} icon={Trophy} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-black">Visible inventory</h2>
              <span className="text-sm font-bold text-white/46">{fullNumber(ownedIds.size)} unique cards</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {inventory.slice(0, 9).map((copy) => <CardTile key={copy.code || `${copy.cardId}-${copy.gen}`} copy={copy} card={cards?.[copy.cardId]} count={data?.wishlistLeaderboard?.[copy.cardId]} wished={wishlist.includes(copy.cardId)} />)}
              {!inventory.length ? <Empty text={status?.source === "loading" ? "Loading public inventory." : "No public inventory copies are available for this account."} /> : null}
            </div>
          </div>

          <div className="grid gap-4">
            <Panel title="Collection progress">
              <div className="flex items-end justify-between">
                <div className="text-4xl font-black">{completion}%</div>
                <div className="text-sm font-bold text-white/52">{fullNumber(ownedIds.size)} / {fullNumber(Object.keys(cards).length)}</div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-cyan" style={{ width: `${Math.min(100, Math.max(0, completion))}%` }} />
              </div>
            </Panel>
            <Panel title="Guild">
              <Row icon={Users} label="Name" value={data?.guild?.name || "No public guild"} />
              <Row icon={Users} label="Members" value={fullNumber(data?.guild?.memberIds?.length || 0)} />
            </Panel>
            <Panel title="Cooldowns">
              <Row icon={Timer} label="Drop" value={fromNow(Number(user.lastDropAt || 0) + 30 * 60 * 1000)} />
              <Row icon={Timer} label="Claim" value={fromNow(Number(user.lastClaimAt || 0) + 30 * 60 * 1000)} />
            </Panel>
          </div>
        </section>
      </RequireLogin>
    </Page>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-lg border border-white/10 bg-panel/80 p-5">
      <h2 className="mb-4 text-lg font-black">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-white/[0.04] px-3 py-2 text-sm">
      <span className="inline-flex items-center gap-2 text-white/58"><Icon className="h-4 w-4 text-cyan" />{label}</span>
      <span className="text-right font-black">{value}</span>
    </div>
  );
}

function Empty({ text }) {
  return <div className="col-span-full rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/58">{text}</div>;
}
