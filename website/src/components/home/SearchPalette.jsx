import { BookOpen, Command, CreditCard, Search, Sparkles, Users, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const typeIcons = {
  Command,
  Card: CreditCard,
  Guide: BookOpen,
  Guild: Users,
  Cosmetic: Sparkles
};

export default function SearchPalette({ items }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    return items
      .map((item) => {
        const haystack = [
          item.type,
          item.title,
          item.description,
          ...(item.keywords || [])
        ].join(" ").toLowerCase();
        const title = String(item.title || "").toLowerCase();
        const score = title.startsWith(needle) ? 3 : title.includes(needle) ? 2 : haystack.includes(needle) ? 1 : 0;
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, 7);
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
    setOpen(Boolean(query.trim()));
  }, [query]);

  useEffect(() => {
    const focusSearch = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const selectResult = (item) => {
    if (!item?.link) return;
    setOpen(false);
    setQuery("");
    navigate(item.link);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!open || !results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((value) => (value + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((value) => (value - 1 + results.length) % results.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      selectResult(results[activeIndex]);
    }
  };

  return (
    <div className="relative max-w-2xl">
      <label className="sr-only" htmlFor="home-search">Search ARON commands, cards, guides, and guilds</label>
      <div className="command-pill flex min-h-14 items-center gap-3 rounded-lg border border-cyan/18 bg-black/32 px-4 text-white/70 shadow-card transition focus-within:border-cyan/44">
        <Search className="h-5 w-5 shrink-0 text-cyan" />
        <input
          ref={inputRef}
          id="home-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(Boolean(query.trim()))}
          onKeyDown={handleKeyDown}
          placeholder="Search commands, cards, guide pages, guilds..."
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/38 sm:text-base"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-white/52 transition hover:text-white"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <span className="hidden rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-black text-white/40 sm:block">Ctrl K</span>
        )}
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.55rem)] z-30 overflow-hidden rounded-lg border border-white/10 bg-panel/95 shadow-card backdrop-blur-xl">
          {results.length ? (
            <div className="max-h-96 overflow-y-auto p-2">
              {results.map((item, index) => {
                const Icon = typeIcons[item.type] || Search;
                return (
                  <button
                    key={`${item.type}-${item.title}`}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectResult(item)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition ${activeIndex === index ? "bg-cyan/12" : "hover:bg-white/[0.06]"}`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.05]">
                      <Icon className="h-5 w-5 text-cyan" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-white">{item.title}</span>
                        <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/46">{item.type}</span>
                      </span>
                      <span className="mt-1 block truncate text-sm font-semibold text-white/52">{item.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-5 text-sm font-bold text-white/52">No ARON results found yet.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
