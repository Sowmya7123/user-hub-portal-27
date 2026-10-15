import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — TriageDesk" },
      { name: "description", content: "Why we built a safety-first triage assistant for overloaded government hospitals." },
      { property: "og:title", content: "About — TriageDesk" },
      { property: "og:description", content: "Why we built a safety-first triage assistant for overloaded government hospitals." },
    ],
  }),
  component: About,
});

const STATS = [
  { v: "800", l: "walk-ins a day" },
  { v: "2", l: "doctors on duty" },
  { v: "30s", l: "per triage today" },
  { v: "~4%", l: "true emergencies" },
];

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-4xl font-extrabold">Why TriageDesk exists</h1>
      <p className="mt-5 text-lg text-muted-foreground">
        In many outpatient departments patients are seen first-come-first-served. A person with chest pain can wait behind dozens of people with a mild fever, while an overworked nurse has seconds to decide.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.l} className="rounded-2xl bg-secondary p-5 text-center">
            <p className="font-display text-3xl font-extrabold text-primary">{s.v}</p>
            <p className="mt-1 text-sm text-secondary-foreground">{s.l}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-12 text-2xl font-bold">Our principles</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
        <li>Never under-triage an emergency — safety beats accuracy.</li>
        <li>Show the reasons behind every decision.</li>
        <li>Say “I can't assess this” rather than guess.</li>
        <li>Support nurses, never replace their judgement.</li>
      </ul>
    </div>
  );
}
