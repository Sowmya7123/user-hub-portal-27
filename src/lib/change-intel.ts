import { VITAL_RANGES, type TriageResult } from "./triage";

export type RawInputs = { age: string; systolic: string; diastolic: string; pulse: string; tempC: string; spo2: string; complaint: string };

export const FIELD_LABELS: Record<keyof RawInputs, string> = {
  age: "Age", systolic: "BP systolic", diastolic: "BP diastolic", pulse: "Pulse",
  tempC: "Temperature", spo2: "SpO₂", complaint: "Complaint",
};

export type GuardReport = { empty: string[]; invalid: string[]; missingInfo: string[] };

/** Detects empty fields, unusable values and missing timeline info. Uses only the existing plausibility ranges. */
export function guard(f: RawInputs, timeline: { onset: string }): GuardReport {
  const empty: string[] = [];
  const invalid: string[] = [];
  (Object.keys(f) as (keyof RawInputs)[]).forEach((k) => {
    const v = f[k].trim();
    if (v === "") { empty.push(FIELD_LABELS[k]); return; }
    if (k === "complaint") { if (v.length < 4) invalid.push(`${FIELD_LABELS[k]} (too short to assess)`); return; }
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) { invalid.push(`${FIELD_LABELS[k]} (${v})`); return; }
    const r = (VITAL_RANGES as Record<string, readonly [number, number]>)[k];
    if (r && (n < r[0] || n > r[1])) invalid.push(`${FIELD_LABELS[k]} (${v} — outside possible range, re-measure)`);
  });
  const missingInfo: string[] = [];
  if (!timeline.onset) missingInfo.push("Symptom start time not recorded");
  return { empty, invalid, missingInfo };
}

export function reviewReasons(r: TriageResult, g: GuardReport): string[] {
  const out: string[] = [];
  if (r.abstain) out.push("System could not assess — insufficient reliable information");
  r.redFlags.forEach((x) => out.push(`Red flag in complaint: ${x}`));
  r.rulesFired.forEach((x) => out.push(`Safety rule triggered: ${x}`));
  if (g.invalid.length) out.push(`Unusable values: ${g.invalid.join(", ")}`);
  if (g.empty.length) out.push(`Not measured: ${g.empty.join(", ")}`);
  g.missingInfo.forEach((x) => out.push(x));
  return out;
}

export type Diff = { field: string; before: string; after: string };

export function compare(a: RawInputs, b: RawInputs): Diff[] {
  return (Object.keys(a) as (keyof RawInputs)[])
    .filter((k) => a[k].trim() !== b[k].trim())
    .map((k) => ({ field: FIELD_LABELS[k], before: a[k].trim() || "—", after: b[k].trim() || "—" }));
}
