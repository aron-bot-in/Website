import { Coins, Gem, Heart, Images, Shield, Timer, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, Panel, StatRow } from "../components/AronUi.jsx";
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
        <section className="hero-shell overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-card sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Player dashboard</div>
              <h1 className="mt-2 text-5xl font-black leading-tight">{identity?.username || user.username || "Aron Player"}</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/62">
                Your public collection panel, styled for browsing. Wallet-private data still stays inside protected bot flows.
              </p>
              <DataStatus status={status} className="mt-3" />
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white/70 shadow-[0_0_26px_rgba(64,230,255,0.08)]">
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
              <h2 className="text-2xl font-black">Collection showcase</h2>
              <span className="text-sm font-bold text-white/46">{fullNumber(ownedIds.size)} unique cards</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {inventory.slice(0, 9).map((copy) => <CardTile key={copy.code || `${copy.cardId}-${copy.gen}`} copy={copy} card={cards?.[copy.cardId]} count={data?.wishlistLeaderboard?.[copy.cardId]} wished={wishlist.includes(copy.cardId)} />)}
              {!inventory.length ? (
                <EmptyState className="col-span-full" icon={Images} title={status?.source === "loading" ? "Loading your showcase." : "No public cards are on display yet."}>
                  {status?.source === "loading" ? "ARON is pulling the public profile snapshot." : "Claimed cards can appear here once the account exposes public inventory data."}
                </EmptyState>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4">
            <Panel eyebrow="Collection" title="Progress">
              <div className="flex items-end justify-between">
                <div className="text-4xl font-black">{completion}%</div>
                <div className="text-sm font-bold text-white/52">{fullNumber(ownedIds.size)} / {fullNumber(Object.keys(cards).length)}</div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-cyan" style={{ width: `${Math.min(100, Math.max(0, completion))}%` }} />
              </div>
            </Panel>
            <Panel eyebrow="Guild" title="Raid crew">
              <StatRow icon={Shield} label="Name" value={data?.guild?.name || "No public guild"} />
              <StatRow icon={Users} label="Members" value={fullNumber(data?.guild?.memberIds?.length || 0)} />
            </Panel>
            <Panel eyebrow="Timers" title="Next actions">
              <StatRow icon={Timer} label="Drop" value={fromNow(Number(user.lastDropAt || 0) + 30 * 60 * 1000)} />
              <StatRow icon={Timer} label="Claim" value={fromNow(Number(user.lastClaimAt || 0) + 30 * 60 * 1000)} />
            </Panel>
          </div>
        </section>
      </RequireLogin>
    </Page>
  );
}
