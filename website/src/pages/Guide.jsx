import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Command,
  Gem,
  Gift,
  Images,
  Layers3,
  Link as LinkIcon,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  UserRound,
  Users,
  Vote,
  WandSparkles,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const navGroups = [
  {
    title: "Welcome",
    items: [
      { id: "welcome", label: "Welcome", description: "Start here" }
    ]
  },
  {
    title: "General Commands",
    items: [
      { id: "server-setup", label: "Server Setup" },
      { id: "drops", label: "Drop" },
      { id: "commands", label: "Burn" },
      { id: "commands", label: "View" },
      { id: "cards", label: "Card Info" },
      { id: "card-stats", label: "Card Stats" },
      { id: "commands", label: "Collection" },
      { id: "commands", label: "Wishlist" },
      { id: "commands", label: "Inventory" },
      { id: "commands", label: "Currencies" },
      { id: "commands", label: "Cooldown" },
      { id: "commands", label: "Trading" },
      { id: "vote", label: "Vote" }
    ]
  },
  {
    title: "Systems",
    items: [
      { id: "cosmetics", label: "Cosmetics" },
      { id: "tagging", label: "Tagging" },
      { id: "guilds", label: "Guilds" },
      { id: "raids", label: "Guild Raid" },
      { id: "events", label: "Events" },
      { id: "albums", label: "Albums" },
      { id: "profile", label: "Profile" },
      { id: "user-status", label: "User Status" },
      { id: "quests", label: "Tasks & Quests" },
      { id: "achievements", label: "Achievements" }
    ]
  }
];

const articleCards = [
  ["General Commands", "Essential Discord commands for collecting, trading, voting, and server setup.", Command, "server-setup"],
  ["Cards", "Collect and customize ARON copies with editions, stats, wishlist demand, and code records.", Gem, "cards"],
  ["Cosmetics", "Frames, backgrounds, glows, morphs, banners, and badges for cards and profiles.", WandSparkles, "cosmetics"],
  ["Tagging", "Tag card copies and organize inventory views for searching and trading.", Layers3, "tagging"],
  ["Guilds", "Create or join guilds, compare members, and prepare shared raid progress.", Users, "guilds"],
  ["Guild Raid", "Attack bosses with deck stats and claim raid-only currencies and rewards.", Swords, "raids"],
  ["Events", "Seasonal currencies, quests, event shops, rewards, and leaderboard points.", Trophy, "events"],
  ["Albums", "Create public or private albums with up to 30 owned copy codes.", Images, "albums"],
  ["Profile", "Customize bio, banner, favorite card, and up to five equipped badges.", UserRound, "profile"],
  ["User Status", "Understand cooldowns, wallet balances, inventory, and account state.", ShieldCheck, "user-status"],
  ["Tasks & Quests", "Track quest actions and claim progress rewards during normal play and events.", CheckCircle2, "quests"],
  ["Achievements", "Unlock achievement progress and equip owned profile badges.", BadgeCheck, "achievements"]
];

const commandBlocks = [
  {
    title: "Collecting",
    icon: Gift,
    commands: [
      ["/drop", "Start or participate in a timed card drop."],
      ["/claim", "Claim a visible card when a drop is active."],
      ["/cards <query>", "Search the public card pool."],
      ["/cardinfo <card>", "Inspect card details, series, and stats."],
      ["/card stats <code>", "Open the rendered battle stat panel for an owned copy."]
    ]
  },
  {
    title: "Inventory",
    icon: Images,
    commands: [
      ["/inventory", "Browse owned visible copies."],
      ["/showcard <code>", "Render one owned copy."],
      ["/view <code> stats", "Toggle the rendered stat panel from card view."],
      ["/wishlist add <card>", "Track a card you want."],
      ["/trade", "Open the bot-controlled trade flow."]
    ]
  },
  {
    title: "Style",
    icon: WandSparkles,
    commands: [
      ["/cosmetics", "Open owned cosmetic views."],
      ["/useframe <copy> <frame>", "Apply a frame to an owned copy."],
      ["/usebackground <copy> <background>", "Apply a card background."],
      ["/usebanner <banner>", "Equip a profile-only banner."]
    ]
  },
  {
    title: "Guilds",
    icon: Swords,
    commands: [
      ["/guild", "Create, join, or inspect a guild."],
      ["/deck add <copy>", "Build a three-card raid deck."],
      ["/deck stats", "Review HP, ATK, DEF, SPD, special, and moves."],
      ["/guildraid attack", "Attack the active guild boss."],
      ["/event", "Inspect seasonal event progress."]
    ]
  }
];

const articleSections = [
  {
    id: "server-setup",
    title: "Server Setup",
    description: "Invite ARON, keep permissions available, and use the existing verification flow when player commands require it.",
    callout: "Invite, support, vote, and dashboard links stay controlled by the existing website config and bot environment.",
    examples: ["/register", "/verify", "/prefix set !"]
  },
  {
    id: "drops",
    title: "Drops",
    description: "Drops happen in Discord. Cooldowns, claim windows, channel restrictions, and registrations remain bot-owned.",
    examples: ["/drop", "/claim", "/cooldown"]
  },
  {
    id: "cards",
    title: "Cards",
    description: "Cards store base identity and battle stats. Owned copies keep edition, variant, cosmetics, source, code, and owner compatibility.",
    examples: ["/cards naruto", "/cardinfo", "/card stats ABC123"]
  },
  {
    id: "card-stats",
    title: "Card Stats",
    description: "Card stat panels show HP, ATK, DEF, SPD, Special, element, level, XP, and the generated moveset used by decks and guild raids.",
    callout: "Stats views are read-only. Public views follow the same visibility rules as collection cards, while owned commands require the copy to be in your inventory.",
    examples: ["/card stats ABC123", "/view ABC123 stats", "/deck stats"]
  },
  {
    id: "cosmetics",
    title: "Cosmetics",
    description: "Card copies can equip frame, background, glow, and morph cosmetics. Banners are profile-only and never apply to copies.",
    callout: "Purchases should validate before charging. The website only displays data and does not write cosmetic state.",
    examples: ["/cosmeticshop", "/useglow ABC123 glow_purple", "/usebanner banner_neon"]
  },
  {
    id: "tagging",
    title: "Tagging",
    description: "Tags help players organize card copies for personal lookup, trading, and themed collections.",
    examples: ["/stag favorite ABC123", "/tagview favorite", "/tagremove favorite ABC123"]
  },
  {
    id: "guilds",
    title: "Guilds",
    description: "Guilds are stored separately and linked from a user profile. Website public views only read shaped guild data.",
    examples: ["/guild create", "/guild join", "/guild leaderboard"]
  },
  {
    id: "raids",
    title: "Guild Raid",
    description: "Raid attacks require a valid user deck with owned copies, valid base cards, and explicit card stats.",
    callout: "Raid rewards grant raid-only currencies plus configured cosmetics or badges. They must not grant permanent Coins, Gems, Aero, or legacy Shards.",
    examples: ["/deck", "/guildraid panel", "/guildraid attack"]
  },
  {
    id: "events",
    title: "Events",
    description: "Events are code-owned definitions with runtime activation state in Firebase metadata and per-user event progress.",
    examples: ["/event", "/event shop", "/event quests"]
  },
  {
    id: "albums",
    title: "Albums",
    description: "Albums can include up to 30 owned copy codes, can be public or private, and may use an owned background cosmetic.",
    examples: ["/album create favorites", "/album add favorites ABC123", "/album view favorites"]
  },
  {
    id: "profile",
    title: "Profile",
    description: "Profiles support bio, nullable banner, nullable favorite card, and equipped badges. A maximum of five badges can be displayed.",
    examples: ["/profile", "/setbio", "/favoritecard ABC123"]
  },
  {
    id: "user-status",
    title: "User Status",
    description: "Status views combine public profile data, cooldowns, wallet mirrors, quests, achievements, guild, and verification state.",
    examples: ["/wallet", "/cooldown", "/profile"]
  },
  {
    id: "quests",
    title: "Tasks & Quests",
    description: "Quest and event progress should be normalized before commands depend on fields, so old accounts stay safe.",
    examples: ["/quest", "/event quests"]
  },
  {
    id: "achievements",
    title: "Achievements",
    description: "Achievements store progress under the user record. Owned badges stay separate from equipped profile badges.",
    examples: ["/achievements", "/claimachievement", "/equipbadge"]
  },
  {
    id: "vote",
    title: "Vote",
    description: "Vote rewards and cooldowns use existing bot configuration. If public links are not exposed, players should use the Discord vote command.",
    examples: ["/vote", "/recordvote"]
  }
];

const toc = [
  ["welcome", "Welcome to ARON Guide"],
  ["commands", "Command Reference"],
  ["cards", "Cards"],
  ["card-stats", "Card Stats"],
  ["cosmetics", "Cosmetics"],
  ["guilds", "Guilds"],
  ["raids", "Guild Raid"],
  ["events", "Events"],
  ["albums", "Albums"],
  ["verification", "Verification"]
];

export default function Guide() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("welcome");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("docs-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const id = window.location.hash.match(/#\/guide#([a-z0-9-]+)$/)?.[1];
    if (!id) return;
    setActive(id);
    window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, []);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return [
      ...articleCards.map(([title, description, Icon, id]) => ({ title, description, Icon, id, type: "Guide" })),
      ...commandBlocks.flatMap((block) => block.commands.map(([command, description]) => ({ title: command, description, Icon: block.icon, id: "commands", type: block.title })))
    ].filter((item) => `${item.title} ${item.description} ${item.type}`.toLowerCase().includes(normalized)).slice(0, 8);
  }, [query]);

  function jumpTo(id) {
    setActive(id);
    setSidebarOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/guide#${id}`);
  }

  return (
    <DocsLayout
      sidebar={<DocsSidebar active={active} onJump={jumpTo} />}
      toc={<OnPageToc active={active} onJump={jumpTo} />}
    >
      <DocsSidebar active={active} onJump={jumpTo} open={sidebarOpen} onClose={() => setSidebarOpen(false)} mobileOnly />
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-black text-white/72" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-4 w-4 text-cyan" />
          Guide menu
        </button>
        <Link to="/" className="text-sm font-black text-white/52 hover:text-white">Home</Link>
      </div>

      <DocsSearch query={query} setQuery={setQuery} results={searchResults} onJump={jumpTo} />

      <DocsArticle>
        <Breadcrumbs items={["Guide", "Welcome"]} />
        <section id="welcome" className="docs-prose scroll-mt-28">
          <div className="rounded-[2rem] border border-white/10 bg-panel/78 p-6 shadow-card sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan/28 bg-cyan/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan">Welcome</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white/44">ARON Guide</span>
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">Welcome to ARON Guide</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-silver/74">
              ARON is an anime card Discord bot where players collect, trade, customize, build decks, join guilds, fight raids, and progress through seasonal events.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => copyMarkdown()} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-black text-white/72 hover:text-white">
                <Clipboard className="h-4 w-4 text-cyan" />
                Copy Markdown
              </button>
              <Link to="/events" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-black text-white/72 hover:text-white">
                <LinkIcon className="h-4 w-4 text-cyan" />
                Open Events
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-2">
          {articleCards.map(([title, description, Icon, id]) => (
            <DocsCard key={title} title={title} description={description} icon={Icon} onClick={() => jumpTo(id)} />
          ))}
        </section>

        <section id="commands" className="mt-8 scroll-mt-28 rounded-[2rem] border border-white/10 bg-panel/78 p-6 shadow-card sm:p-8">
          <ArticleHeading eyebrow="General Commands" title="Command Reference" />
          <div className="mt-6 grid gap-4">
            {commandBlocks.map((block) => {
              const Icon = block.icon;
              return (
                <article key={block.title} className="rounded-3xl border border-white/10 bg-black/22 p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan/20 bg-cyan/10">
                      <Icon className="h-5 w-5 text-cyan" />
                    </span>
                    <h2 className="text-2xl font-black">{block.title}</h2>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {block.commands.map(([command, description]) => (
                      <CommandExample key={command} command={command} description={description} />
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-panel/78 p-6 shadow-card sm:p-8">
          <ArticleHeading eyebrow="Systems" title="Core Mechanics" />
          <div className="mt-6 grid gap-8">
            {articleSections.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-28 border-t border-white/10 pt-7 first:border-t-0 first:pt-0">
                <h2 className="text-3xl font-black">{section.title}</h2>
                <p className="mt-3 leading-8 text-silver/72">{section.description}</p>
                {section.callout ? <DocsCallout>{section.callout}</DocsCallout> : null}
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {section.examples.map((example) => <CommandExample key={example} command={example} compact />)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="verification" className="mt-8 scroll-mt-28 rounded-[2rem] border border-white/10 bg-panel/78 p-6 shadow-card sm:p-8">
          <ArticleHeading eyebrow="Safety" title="Verification" />
          <p className="mt-3 leading-8 text-silver/72">
            Verification keeps using ARON's existing backend token, fingerprint, Discord OAuth, callback, session, and result APIs. The website guide only links to the flow.
          </p>
          <Link to="/verify" className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan/28 bg-cyan/10 px-4 py-2 text-sm font-black text-cyan hover:bg-cyan/15">
            Open verification
            <ChevronRight className="h-4 w-4" />
          </Link>
        </section>

        <PrevNextLinks />
      </DocsArticle>
    </DocsLayout>
  );
}

function DocsLayout({ sidebar, toc, children }) {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[270px_minmax(0,1fr)_230px]">
      <aside className="hidden lg:block">{sidebar}</aside>
      <main className="min-w-0">{children}</main>
      <aside className="hidden xl:block">{toc}</aside>
    </div>
  );
}

function DocsSidebar({ active, onJump, open = false, onClose, mobileOnly = false }) {
  const content = (
    <div className="h-full rounded-[1.5rem] border border-white/10 bg-panel/90 p-3 shadow-card backdrop-blur-xl">
      <div className="flex items-center justify-between px-3 py-2">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-2xl border border-violet/35 bg-violet/12">
            <Sparkles className="h-4 w-4 text-cyan" />
          </span>
          <span className="font-black">ARON Guide</span>
        </Link>
        {onClose ? <button className="lg:hidden" onClick={onClose} aria-label="Close guide menu"><X className="h-5 w-5" /></button> : null}
      </div>
      <nav className="mt-3 grid gap-4 overflow-y-auto pr-1 lg:max-h-[calc(100vh-150px)]">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3 text-[11px] font-black uppercase tracking-[0.18em] text-cyan/70">{group.title}</div>
            <div className="mt-2 grid gap-1">
              {group.items.map((item) => (
                <button
                  key={`${item.id}-${item.label}`}
                  onClick={() => onJump(item.id)}
                  className={`rounded-xl px-3 py-2 text-left text-sm font-bold transition hover:bg-white/[0.06] hover:text-white ${active === item.id ? "bg-white/10 text-white" : "text-white/54"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  if (mobileOnly) {
    return open ? (
      <div className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm lg:hidden">
        {content}
      </div>
    ) : null;
  }

  return (
    <>
      <div className="sticky top-24">{content}</div>
    </>
  );
}

function DocsSearch({ query, setQuery, results, onJump }) {
  return (
    <section className="sticky top-[73px] z-20 mb-5 rounded-[1.5rem] border border-white/10 bg-ink/88 p-3 shadow-card backdrop-blur-2xl">
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-cyan" />
        <span className="sr-only">Search guide</span>
        <input
          id="docs-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/36"
          placeholder="Search ARON guide..."
        />
        <kbd className="hidden rounded-md border border-white/10 bg-black/24 px-2 py-1 text-[10px] font-black text-white/42 sm:block">Ctrl K</kbd>
      </label>
      {query ? (
        <div className="mt-3 grid gap-2">
          {results.map((result) => {
            const Icon = result.Icon;
            return (
              <button key={`${result.type}-${result.title}`} onClick={() => onJump(result.id)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-cyan/24">
                <Icon className="h-5 w-5 shrink-0 text-cyan" />
                <span className="min-w-0">
                  <span className="block truncate font-black">{result.title}</span>
                  <span className="block truncate text-sm font-semibold text-white/50">{result.description}</span>
                </span>
              </button>
            );
          })}
          {!results.length ? <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-white/54">No guide entries matched.</div> : null}
        </div>
      ) : null}
    </section>
  );
}

function DocsArticle({ children }) {
  return <div className="min-w-0">{children}</div>;
}

function OnPageToc({ active, onJump }) {
  return (
    <div className="sticky top-24 rounded-[1.5rem] border border-white/10 bg-panel/82 p-4 shadow-card">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan">On this page</div>
      <nav className="mt-4 grid gap-3 text-sm font-bold text-white/54">
        {toc.map(([id, label]) => (
          <button key={id} onClick={() => onJump(id)} className={`text-left transition hover:text-white ${active === id ? "text-white" : ""}`}>
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-6 rounded-2xl border border-cyan/18 bg-cyan/[0.08] p-4">
        <Vote className="h-5 w-5 text-cyan" />
        <p className="mt-3 text-sm leading-6 text-white/58">Vote and invite URLs remain controlled by ARON config.</p>
      </div>
    </div>
  );
}

function Breadcrumbs({ items }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-white/42">
      {items.map((item, index) => (
        <span key={item} className="inline-flex items-center gap-2">
          {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
          {item}
        </span>
      ))}
    </div>
  );
}

function DocsCard({ title, description, icon: Icon, onClick }) {
  return (
    <button onClick={onClick} className="data-card rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-left">
      <Icon className="h-6 w-6 text-cyan" />
      <h2 className="mt-4 text-2xl font-black">{title}</h2>
      <p className="mt-2 leading-7 text-white/60">{description}</p>
    </button>
  );
}

function DocsCallout({ children }) {
  return (
    <div className="mt-4 rounded-2xl border border-cyan/18 bg-cyan/[0.08] p-4 text-sm font-semibold leading-6 text-silver/78">
      {children}
    </div>
  );
}

function CommandExample({ command, description, compact = false }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
      <div className="font-mono text-sm font-black text-cyan">{command}</div>
      {!compact && description ? <p className="mt-3 text-sm font-semibold leading-6 text-white/58">{description}</p> : null}
    </div>
  );
}

function PrevNextLinks() {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      <Link to="/" className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 font-black text-white/72 hover:text-white">
        <ArrowLeft className="mb-4 h-5 w-5 text-cyan" />
        Marketing home
      </Link>
      <Link to="/events" className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-right font-black text-white/72 hover:text-white">
        <ArrowRight className="mb-4 ml-auto h-5 w-5 text-cyan" />
        Event archive
      </Link>
    </div>
  );
}

function ArticleHeading({ eyebrow, title }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">{eyebrow}</div>
      <h2 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h2>
    </div>
  );
}

function copyMarkdown() {
  const text = "# Welcome to ARON Guide\n\nARON is an anime card Discord bot for collecting, cosmetics, guild raids, albums, profiles, achievements, and events.";
  navigator.clipboard?.writeText(text).catch(() => null);
}
