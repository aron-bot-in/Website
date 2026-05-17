import Page from "../components/Page.jsx";

export default function Terms() {
  return (
    <Page className="max-w-4xl">
      <article className="rounded-lg border border-white/10 bg-panel/80 p-6">
        <h1 className="text-4xl font-black">Terms of Service</h1>
        <div className="mt-6 space-y-5 leading-8 text-white/64">
          <p>Using Aron means agreeing not to automate, farm, sell, or manipulate the economy with alternate accounts.</p>
          <p>Verification can flag, quarantine, or block accounts based on account age, repeated fingerprints, hashed IP reputation, proxy signals, and review history.</p>
          <p>The Discord bot and staff decisions remain the source of truth for gameplay state and account restrictions.</p>
        </div>
      </article>
    </Page>
  );
}
