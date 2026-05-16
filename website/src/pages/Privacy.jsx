import Page from "../components/Page.jsx";

export default function Privacy() {
  return (
    <Page className="max-w-4xl">
      <article className="rounded-lg border border-white/10 bg-panel/80 p-6">
        <h1 className="text-4xl font-black">Privacy Policy</h1>
        <div className="mt-6 space-y-5 leading-8 text-white/64">
          <p>Aron uses Discord OAuth2, browser fingerprinting, hashed IP checks, and verification behavior to prevent alternate-account abuse.</p>
          <p>Verification continues to run through the existing backend API. The website reads public Firebase summaries and does not directly write bot data from the browser.</p>
          <p>Staff may review verification results, approve accounts, quarantine accounts, and remove quarantine after appeals.</p>
        </div>
      </article>
    </Page>
  );
}
