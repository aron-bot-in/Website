import { BadgeCheck, Gem, Heart, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  return (
    <Page>
      <section className="mb-5 rounded-lg border border-white/10 bg-panel/80 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
            {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-8 w-8 text-cyan" />}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Public profile</div>
            <h1 className="mt-1 text-4xl font-black">{user.username || `Player ${id}`}</h1>
            <DataStatus status={status} className="mt-3" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <StatCard label="Inventory" value={inventory.length} icon={Gem} />
        <StatCard label="Wishlist" value={user.wishlist?.length || 0} icon={Heart} />
        <StatCard label="Guild members" value={data?.guild?.memberIds?.length || 0} icon={BadgeCheck} />
      </section>

      <section className="mt-6">
        <h2 className="mb-4 text-2xl font-black">Public inventory</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {inventory.slice(0, 30).map((copy) => <CardTile key={copy.code || `${copy.cardId}-${copy.gen}`} copy={copy} card={data?.cards?.[copy.cardId]} wished={user.wishlist?.includes(copy.cardId)} count={data?.wishlistLeaderboard?.[copy.cardId]} />)}
          {data && !inventory.length ? (
            <div className="col-span-full rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/58">
              No public inventory copies found for this profile.
            </div>
          ) : null}
        </div>
      </section>
    </Page>
  );
}
