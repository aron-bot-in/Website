import Page from "../components/Page.jsx";

export default function Privacy() {
  return (
    <Page className="max-w-4xl">
      <h1 className="text-4xl font-black">Privacy Policy</h1>
      <div className="mt-6 space-y-5 text-white/64">
        <p>Aron uses Discord OAuth2, browser fingerprinting, hashed IP analysis, and verification behavior to prevent alt farming and economy abuse.</p>
        <p>Raw IP addresses are used transiently for proxy checks and are stored only as SHA-256 hashes with a private server salt. Browser fingerprints are also hashed before reputation checks are stored.</p>
        <p>Verification records may include Discord ID, username, avatar, account creation date, risk score, reasons, attempt time, hashed IP, hashed fingerprint, and VPN/proxy detection results.</p>
        <p>Staff can review verification results, approve accounts, quarantine accounts, and remove quarantine when an appeal is accepted.</p>
      </div>
    </Page>
  );
}
