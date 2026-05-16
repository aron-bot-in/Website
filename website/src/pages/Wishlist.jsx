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
  const [status, setStatus] = useState(dataStatuses.loading);

  useEffect(() => {
    if (!identity?.discordId) return undefined;
    return subscribeWishlistData(identity.discordId, (value, nextStatus) => {
      setData(value);
      setStatus(nextStatus || dataStatuses.live);
    });
  }, [identity?.discordId]);

  const cards = data?.wishlistCards || [];

  return (
    <Page>
      <RequireLogin>
        <section className="mb-6">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-rose"><Heart className="mr-2 inline h-4 w-4" />Wishlist</div>
          <h1 className="mt-2 text-4xl font-black">{cards.length} watched cards</h1>
          <p className="mt-3 max-w-2xl text-white/62">Your public wishlist, matched against public card templates.</p>
          <DataStatus status={status} className="mt-3" />
        </section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {cards.map((card) => <CardTile key={card.id} card={card} wished count={data?.wishlistLeaderboard?.[card.id]} />)}
          {data && !cards.length ? (
            <div className="col-span-full rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/58">
              No public wishlist cards are available yet.
            </div>
          ) : null}
        </div>
      </RequireLogin>
    </Page>
  );
}
