import { AlertTriangle, BadgeCheck, CheckCircle2, Clock3, Fingerprint, Gavel, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import Page from "../components/Page.jsx";
import { getVerificationResult, hasVerificationApi, startBackendVerification } from "../lib/verificationApi.js";

const statusCopy = {
  verified: {
    icon: CheckCircle2,
    tone: "text-emerald-300",
    title: "Verification complete",
    body: "Your Discord account passed the anti-alt review. Aron will unlock verified systems automatically."
  },
  flagged: {
    icon: AlertTriangle,
    tone: "text-amber-300",
    title: "Verified with review",
    body: "Your account is usable, but staff may review the risk signals before raising your trust level."
  },
  quarantined: {
    icon: LockKeyhole,
    tone: "text-rose",
    title: "Account quarantined",
    body: "Economy-sensitive systems are locked until staff review your appeal."
  },
  failed: {
    icon: AlertTriangle,
    tone: "text-rose",
    title: "Verification failed",
    body: "The Discord OAuth flow did not complete. Request a fresh verification link in Discord and try again."
  }
};

function Signal({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <Icon className="mb-3 h-5 w-5 text-cyan" />
      <div className="text-sm font-bold text-white">{label}</div>
      <div className="mt-1 text-xs text-white/50">{value}</div>
    </div>
  );
}

function ResultView({ attemptId, statusParam }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!attemptId || attemptId === "failed") {
      setError("Verification did not complete.");
      return;
    }
    getVerificationResult(attemptId).then(setResult).catch((err) => setError(err.message));
  }, [attemptId]);

  const status = result?.status || statusParam || "failed";
  const copy = statusCopy[status] || statusCopy.failed;
  const Icon = copy.icon;

  return (
    <div className="glass mx-auto max-w-3xl rounded-lg p-8 text-center">
      <Icon className={`mx-auto h-14 w-14 ${copy.tone}`} />
      <h1 className="mt-5 text-3xl font-black">{copy.title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-white/62">{error || copy.body}</p>
      {result ? (
        <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
          <Signal icon={BadgeCheck} label="Status" value={result.status.toUpperCase()} />
          <Signal icon={ShieldCheck} label="Risk score" value={`${result.riskScore} points`} />
          <Signal icon={Clock3} label="Account created" value={result.accountCreatedAt ? new Date(result.accountCreatedAt).toLocaleDateString() : "Unknown"} />
        </div>
      ) : null}
      {result?.reasons?.length ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4 text-left text-sm text-white/62">
          {result.reasons.join(", ")}
        </div>
      ) : null}
      {status === "quarantined" ? (
        <Link to="/appeal" className="mt-6 inline-flex">
          <Button icon={Gavel}>Open Appeal</Button>
        </Link>
      ) : null}
    </div>
  );
}

export default function Verify() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || params.get("t") || "", [params]);
  const attemptId = useMemo(() => params.get("attempt") || "", [params]);
  const status = useMemo(() => params.get("status") || "", [params]);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  async function begin() {
    if (!token) return;
    setRunning(true);
    setError("");
    try {
      const result = await startBackendVerification(token);
      window.location.assign(result.authorizeUrl);
    } catch (err) {
      setError(err.message || "Verification could not start.");
    } finally {
      setRunning(false);
    }
  }

  if (attemptId || status) {
    return (
      <Page>
        <ResultView attemptId={attemptId} statusParam={status} />
      </Page>
    );
  }

  return (
    <Page>
      <div className="glass mx-auto max-w-3xl rounded-lg p-8 text-center">
        <ShieldCheck className="mx-auto h-14 w-14 text-cyan" />
        <h1 className="mt-5 text-3xl font-black">{token ? "Anti-alt verification" : "Verification link required"}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-white/62">
          {token
            ? "Aron will confirm your Discord account, check account age, hash your IP, inspect device reputation, and assign a safe verification status."
            : "Run /verify in Discord, then press the generated button to open your one-time verification link."}
        </p>
        <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
          <Signal icon={LockKeyhole} label="OAuth2" value="Discord identify and guilds" />
          <Signal icon={Fingerprint} label="Device" value="Fingerprint is hashed before storage" />
          <Signal icon={ShieldCheck} label="Risk engine" value="Verified, flagged, or quarantined" />
        </div>
        {error ? <div className="mt-5 rounded-lg border border-rose/30 bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{error}</div> : null}
        {!hasVerificationApi() ? <div className="mt-5 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-200">Set VITE_VERIFICATION_API_URL to enable production verification.</div> : null}
        {token ? <Button className="mt-6" onClick={begin} icon={ShieldCheck}>{running ? "Opening Discord..." : "Verify With Discord"}</Button> : null}
        <div className="mt-5 flex justify-center gap-4 text-sm font-semibold text-white/48">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </Page>
  );
}
