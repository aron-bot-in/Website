import { AlertTriangle, BadgeCheck, CheckCircle2, Clock3, Gavel, HelpCircle, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import Page from "../components/Page.jsx";
import { getVerificationResult, hasVerificationApi, startBackendVerification } from "../lib/verificationApi.js";

const verificationRules = [
  "Registering or using more than one account to farm Aron cards, currency, drops, or guild progress is prohibited.",
  "Helping an alternate, quarantined, or blacklisted player move resources may lead to action for every account involved.",
  "Bugs, exploits, automation, and duplicated rewards must be reported immediately before using or trading the items.",
  "Buying, selling, or transferring entire Discord accounts for Aron progress is not allowed.",
  "Do not use social media standing, staff pressure, or outside deals to gain Aron resources or items.",
  "Items obtained through illegal activity can be removed from inventories regardless of where they were traded.",
  "Shared household accounts may be reviewed together if one account breaks verification rules."
];

const mascotUrl = "https://i.im.ge/QMFZF51/image.png";

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

function VerificationMatches({ matches }) {
  if (!matches?.length) return null;

  return (
    <div className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-left text-sm text-amber-100">
      <div className="font-black text-white">Matching verification data</div>
      <div className="mt-2 space-y-2">
        {matches.map((match, index) => (
          <div key={`${match.type}-${match.matchedUserId}-${index}`} className="rounded-lg border border-white/10 bg-black/15 p-3">
            <div className="font-bold text-white">{match.label}</div>
            <div className="mt-1 text-white/68">{match.detail}</div>
            <div className="mt-1 text-xs font-semibold text-white/44">
              Registered player: {match.matchedUsername} ({match.matchedPlayer}) | Discord ID: {match.matchedUserId}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerifyMascot() {
  return (
    <div className="relative hidden min-h-[560px] lg:block">
      <div className="absolute left-[16%] top-[18%] h-1 w-1 rounded-full bg-white/80" />
      <div className="absolute right-[12%] top-[8%] h-1 w-1 rounded-full bg-white/80" />
      <div className="absolute right-[28%] top-[34%] h-2 w-2 rounded-full bg-white/60" />
      <div className="absolute left-[8%] bottom-[18%] h-1.5 w-1.5 rounded-full bg-white/75" />
      <div className="absolute inset-x-10 bottom-12 h-44 rounded-full bg-violet/12 blur-3xl" />
      <img
        src={mascotUrl}
        alt="Aron verification mascot"
        className="absolute left-1/2 top-1/2 h-[430px] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-xl object-contain drop-shadow-[0_28px_42px_rgba(0,0,0,0.62)]"
      />
      <div className="absolute left-1/2 top-[22%] -translate-x-[115%] -rotate-6 rounded-lg border border-cyan/20 bg-cyan/10 px-4 py-3 shadow-card backdrop-blur">
        <Sparkles className="h-5 w-5 text-cyan" />
      </div>
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
      <VerificationMatches matches={result?.verificationMatches} />
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
    <Page className="py-12 lg:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,560px)_1fr]">
        <section className="verify-rules-panel rounded-lg p-6 shadow-card sm:p-8">
          <div className="mx-auto h-1.5 w-1.5 rounded-full bg-white/60" />
          <div className="mt-3 flex items-center justify-center gap-3">
            <ShieldCheck className="h-8 w-8 text-violet" />
            <h1 className="text-center text-4xl font-black uppercase tracking-[0.02em] text-white sm:text-5xl">Verify</h1>
          </div>
          <ul className="mt-7 space-y-4 text-[15px] font-semibold leading-relaxed text-white/86 sm:text-base">
            {verificationRules.map((rule) => (
              <li key={rule} className="grid grid-cols-[8px_1fr] gap-4">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/90" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>

          {error ? <div className="mt-6 rounded-lg border border-rose/30 bg-rose/10 px-4 py-3 text-sm font-semibold text-rose">{error}</div> : null}
          {!hasVerificationApi() ? <div className="mt-6 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-200">Verification server URL is missing.</div> : null}

          {token ? (
            <Button className="mt-7 w-full justify-center bg-violet/80 text-base hover:bg-violet" onClick={begin} icon={ShieldCheck}>
              {running ? "Opening Discord..." : "Verify With Discord"}
            </Button>
          ) : (
            <div className="mt-7 rounded-lg border border-violet/30 bg-violet/15 px-4 py-3 text-center text-sm font-bold text-violet">
              Request a fresh verification link with /verify in Discord.
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm font-semibold text-white">
            <HelpCircle className="h-4 w-4 text-violet" />
            <span>Need help?</span>
            <Link className="text-white/58 transition hover:text-white" to="/support">Join our discord server</Link>
          </div>
          <div className="mt-4 flex justify-center gap-4 text-xs font-semibold text-white/42">
            <Link className="transition hover:text-white/75" to="/privacy">Privacy</Link>
            <Link className="transition hover:text-white/75" to="/terms">Terms</Link>
          </div>
        </section>
        <VerifyMascot />
      </div>
    </Page>
  );
}
