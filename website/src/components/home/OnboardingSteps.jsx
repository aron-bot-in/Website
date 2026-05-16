import { Bot, BookOpen, Gift, HeartHandshake, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../Button.jsx";

export default function OnboardingSteps({ inviteHref, supportHref }) {
  return (
    <section className="mt-14 rounded-lg border border-white/10 bg-panel/82 p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan">Start Collecting</div>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Start collecting in 3 steps</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Action href={inviteHref} icon={Bot}>Invite Bot</Action>
          <Link to="/guide"><Button icon={BookOpen} variant="ghost" className="w-full sm:w-auto">Read Guide</Button></Link>
          <Action href={supportHref} icon={Users} variant="ghost">Join Support Server</Action>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Step number="1" icon={Bot} title="Invite ARON" text="Add the bot to a server where your collectors already hang out." />
        <Step number="2" icon={Gift} title="Use /drop or /start" text="Begin in Discord and let ARON create the first claim moments." />
        <Step number="3" icon={HeartHandshake} title="Collect, wishlist, trade" text="Build a collection, join a guild, and flex the cards that matter." />
      </div>
    </section>
  );
}

function Action({ href, children, icon, variant = "primary" }) {
  const isExternal = /^https?:\/\//i.test(String(href || ""));
  const content = <Button icon={icon} variant={variant} className="w-full sm:w-auto">{children}</Button>;

  return isExternal
    ? <a href={href} target="_blank" rel="noreferrer">{content}</a>
    : <Link to={href}>{content}</Link>;
}

function Step({ number, icon: Icon, title, text }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-cyan/24 bg-cyan/10 text-lg font-black text-cyan">{number}</span>
        <Icon className="h-6 w-6 text-violet" />
      </div>
      <h3 className="mt-5 text-2xl font-black">{title}</h3>
      <p className="mt-2 leading-7 text-white/58">{text}</p>
    </article>
  );
}
