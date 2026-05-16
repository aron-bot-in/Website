import { Bot, LogIn, LogOut, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Button from "./Button.jsx";
import { useAuthStore } from "../store/authStore.js";

const nav = [
  ["Dashboard", "/dashboard"],
  ["Collection", "/collection"],
  ["Wishlist", "/wishlist"],
  ["Guilds", "/guilds"],
  ["Guide", "/guide"],
  ["Verify", "/verify"]
];

function navClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-black transition ${isActive ? "bg-white/10 text-white" : "text-white/62 hover:bg-white/[0.06] hover:text-white"}`;
}

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const { identity, user, login, logout, loading, error } = useAuthStore();

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="site-grid pointer-events-none fixed inset-0" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan/35 bg-cyan/12">
              <Bot className="h-5 w-5 text-cyan" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-black leading-tight">ARON</span>
              <span className="block truncate text-[11px] font-bold uppercase tracking-[0.22em] text-white/44">Discord card index</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map(([label, path]) => <NavLink key={path} to={path} className={navClass}>{label}</NavLink>)}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                <Link to="/dashboard" className="flex max-w-52 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold">
                  <UserRound className="h-4 w-4 text-cyan" />
                  <span className="truncate">{identity?.username || "Player"}</span>
                </Link>
                <Button variant="ghost" onClick={logout} icon={LogOut}>Logout</Button>
              </>
            ) : (
              <>
                {error ? <span className="max-w-56 text-right text-xs font-bold text-rose">{error}</span> : null}
                <Button onClick={login} icon={LogIn}>{loading ? "Loading" : "Login"}</Button>
              </>
            )}
          </div>

          <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-white/10 px-4 py-3 lg:hidden">
            <div className="grid gap-2">
              {nav.map(([label, path]) => (
                <Link key={path} to={path} onClick={() => setOpen(false)} className="rounded-lg bg-white/[0.04] px-3 py-2 font-black text-white/78">{label}</Link>
              ))}
              <Button onClick={user ? logout : login} icon={user ? LogOut : LogIn} variant={user ? "ghost" : "primary"}>{user ? "Logout" : loading ? "Loading" : "Login"}</Button>
              {error ? <div className="rounded-lg border border-rose/30 bg-rose/10 px-3 py-2 text-sm text-rose">{error}</div> : null}
            </div>
          </div>
        ) : null}
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-white/10 px-4 py-8 text-center text-sm text-white/48">
        <ShieldCheck className="mx-auto mb-3 h-5 w-5 text-cyan" />
        Aron shows public bot data only. Verification stays handled by the existing secure backend.
      </footer>
    </div>
  );
}
