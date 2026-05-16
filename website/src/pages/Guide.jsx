import {
  BookOpen,
  CheckCircle2,
  Gift,
  Heart,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  UserRound,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Page from "../components/Page.jsx";

const guideNavItems = [
  { label: "Welcome", href: "#welcome" },
  { label: "Getting Started", href: "#getting-started" },
  { label: "Commands", href: "#commands" },
  { label: "Cards", href: "#cards" },
  { label: "Drops", href: "#drops" },
  { label: "Wishlist", href: "#wishlist" },
  { label: "Trading", href: "#trading" },
  { label: "Guilds", href: "#guilds" },
  { label: "Events", href: "#events" },
  { label: "Profile", href: "#profile" },
  { label: "Verification", href: "#verification" }
];

const categoryCards = [
  ["Getting Started", "Learn how to register, verify, and begin collecting cards.", ShieldCheck],
  ["Cards", "Understand card drops, rarities, editions, claims, and collections.", Sparkles],
  ["Wishlist", "Track your favorite cards and see which cards are most wanted.", Heart],
  ["Trading", "Learn how trades work and how both players confirm safely.", Swords],
  ["Guilds", "Create or join guilds, compete with members, and climb rankings.", Users],
  ["Events", "Discover limited-time events, rewards, and seasonal card releases.", Gift]
];

const articleSections = [
  ["Getting Started", "Start in Discord, follow the bot prompts, then use the website to browse public cards, guilds, and player-facing index data."],
  ["Commands", "Use ARON commands in Discord for gameplay actions such as drops, claims, wishlists, trades, profiles, guilds, and verification."],
  ["Cards", "Cards are organized by character, series, rarity, edition, and public demand so collectors can understand what is available and what players want most."],
  ["Drops", "Drops happen in Discord. Claim windows, cooldowns, and channel rules remain controlled by the bot so gameplay state stays consistent."],
  ["Wishlist", "Wishlist activity powers public demand rankings. The website reads live Firebase counts where available and falls back safely when older data is present."],
  ["Trading", "Trades should be handled through the bot flow so both players review and confirm before anything changes."],
  ["Guilds", "Guilds let players group up, compare progress, and appear in public rankings using the same Firebase-backed data as the rest of the website."],
  ["Events", "Events bring limited-time cards, seasonal rewards, and collection goals into ARON while keeping event actions inside Discord."],
  ["Profile", "Profiles summarize public player progress, guild membership, collection highlights, wishlist activity, and verification status where available."],
  ["Verification", "Verification keeps using the existing ARON backend and auth flow. Public pages do not replace bot-side account safety checks."]
];

export default function Guide() {
  const [activeSection, setActiveSection] = useState("welcome");

  useEffect(() => {
    const hashTarget = window.location.hash.match(/#\/guide#([a-z0-9-]+)$/)?.[1];
    if (!hashTarget) return;
    const section = document.getElementById(hashTarget);
    if (!section) return;
    setActiveSection(hashTarget);
    window.requestAnimationFrame(() => section.scrollIntoView({ block: "start" }));
  }, []);

  const handleSectionLink = (event, href) => {
    event.preventDefault();
    const sectionId = href.replace(/^#/, "");
    const section = document.getElementById(sectionId);
    if (!section) return;

    setActiveSection(sectionId);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/guide#${sectionId}`);
  };

  return (
    <Page className="pb-16">
      <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)_230px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-lg border border-white/10 bg-panel/80 p-3">
            <div className="px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan">ARON Guide</div>
            <nav className="mt-2 grid gap-1">
              {guideNavItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleSectionLink(event, item.href)}
                  className={`rounded-md px-3 py-2 text-sm font-bold transition hover:bg-white/[0.06] hover:text-white ${activeSection === item.href.slice(1) ? "bg-white/10 text-white" : "text-white/58"}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          <section id="welcome" className="scroll-mt-28 rounded-lg border border-white/10 bg-panel/80 p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-cyan/30 bg-cyan/10 px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan">Documentation</span>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] text-white/48">Discord Card Index</span>
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">Welcome to ARON Guide</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/64">
              ARON is a Discord card collecting bot where players collect anime cards, build wishlists, trade with friends, join guilds, and track their progress through a public card index.
            </p>
            <p className="mt-4 max-w-3xl leading-8 text-white/58">
              This guide explains the main ARON features, including commands, drops, cards, wishlists, trading, guilds, events, profiles, and verification.
            </p>
            <div className="mt-7 flex max-w-xl items-center gap-3 rounded-lg border border-white/10 bg-black/24 px-4 py-3 text-white/48">
              <Search className="h-5 w-5 shrink-0 text-cyan" />
              <span className="truncate text-sm font-bold">Search commands, drops, cards, wishlists...</span>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2">
            {categoryCards.map(([title, text, Icon]) => (
              <a key={title} href={`#${slug(title)}`} onClick={(event) => handleSectionLink(event, `#${slug(title)}`)} className="data-card rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <Icon className="h-6 w-6 text-cyan" />
                <h2 className="mt-4 text-2xl font-black">{title}</h2>
                <p className="mt-2 leading-7 text-white/60">{text}</p>
              </a>
            ))}
          </section>

          <section className="mt-8 rounded-lg border border-white/10 bg-panel/80 p-5 sm:p-8">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-cyan" />
              <h2 className="text-3xl font-black">Core Systems</h2>
            </div>
            <div className="mt-6 grid gap-7">
              {articleSections.map(([title, text]) => (
                <article key={title} id={slug(title)} className="scroll-mt-28 border-t border-white/10 pt-6 first:border-t-0 first:pt-0">
                  <h3 className="text-2xl font-black">{title}</h3>
                  <p className="mt-3 leading-8 text-white/62">{text}</p>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-lg border border-white/10 bg-panel/80 p-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan">On this page</div>
            <nav className="mt-4 grid gap-3 text-sm font-bold text-white/58">
              {guideNavItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleSectionLink(event, item.href)}
                  className={`transition hover:text-white ${activeSection === item.href.slice(1) ? "text-white" : ""}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-6 rounded-lg border border-cyan/18 bg-cyan/[0.08] p-4">
              <CheckCircle2 className="h-5 w-5 text-cyan" />
              <p className="mt-3 text-sm leading-6 text-white/58">Gameplay actions stay in Discord. The website is the public index and account companion.</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm font-bold text-white/58">
        <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-white/[0.05] px-3 py-2 hover:text-white"><UserRound className="h-4 w-4 text-cyan" />Profile</Link>
        <Link to="/verify" className="inline-flex items-center gap-2 rounded-md bg-white/[0.05] px-3 py-2 hover:text-white"><ShieldCheck className="h-4 w-4 text-cyan" />Verification</Link>
      </div>
    </Page>
  );
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
