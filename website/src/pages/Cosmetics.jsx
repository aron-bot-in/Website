import { Badge, Coins, Frame, Gem, Image, Lock, Palette, Search, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Chip, EmptyState, InventoryRow, Panel, StatRow } from "../components/AronUi.jsx";
import Page from "../components/Page.jsx";
import DataStatus from "../components/DataStatus.jsx";
import { fetchCosmeticShop } from "../lib/websiteApi.js";

const categories = [
  { id: "all", label: "Vault", text: "All live cosmetic listings", icon: Sparkles },
  { id: "frame", label: "Frames", text: "Borders for card-copy showcases", icon: Frame },
  { id: "background", label: "Backgrounds", text: "Profile scenes and card backdrops", icon: Image },
  { id: "glow", label: "Glows", text: "Card aura and super-glow styling", icon: WandSparkles },
  { id: "morph", label: "Versions", text: "Alternate card presentation styles", icon: Palette },
  { id: "banner", label: "Banners", text: "Profile identity cosmetics", icon: Badge }
];

const rarityTone = {
  common: "muted",
  rare: "cyan",
  epic: "violet",
  legendary: "gold",
  mythic: "rose"
};

function titleCase(value) {
  return String(value || "Cosmetic").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function priceLabel(item) {
  const price = Number(item.price ?? item.cost ?? item.amount ?? 0);
  const currency = String(item.currency || "coins");
  return price > 0 ? `${price.toLocaleString("en-US")} ${titleCase(currency)}` : "Reward";
}

export default function Cosmetics() {
  const [shop, setShop] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState({ source: "loading", label: "Loading vault" });

  useEffect(() => {
    let cancelled = false;
    fetchCosmeticShop().then((items) => {
      if (cancelled) return;
      setShop(items);
      setStatus(items.length ? { source: "live", label: "Shop data" } : { source: "unavailable", label: "Vault standby" });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return shop.filter((item) => {
      const matchesCategory = activeCategory === "all" || String(item.type || "").toLowerCase() === activeCategory;
      const haystack = [item.id, item.name, item.type, item.rarity, item.source, item.description].filter(Boolean).join(" ").toLowerCase();
      return matchesCategory && (!cleanQuery || haystack.includes(cleanQuery));
    });
  }, [activeCategory, query, shop]);

  const counts = categories.reduce((acc, category) => {
    acc[category.id] = category.id === "all" ? shop.length : shop.filter((item) => String(item.type || "").toLowerCase() === category.id).length;
    return acc;
  }, {});

  return (
    <Page>
      <section className="hero-shell mb-6 overflow-hidden rounded-lg border border-white/10 p-5 shadow-card sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan"><Sparkles className="mr-2 inline h-4 w-4" />Cosmetic Vault</div>
            <h1 className="mt-2 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Frames, glows, banners, and profile style in one read-only vault.</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/62">
              Browse ARON cosmetic categories and shop metadata without changing inventory, ownership, or equipped state.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <DataStatus status={status} />
              <Chip tone="green" icon={Lock}>Read only</Chip>
              <Link to="/guide#cosmetics"><Chip tone="cyan" icon={Search}>Guide</Chip></Link>
            </div>
          </div>
          <div className="rounded-lg border border-cyan/18 bg-black/24 p-4">
            <div className="aspect-[3/4] overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(134,240,240,0.18),rgba(143,0,242,0.16)_48%,rgba(240,143,176,0.14))] p-4">
              <div className="flex h-full flex-col justify-between rounded-md border border-white/12 bg-black/30 p-4">
                <Chip tone="gold">Legendary Frame</Chip>
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan">Preview Slot</div>
                  <div className="mt-1 text-2xl font-black">ARON Style Card</div>
                  <div className="mt-3 grid gap-2 text-sm font-bold text-white/58">
                    <span>Glow channel ready</span>
                    <span>Profile banner safe</span>
                    <span>No state mutation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Panel eyebrow="Categories" title="Browse by cosmetic slot" description="These categories mirror the bot command structure: card cosmetics stay separate from profile cosmetics.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map(({ id, label, text, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveCategory(id)}
              className={`rounded-lg border p-4 text-left transition ${activeCategory === id ? "border-cyan/34 bg-cyan/[0.09]" : "border-white/10 bg-white/[0.035] hover:border-cyan/22"}`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-black/24">
                  <Icon className="h-5 w-5 text-cyan" />
                </span>
                <Chip tone={counts[id] ? "cyan" : "muted"}>{counts[id]} listed</Chip>
              </span>
              <span className="mt-4 block text-xl font-black text-white">{label}</span>
              <span className="mt-1 block text-sm font-semibold leading-6 text-white/54">{text}</span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel
        className="mt-6"
        eyebrow="Inventory-style list"
        title={categories.find((category) => category.id === activeCategory)?.label || "Vault"}
        description="Rarity, slot, and price are display-only. Applying and ownership checks remain inside the Discord bot."
        action={(
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-black/24 px-3">
            <Search className="h-4 w-4 shrink-0 text-cyan" />
            <span className="sr-only">Search cosmetics</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vault"
              className="w-40 bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/38"
            />
          </label>
        )}
      >
        <div className="grid gap-3">
          {filtered.slice(0, 24).map((item) => {
            const type = String(item.type || "cosmetic").toLowerCase();
            const rarity = String(item.rarity || "common").toLowerCase();
            const Icon = categories.find((category) => category.id === type)?.icon || Sparkles;
            return (
              <InventoryRow
                key={item.id || item.name}
                icon={Icon}
                title={item.name || item.id || "Unnamed cosmetic"}
                subtitle={`${titleCase(type)} | ${item.description || item.source || "ARON cosmetic"}`}
                amount={priceLabel(item)}
                chips={[
                  { label: titleCase(rarity), tone: rarityTone[rarity] || "muted" },
                  { label: item.limited || item.eventId ? "Limited" : "Standard", tone: item.limited || item.eventId ? "rose" : "muted" },
                  { label: item.disabled ? "Disabled" : "Available", tone: item.disabled ? "muted" : "green" }
                ]}
              />
            );
          })}
          {!filtered.length ? (
            <EmptyState icon={Sparkles} title="Your cosmetic vault view is quiet.">
              {shop.length ? "No cosmetics matched that category or search. Try a broader vault search." : "No cosmetic shop data is exposed right now, so ARON is showing the safe read-only shell."}
            </EmptyState>
          ) : null}
        </div>
      </Panel>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <StatRow icon={Gem} label="Listed cosmetics" value={shop.length} meta="from existing API" />
        <StatRow icon={Badge} label="Visible categories" value={categories.length - 1} meta="card and profile slots" />
        <StatRow icon={Coins} label="Economy safety" value="Read-only" meta="no purchase or balance write" />
      </section>
    </Page>
  );
}
