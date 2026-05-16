export const showcaseCards = [
  {
    id: "aiko",
    name: "Aiko Shimizu",
    initials: "AS",
    series: "Moonlit Academy",
    tier: "Mythic",
    edition: "E01 #007",
    wishlist: 1284,
    status: "Claimed by Mira",
    tone: "rose"
  },
  {
    id: "ren",
    name: "Ren Kazama",
    initials: "RK",
    series: "Neon Ronin",
    tier: "Legendary",
    edition: "E02 #041",
    wishlist: 943,
    status: "Trade open",
    tone: "cyan"
  },
  {
    id: "yuna",
    name: "Yuna Arclight",
    initials: "YA",
    series: "Starlit Pact",
    tier: "Epic",
    edition: "E01 #116",
    wishlist: 617,
    status: "Unclaimed",
    tone: "violet"
  },
  {
    id: "kael",
    name: "Kael Vesper",
    initials: "KV",
    series: "Aether Circuit",
    tier: "Rare",
    edition: "E03 #202",
    wishlist: 388,
    status: "Owned by Nova",
    tone: "gold"
  }
];

export const featureTiles = [
  { title: "Cards", icon: "cards", description: "Browse characters, series, tiers, copies, and demand.", link: "/guide#cards" },
  { title: "Drops", icon: "drops", description: "Claim fresh cards from Discord drop windows.", link: "/guide#drops" },
  { title: "Wishlist", icon: "wishlist", description: "Mark favorites and track what the server wants most.", link: "/guide#wishlist" },
  { title: "Trading", icon: "trading", description: "Swap copies through ARON's bot-confirmed trade flow.", link: "/guide#trading" },
  { title: "Guilds", icon: "guilds", description: "Join squads, compare progress, and climb together.", link: "/guide#guilds" },
  { title: "Events", icon: "events", description: "Chase seasonal rewards and limited cards.", link: "/guide#events" },
  { title: "Profiles", icon: "profiles", description: "Show inventory, wishlist, cooldowns, and progress.", link: "/dashboard" },
  { title: "Cosmetics", icon: "cosmetics", description: "Preview frames, backgrounds, badges, and flair.", link: "/cosmetics" }
];

export const guildLeaderboard = [
  { rank: 1, name: "Celestial Vault", members: 482, cards: 18420, score: "+18.4%", badge: "Event Kings" },
  { rank: 2, name: "Neon Shrine", members: 367, cards: 14105, score: "+14.1%", badge: "Trade Rush" },
  { rank: 3, name: "Aether Union", members: 298, cards: 11270, score: "+11.8%", badge: "Wishlist Heat" },
  { rank: 4, name: "Moon Drop Club", members: 226, cards: 9044, score: "+9.6%", badge: "New Season" }
];

export const homeSearchItems = [
  { type: "Command", title: "/drop", description: "Start a card drop in Discord.", link: "/guide#drops", keywords: ["claim", "spawn", "card"] },
  { type: "Command", title: "/wishlist", description: "Add, remove, or view wanted cards.", link: "/guide#wishlist", keywords: ["wl", "heart", "demand"] },
  { type: "Command", title: "/trade", description: "Open a player-to-player trade flow.", link: "/guide#trading", keywords: ["swap", "exchange"] },
  { type: "Command", title: "/profile", description: "View a collector profile and progress.", link: "/dashboard", keywords: ["player", "stats"] },
  { type: "Card", title: "Aiko Shimizu", description: "Mythic card from Moonlit Academy.", link: "/guide#cards", keywords: ["mythic", "moonlit"] },
  { type: "Card", title: "Ren Kazama", description: "Legendary card from Neon Ronin.", link: "/guide#cards", keywords: ["legendary", "ronin"] },
  { type: "Guide", title: "Getting Started", description: "Invite ARON and begin collecting.", link: "/guide#getting-started", keywords: ["start", "invite"] },
  { type: "Guide", title: "Verification", description: "Connect your Discord account safely.", link: "/verify", keywords: ["account", "login"] },
  { type: "Guild", title: "Celestial Vault", description: "Top guild with fast weekly growth.", link: "/guide#guilds", keywords: ["server", "leaderboard"] },
  { type: "Guild", title: "Neon Shrine", description: "Trading-focused collector guild.", link: "/guide#guilds", keywords: ["server", "trade"] },
  { type: "Cosmetic", title: "Aurum Frame", description: "A bright card frame preview.", link: "/cosmetics", keywords: ["frame", "gold"] }
];

export const cosmeticsPreview = [
  { name: "Aurum Frame", type: "Frame", state: "Unlocked", tone: "gold" },
  { name: "Night Market", type: "Background", state: "Unlocked", tone: "cyan" },
  { name: "Event Spark", type: "Badge", state: "Locked", tone: "rose" }
];

export const seasonalEvents = {
  active: {
    title: "Aether Bloom Season",
    timeRemaining: "12d 08h remaining",
    reward: "Bloom Crown Badge",
    limitedCards: 24,
    scoreLabel: "4.8K participants"
  },
  teasers: [
    { title: "Past: Neon Matsuri", detail: "Retired frames and city-night drops" },
    { title: "Upcoming: Lunar Vault", detail: "Guild milestone rewards opening soon" }
  ]
};

export const activityStats = [
  { label: "Daily commands", value: 48200, icon: "commands" },
  { label: "Cards claimed today", value: 7310, icon: "claimed" },
  { label: "Trades completed", value: 1284, icon: "trades" },
  { label: "Wishlist entries", value: 92800, icon: "wishlist" },
  { label: "Active guilds", value: 416, icon: "guilds" },
  { label: "Event participants", value: 4800, icon: "events" }
];
