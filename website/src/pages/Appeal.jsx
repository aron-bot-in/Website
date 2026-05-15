import { Gavel } from "lucide-react";
import Page from "../components/Page.jsx";

export default function Appeal() {
  return (
    <Page>
      <div className="glass mx-auto max-w-2xl rounded-lg p-8">
        <Gavel className="h-10 w-10 text-cyan" />
        <h1 className="mt-4 text-3xl font-black">Appeal Review</h1>
        <p className="mt-3 text-white/62">
          Open a support ticket with your Discord ID and a short explanation. Staff can approve, quarantine, or remove quarantine from the admin panel.
        </p>
      </div>
    </Page>
  );
}
