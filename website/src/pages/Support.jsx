import { ExternalLink, MessageCircle } from "lucide-react";
import Button from "../components/Button.jsx";
import Page from "../components/Page.jsx";

export default function Support() {
  return (
    <Page>
      <section className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-panel/80 p-8 text-center shadow-card">
        <MessageCircle className="mx-auto h-12 w-12 text-cyan" />
        <h1 className="mt-5 text-4xl font-black">Support server</h1>
        <p className="mt-3 text-white/62">Use the support server for account help, verification issues, bug reports, and announcements.</p>
        <a href={import.meta.env.VITE_SUPPORT_SERVER_URL || "#"}><Button className="mt-6" icon={ExternalLink}>Open Support</Button></a>
      </section>
    </Page>
  );
}
