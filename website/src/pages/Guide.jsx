import { BookOpen, Gift, Heart, ShieldCheck, Swords, Users } from "lucide-react";
import Page from "../components/Page.jsx";

const sections = [
  ["Register", "Start in Discord. The bot remains the source of truth for account creation and gameplay state.", ShieldCheck],
  ["Drop", "Watch active channels for card drops and claim prompts.", Gift],
  ["Wishlist", "Add cards in Discord; the website reads the public wishlist summary when available.", Heart],
  ["Trade", "Use the bot flow for trades so both sides confirm safely.", Swords],
  ["Guilds", "Join a player guild and show it on your public profile.", Users],
  ["Verify", "Verification uses the existing backend and never writes directly from browser Firebase.", BookOpen]
];

export default function Guide() {
  return (
    <Page>
      <section className="mb-7">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Guide</div>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">How Aron works</h1>
        <p className="mt-3 max-w-2xl text-white/62">A compact overview. Exact cooldowns, permissions, and commands should be checked in Discord.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(([title, text, Icon]) => (
          <article key={title} className="rounded-lg border border-white/10 bg-panel/80 p-5">
            <Icon className="h-6 w-6 text-cyan" />
            <h2 className="mt-4 text-2xl font-black">{title}</h2>
            <p className="mt-2 leading-7 text-white/60">{text}</p>
          </article>
        ))}
      </div>
    </Page>
  );
}
