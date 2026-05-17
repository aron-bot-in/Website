import { Bot, ExternalLink } from "lucide-react";
import Button from "../components/Button.jsx";
import Page from "../components/Page.jsx";

export default function Invite() {
  return (
    <Page>
      <Action title="Invite Aron" text="Add the bot with the bot and applications.commands scopes so commands can appear in your server." href={import.meta.env.VITE_DISCORD_INVITE_URL || "#"} label="Open Discord Invite" />
    </Page>
  );
}

function Action({ title, text, href, label }) {
  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-panel/80 p-8 text-center shadow-card">
      <Bot className="mx-auto h-12 w-12 text-cyan" />
      <h1 className="mt-5 text-4xl font-black">{title}</h1>
      <p className="mt-3 text-white/62">{text}</p>
      <a href={href}><Button className="mt-6" icon={ExternalLink}>{label}</Button></a>
    </section>
  );
}
