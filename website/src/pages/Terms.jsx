import Page from "../components/Page.jsx";

export default function Terms() {
  return (
    <Page className="max-w-4xl">
      <h1 className="text-4xl font-black">Terms of Service</h1>
      <div className="mt-6 space-y-5 text-white/64">
        <p>Using Aron means agreeing not to automate, farm, sell, or manipulate the economy with alternate accounts.</p>
        <p>The anti-alt system may verify, flag, quarantine, or block accounts based on Discord account age, repeated fingerprints, hashed IP reputation, proxy signals, and verification behavior.</p>
        <p>Quarantine limits economy-sensitive features while staff review risk signals. Staff decisions may override automated results when evidence supports it.</p>
      </div>
    </Page>
  );
}
