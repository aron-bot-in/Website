import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Page from "../components/Page.jsx";

export default function NotFound() {
  return (
    <Page>
      <section className="mx-auto max-w-xl rounded-lg border border-white/10 bg-panel/80 p-8 text-center">
        <h1 className="text-4xl font-black">Route not found</h1>
        <p className="mt-3 text-white/62">This page is not in the Aron website.</p>
        <Link to="/"><Button className="mt-6">Return home</Button></Link>
      </section>
    </Page>
  );
}
