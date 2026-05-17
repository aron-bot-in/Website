import { Bot, ExternalLink, LogIn, LogOut, Menu, MessageCircle, Search, ShieldCheck, Sparkles, UserRound, Vote, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Button from "./Button.jsx";
import { useAuthStore } from "../store/authStore.js";

const nav = [
  ["Home", "/"],
  ["Guide", "/guide"],
  ["Events", "/events"],
  ["Vote", "/guide#vote"],
  ["Support", "/support"]
];

function navClass({ isActive }) {
  return `rounded-full px-3.5 py-2 text-sm font-black transition ${isActive ? "bg-white/12 text-white shadow-[0_0_24px_rgba(157,101,255,0.16)]" : "text-white/62 hover:bg-white/[0.07] hover:text-white"}`;
}

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { identity, user, login, logout, loading, error } = useAuthStore();
  const isDocs = location.pathname === "/guide";

  return (
    <div className="min-h-screen overflow-hidden bg-ink text-white">
      <div className="site-grid pointer-events-none fixed inset-0" />
      <div className="aurora-field pointer-events-none fixed inset-0" />
      <div className="particle-field pointer-events-none fixed inset-0" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/72 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-violet/45 bg-gradient-to-br from-violet/28 via-cyan/18 to-rose/16 shadow-[0_0_32px_rgba(157,101,255,0.22)]">
              <Bot className="h-5 w-5 text-cyan" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-white/30 bg-cyan shadow-[0_0_16px_rgba(64,230,255,0.8)]" />
            </span>
            <span className="min-w-0">
              <span className="block text-xl font-black leading-tight">ARON</span>
              <span className="block truncate text-[11px] font-bold uppercase tracking-[0.22em] text-cyan/70">Anime card bot</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:flex">
            {nav.map(([label, path]) => <NavLink key={path} to={path} className={navClass}>{label}</NavLink>)}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link to="/guide" className="flex min-w-[190px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-bold text-white/50 transition hover:border-cyan/24 hover:text-white">
              <Search className="h-4 w-4 text-cyan" />
              <span className="flex-1">Search docs</span>
              <kbd className="rounded-md border border-white/10 bg-black/24 px-1.5 py-0.5 text-[10px] text-white/42">Ctrl K</kbd>
            </Link>
            <Link to="/invite"><Button variant="ghost" icon={Bot}>Invite</Button></Link>
            {user ? (
              <>
                <Link to="/dashboard" className="flex max-w-52 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold shadow-[0_0_24px_rgba(64,230,255,0.07)]">
                  <UserRound className="h-4 w-4 text-cyan" />
                  <span className="truncate">{identity?.username || "Player"}</span>
                </Link>
                <Button variant="ghost" onClick={logout} icon={LogOut}>Logout</Button>
              </>
            ) : (
              <>
                {error ? <span className="max-w-56 text-right text-xs font-bold text-rose">{error}</span> : null}
                <Link to="/verify"><Button variant="ghost" icon={ShieldCheck}>Verify</Button></Link>
                <Button onClick={login} icon={LogIn}>{loading ? "Loading" : "Login"}</Button>
              </>
            )}
          </div>

          <button className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-white/10 bg-ink/88 px-4 py-3 backdrop-blur-2xl lg:hidden">
            <div className="grid gap-2">
              {nav.map(([label, path]) => (
                <Link key={path} to={path} onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 font-black text-white/78">{label}</Link>
              ))}
              <Link to="/invite" onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 font-black text-white/78">Invite</Link>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 font-black text-white/78">Dashboard</Link>
              <Link to="/verify" onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 font-black text-white/78">Verify</Link>
              <Button onClick={user ? logout : login} icon={user ? LogOut : LogIn} variant={user ? "ghost" : "primary"}>{user ? "Logout" : loading ? "Loading" : "Login"}</Button>
              {error ? <div className="rounded-2xl border border-rose/30 bg-rose/10 px-3 py-2 text-sm text-rose">{error}</div> : null}
            </div>
          </div>
        ) : null}
      </header>

      <main className="relative z-10">{children}</main>

      <footer className={`relative z-10 overflow-hidden border-t border-white/10 bg-black/18 px-4 py-10 text-sm text-white/48 backdrop-blur ${isDocs ? "mt-0" : "mt-8"}`}>
        <div className="pointer-events-none absolute inset-x-0 bottom-[-1.2rem] select-none text-center text-[18vw] font-black tracking-normal ghost-wordmark">
          ARON
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl border border-violet/35 bg-violet/12">
                <Sparkles className="h-5 w-5 text-cyan" />
              </span>
              <div>
                <div className="font-black text-white">ARON</div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan/70">Anime cards, raids, cosmetics</div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 font-bold sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
            <Link to="/invite" className="inline-flex items-center gap-1 hover:text-white"><ExternalLink className="h-3.5 w-3.5" />Invite</Link>
            <Link to="/support" className="inline-flex items-center gap-1 hover:text-white"><MessageCircle className="h-3.5 w-3.5" />Support</Link>
            <Link to="/guide#vote" className="inline-flex items-center gap-1 hover:text-white"><Vote className="h-3.5 w-3.5" />Vote</Link>
            <Link to="/events" className="hover:text-white">Events</Link>
            <Link to="/verify" className="hover:text-white">Verify</Link>
            <Link to="/appeal" className="hover:text-white">Appeal</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
