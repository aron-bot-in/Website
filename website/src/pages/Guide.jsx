import { BookOpen, Gem, Gift, Heart, HelpCircle, Swords, Ticket, Users } from "lucide-react";
import { useState } from "react";
import Page from "../components/Page.jsx";

const sections = [
  ["Getting Started", "Invite Aron, join a server where the bot is active, and use Discord help to see available commands.", BookOpen],
  ["Card Drops", "Cards appear through Discord gameplay. Watch active channels and follow the bot prompts when a drop is available.", Gift],
  ["Wishlist", "Wishlist cards you want so they are easier to track from your player hub and public demand boards.", Heart],
  ["Trading", "Trade with other collectors through the bot's Discord flow. Confirm details in Discord before accepting.", Swords],
  ["Rarities", "Cards can have visual styles such as Aurum, Aether, and Aqua. The bot remains the source of truth for exact rarity behavior.", Gem],
  ["Guilds", "Guilds group collectors together for identity, progression, and community competition where enabled.", Users],
  ["Events", "Special events may add limited goals or themed rewards. Check announcements and the Discord help command.", Ticket],
  ["Commands", "Use the bot help command in Discord for exact command names, cooldowns, and current behavior.", HelpCircle]
];

export default function Guide() {
  const [active, setActive] = useState(sections[0][0]);
  const current = sections.find(([title]) => title === active) || sections[0];
  const Icon = current[2];

  return (
    <Page className="pb-20">
      <section className="mb-8">
        <div className="text-xs font-black uppercase tracking-[0.24em] text-rose">Beginner guide</div>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">Learn Aron</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-white/64">
          A clean overview for new collectors. Exact command names and live rules should be checked in Discord with the bot help command.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {sections.map(([title, text, SectionIcon]) => (
            <button
              key={title}
              onClick={() => setActive(title)}
              className={`flex min-h-16 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${active === title ? "border-rose/40 bg-rose/12 text-white" : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.07]"}`}
            >
              <SectionIcon className={active === title ? "h-5 w-5 text-rose" : "h-5 w-5 text-cyan"} />
              <span className="font-black">{title}</span>
            </button>
          ))}
        </div>

        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-rose/25 bg-rose/10">
            <Icon className="h-8 w-8 text-rose" />
          </div>
          <h2 className="mt-6 text-3xl font-black">{current[0]}</h2>
          <p className="mt-4 text-lg leading-8 text-white/66">{current[1]}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {sections.slice(0, 4).map(([title, text]) => (
              <div key={`${current[0]}-${title}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm font-black text-white">{title}</div>
                <p className="mt-2 text-sm leading-6 text-white/56">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Page>
  );
}
