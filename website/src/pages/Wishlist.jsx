import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import CardTile from "../components/CardTile.jsx";
import DataStatus from "../components/DataStatus.jsx";
import Page from "../components/Page.jsx";
import RequireLogin from "../components/RequireLogin.jsx";
import { dataStatuses, subscribeWishlistData } from "../lib/data.js";
import { useAuthStore } from "../store/authStore.js";

export default function Wishlist() {
  const { identity } = useAuthStore();
  const [data, setData] = useState(null);
  const [dataStatus, setDataStatus] = useState(dataStatuses.loading);
  useEffect(() => {
    if (!identity?.discordId) return undefined;
    return subscribeWishlistData(identity.discordId, (value, status) => {
      setData(value);
      setDataStatus(status || dataStatuses.live);
    });
  }, [identity?.discordId]);
  return (
    <Page>
      <RequireLogin>
        <div className="mb-6">
          <div className="text-sm font-black uppercase tracking-[0.24em] text-rose"><Heart className="mr-2 inline h-4 w-4" />Wishlist</div>
          <h1 className="mt-2 text-4xl font-black">{data?.wishlistCards?.length || 0} watched cards</h1>
          <p className="mt-3 max-w-2xl text-white/62">Track the cards you are chasing and see their public wishlist demand when available.</p>
          <DataStatus status={dataStatus} className="mt-4" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {(data?.wishlistCards || []).map((card) => <CardTile key={card.id} card={card} wished count={data?.wishlistLeaderboard?.[card.id]} />)}
          {data && !data?.wishlistCards?.length ? <EmptyWishlist status={dataStatus} /> : null}
        </div>
      </RequireLogin>
    </Page>
  );
}

function EmptyWishlist({ status }) {
  const text = status?.source === "loading"
    ? "Loading public wishlist cards."
    : status?.source === "fallback"
      ? "No cached public wishlist cards found."
      : "No public wishlist cards found yet. Add cards in Discord, then check back here.";
  return <div className="col-span-full rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/56">{text}</div>;
}
