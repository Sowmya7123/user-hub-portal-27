import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { LEVELS } from "@/lib/triage";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — TriageDesk" },
      { name: "description", content: "The 5-level triage scale, hard escalation rules and abstention explained." },
      { property: "og:title", content: "How it works — TriageDesk" },
      { property: "og:description", content: "The 5-level triage scale, hard escalation rules and abstention explained." },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  { n: "1", t: "Enter intake", d: "Age, vitals and the complaint in the patient's own words." },
  { n: "2", t: "Safety rules check", d: "Critical vitals (SpO₂ < 90, BP < 90, pulse > 130) escalate instantly." },
  { n: "3", t: "Red flags scanned", d: "Chest pain, breathlessness, seizures and more are detected in many languages." },
  { n: "4", t: "Level + department", d: "A clear priority, department and reasons — or “send to nurse now”." },
];

const RULES = ["SpO₂ below 90% → Level 1", "Systolic BP below 90 → Level 1", "Pulse above 130 or below 40 → Level 1", "Systolic BP 180 or higher → Level 2", "Temperature 40°C+ or below 35°C → Level 2", "Impossible values (e.g. 96°C, BP 0) are ignored and flagged for re-measure"];

function HowItWorks() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-4xl font-extrabold">How it works</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">Missing a true emergency is far worse than over-calling a mild case — so every decision leans toward safety.</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div key={s.n} data-reveal style={{ "--i": i } as CSSProperties} className="rounded-2xl border bg-card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-display font-bold text-primary-foreground">{s.n}</span>
            <h3 className="mt-4 font-semibold">{s.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">The 5 triage levels</h2>
          <ul className="mt-5 space-y-3">
            {([1, 2, 3, 4, 5] as const).map((l) => (
              <li key={l} data-reveal style={{ "--i": l } as CSSProperties} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg font-display font-bold text-primary-foreground bg-level-${l}`}>{l}</span>
                <div className="min-w-0 flex-1"><p className="font-semibold">{LEVELS[l].name}</p></div>
                <span className="text-sm text-muted-foreground">{LEVELS[l].wait}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Hard escalation rules</h2>
          <p className="mt-2 text-sm text-muted-foreground">These always override everything else.</p>
          <ul className="mt-5 space-y-2">
            {RULES.map((r) => (
              <li key={r} className="rounded-xl border-l-4 border-l-destructive bg-card p-4 text-sm">{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
