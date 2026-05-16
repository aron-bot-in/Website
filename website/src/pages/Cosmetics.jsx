import { Badge, Frame, Image, Sparkles } from "lucide-react";
import Page from "../components/Page.jsx";

const categories = [
  ["Frames", "Display-only preview area for future card borders.", Frame],
  ["Backgrounds", "Profile scenes and collection backdrops.", Image],
  ["Badges", "Small status marks for milestones and events.", Badge]
];

export default function Cosmetics() {
  return (
    <Page>
      <section className="mb-7">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan"><Sparkles className="mr-2 inline h-4 w-4" />Cosmetics</div>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">Display previews</h1>
        <p className="mt-3 max-w-2xl text-white/62">This page is read-only. It does not write cosmetics or player state.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {categories.map(([title, text, Icon]) => (
          <article key={title} className="rounded-lg border border-white/10 bg-panel/80 p-5">
            <div className="grid aspect-[16/10] place-items-center rounded-md border border-white/10 bg-white/[0.04]">
              <Icon className="h-10 w-10 text-cyan" />
            </div>
            <h2 className="mt-4 text-2xl font-black">{title}</h2>
            <p className="mt-2 text-white/60">{text}</p>
          </article>
        ))}
      </div>
    </Page>
  );
}
