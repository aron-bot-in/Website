import { Shield, TrendingUp, Users } from "lucide-react";
import { compactNumber } from "../../lib/format.js";

export default function GuildLeaderboard({ guilds }) {
  return (
    <section id="guilds" className="mt-14 scroll-mt-28">
      <div className="rounded-lg border border-white/10 bg-panel/82 p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Guilds</div>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Guilds on the Rise</h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-cyan/18 bg-cyan/[0.08] px-3 py-2 text-sm font-black text-cyan">
            <TrendingUp className="h-4 w-4" />
            Weekly score
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {guilds.map((guild) => (
            <article key={guild.rank} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan/26 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
              <div className="grid h-12 w-12 place-items-center rounded-lg border border-white/10 bg-black/22 text-xl font-black text-cyan">#{guild.rank}</div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-xl font-black">{guild.name}</h3>
                  <span className="inline-flex items-center gap-1 rounded-md border border-violet/25 bg-violet/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-violet">
                    <Shield className="h-3 w-3" />
                    {guild.badge}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-white/52">
                  <span><Users className="mr-1 inline h-4 w-4 text-cyan" />{compactNumber(guild.members)} members</span>
                  <span>{compactNumber(guild.cards)} cards collected</span>
                </div>
              </div>
              <div className="w-fit rounded-lg border border-cyan/20 bg-cyan/[0.08] px-3 py-2 text-lg font-black text-cyan sm:justify-self-end">{guild.score}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
