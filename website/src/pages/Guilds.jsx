import { Crown, Swords, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DataStatus from "../components/DataStatus.jsx";
import Page from "../components/Page.jsx";
import { dataStatuses, subscribeGuildsPage } from "../lib/data.js";
import { fullNumber } from "../lib/format.js";

export default function Guilds() {
  const [guilds, setGuilds] = useState({});
  const [status, setStatus] = useState(dataStatuses.loading);

  useEffect(() => subscribeGuildsPage(120, (value, nextStatus) => {
    setGuilds(value);
    setStatus(nextStatus || dataStatuses.live);
  }), []);

  const entries = useMemo(() => Object.values(guilds).sort((left, right) => (right.memberIds?.length || 0) - (left.memberIds?.length || 0)), [guilds]);

  return (
    <Page>
      <section className="mb-6">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan"><Swords className="mr-2 inline h-4 w-4" />Guilds</div>
        <h1 className="mt-2 text-4xl font-black">Guild hall</h1>
        <p className="mt-3 max-w-2xl text-white/62">Public guild profiles read from Firebase.</p>
        <DataStatus status={status} className="mt-3" />
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((guild, index) => (
          <article key={guild.id} className="overflow-hidden rounded-lg border border-white/10 bg-panel/80 shadow-card">
            <div className="relative h-32 bg-white/[0.04]" style={guild.bannerUrl ? { backgroundImage: `url(${guild.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
              <div className="absolute left-4 top-4 rounded-md border border-cyan/25 bg-cyan/12 px-3 py-1 text-xs font-black text-cyan">#{index + 1}</div>
            </div>
            <div className="p-5">
              <h2 className="text-2xl font-black">{guild.name || "Unnamed guild"}</h2>
              <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-white/58">{guild.description || "Public guild description has not been set."}</p>
              <div className="mt-4 grid gap-2">
                <Row icon={Users} label="Members" value={`${fullNumber(guild.memberIds?.length || 0)} / ${guild.memberLimit || 20}`} />
                <Row icon={Crown} label="Owner" value={guild.ownerId || "Unknown"} />
              </div>
            </div>
          </article>
        ))}
        {!entries.length ? (
          <div className="col-span-full rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/58">
            Public guild data is not available yet.
          </div>
        ) : null}
      </div>
    </Page>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-white/[0.04] px-3 py-2 text-sm">
      <span className="inline-flex items-center gap-2 text-white/58"><Icon className="h-4 w-4 text-cyan" />{label}</span>
      <span className="min-w-0 truncate text-right font-black">{value}</span>
    </div>
  );
}
