import { Gavel } from "lucide-react";
import Page from "../components/Page.jsx";

export default function Appeal() {
  return (
    <Page>
      <section className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-panel/80 p-8 shadow-card">
        <Gavel className="h-10 w-10 text-cyan" />
        <h1 className="mt-4 text-3xl font-black">Appeal review</h1>
        <p className="mt-3 leading-7 text-white/62">Open a support ticket with your Discord ID and a short explanation. Staff review remains outside the public website.</p>
      </section>
    </Page>
  );
}
