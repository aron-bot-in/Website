import { Gavel, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Page from "../components/Page.jsx";

export default function Quarantine() {
  return (
    <Page>
      <section className="mx-auto max-w-3xl rounded-lg border border-rose/30 bg-rose/10 p-8 text-center">
        <LockKeyhole className="mx-auto h-12 w-12 text-rose" />
        <h1 className="mt-5 text-3xl font-black">Account quarantine</h1>
        <p className="mt-3 leading-7 text-white/62">Economy-sensitive systems stay locked until staff review the case.</p>
        <Link to="/appeal" className="mt-6 inline-flex"><Button icon={Gavel}>Appeal</Button></Link>
      </section>
    </Page>
  );
}
