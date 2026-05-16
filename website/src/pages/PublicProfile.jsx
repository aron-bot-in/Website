import { BadgeCheck, Gem, Heart } from "lucide-react";
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
  const [dataStatus, setDataStatus] = useState(dataStatuses.loading);
  useEffect(() => subscribeDashboard(id, (value, status) => {
    setData(value);
    setDataStatus(status || dataStatuses.live);
  }), [id]);
  const user = data?.user || {};
  const inventory = Array.isArray(user.inventory) ? user.inventory : [];
  return (
    <Page>
      <section className="glass mb-6 overflow-hidden rounded-lg">
        <div className="h-44 bg-gradient-to-r from-cyan/20 via-violet/20 to-rose/20" />
        <div className="p-6">
          <div className="text-sm font-black uppercase tracking-[0.24em] text-cyan">Public profile</div>
          <h1 className="mt-2 text-4xl font-black">{user.username || `Player ${id}`}</h1>
          <DataStatus status={dataStatus} className="mt-4" />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Cards" value={inventory.length} icon={Gem} />
        <StatCard label="Wishlist" value={user.wishlist?.length || 0} icon={Heart} />
        <StatCard label="Guild Members" value={data?.guild?.memberIds?.length || 0} icon={BadgeCheck} />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {inventory.slice(0, 20).map((copy) => <CardTile key={copy.code} copy={copy} card={data?.cards?.[copy.cardId]} wished={user.wishlist?.includes(copy.cardId)} count={data?.wishlistLeaderboard?.[copy.cardId]} />)}
        {data && !inventory.length ? <div className="col-span-full rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/56">No public inventory copies found for this profile.</div> : null}
      </div>
    </Page>
  );
}
