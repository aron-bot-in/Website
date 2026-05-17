import { CalendarDays, Gift, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export default function EventsPreview({ event }) {
  const active = event?.active ? event.event : null;
  const questCount = Array.isArray(event?.quests) ? event.quests.length : 0;
  const shopCount = Array.isArray(event?.shopItems) ? event.shopItems.length : 0;
  const leaderCount = Array.isArray(event?.leaderboard) ? event.leaderboard.length : 0;

  return (
    <section id="events" className="mt-14 scroll-mt-28">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-panel/82 shadow-card">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[280px] overflow-hidden bg-gradient-to-br from-cyan/26 via-violet/24 to-rose/28 p-5 sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%),linear-gradient(135deg,rgba(0,0,0,0.18),rgba(0,0,0,0.72))]" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md border border-white/16 bg-black/24 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan">
                  <CalendarDays className="h-4 w-4" />
                  {active ? "Active Event" : "Events"}
                </div>
                <h2 className="mt-5 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">{active?.name || "No seasonal event is active"}</h2>
                <p className="mt-3 max-w-xl text-lg font-bold text-white/68">{active ? `${active.currency} rewards end ${new Date(active.endsAt).toLocaleDateString()}` : "The event panel is ready for the next Aron season."}</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/guide#events" className="rounded-lg border border-cyan/35 bg-cyan px-4 py-2 text-sm font-black text-ink transition hover:bg-cyan/90">Leaderboard</Link>
                <Link to="/guide#events" className="rounded-lg border border-white/14 bg-white/[0.06] px-4 py-2 text-sm font-black text-white/76 transition hover:text-white">Event guide</Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:p-6">
            <div className="rounded-lg border border-cyan/18 bg-cyan/[0.08] p-4">
              <Gift className="h-7 w-7 text-cyan" />
              <h3 className="mt-3 text-2xl font-black">{active ? `${shopCount} shop items` : "Event shop standby"}</h3>
              <p className="mt-2 text-white/58">{active ? "Live shop, quest, and leaderboard data comes from the Aron API." : "No mock event is shown when the API has no active event."}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Quests" value={questCount} />
              <MiniStat label="Leaders" value={leaderCount} />
            </div>
            <div className="grid gap-3">
              {(event?.leaderboard || []).slice(0, 2).map((leader, index) => (
                <div key={leader.userId || index} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-center gap-2 font-black"><Trophy className="h-4 w-4 text-violet" />#{index + 1} {leader.username || leader.userId}</div>
                  <p className="mt-2 text-sm font-bold text-white/50">{Number(leader.points || 0).toLocaleString("en-US")} event points</p>
                </div>
              ))}
              {!(event?.leaderboard || []).length ? (
                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm font-bold text-white/50">
                  Event leaderboard appears here once players earn points.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
    </div>
  );
}
