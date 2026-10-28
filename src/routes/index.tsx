import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert, Timer, Languages, HandHelping } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TriageDesk — Safer OPD triage in under 60 seconds" },
      { name: "description", content: "Assign triage levels, departments and red flags instantly for overloaded outpatient departments." },
      { property: "og:title", content: "TriageDesk — Safer OPD triage in under 60 seconds" },
      { property: "og:description", content: "Assign triage levels, departments and red flags instantly for overloaded outpatient departments." },
    ],
  }),
  component: Index,
});

const FEATURES = [
  { icon: ShieldAlert, title: "Safety first", text: "Critical vitals always escalate — rules override any guess." },
  { icon: Timer, title: "Under 60 seconds", text: "A short form built for a nurse with a queue of 800." },
  { icon: Languages, title: "Speaks like patients", text: "Understands everyday and Hinglish complaints like “seene mein dard”." },
  { icon: HandHelping, title: "Knows its limits", text: "When data is unclear, it says “send to nurse now”." },
];

function Index() {
  return (
    <>
      <section className="bg-hero-gradient text-hero-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">For government OPDs</p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">The patient with chest pain shouldn't wait behind 40 fevers.</h1>
            <p className="mt-5 max-w-lg text-lg opacity-85">TriageDesk helps nurses assign a priority level and the right department in seconds — and never under-calls an emergency.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary"><Link to="/triage">Start triage</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-hero-foreground/40 bg-transparent text-hero-foreground hover:bg-hero-foreground/10 hover:text-hero-foreground">
                <Link to="/how-it-works">How it works</Link>
              </Button>
            </div>
          </div>
          <div className="perspective-scene">
            <img src={hero} alt="Nurse assessing a patient in an outpatient waiting area" className="hero-3d aspect-[4/3] w-full rounded-2xl object-cover" width={1280} height={960} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">Built for the real queue</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div key={f.title} data-reveal style={{ "--i": i } as React.CSSProperties} className="rounded-2xl border bg-card p-6 shadow-soft">
              <f.icon className="h-7 w-7 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-secondary p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-secondary-foreground">Ready to try it?</h2>
            <p className="mt-1 text-muted-foreground">Create a free account and run your first triage.</p>
          </div>
          <Button asChild size="lg"><Link to="/register">Create account</Link></Button>
        </div>
      </section>
    </>
  );
}
