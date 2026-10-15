export type TriageInput = {
  age?: number;
  sex?: "M" | "F" | "O";
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  tempC?: number;
  spo2?: number;
  complaint: string;
  conditions?: string;
};

export type TriageResult = {
  abstain: boolean;
  level: 1 | 2 | 3 | 4 | 5 | null;
  department: string;
  redFlags: string[];
  rulesFired: string[];
  notes: string[];
};

const RED_FLAG_TERMS: { flag: string; terms: string[]; level: 1 | 2; dept: string }[] = [
  { flag: "Chest pain", terms: ["chest pain", "chest tight", "seene mein dard", "chhati", "heart pain", "seena"], level: 2, dept: "Cardiology / Emergency" },
  { flag: "Breathing difficulty", terms: ["breath", "saans", "can't breathe", "cannot breathe", "choking", "wheez"], level: 2, dept: "Emergency" },
  { flag: "Unconscious / fainting", terms: ["unconscious", "faint", "behosh", "collapsed", "not responding"], level: 1, dept: "Emergency" },
  { flag: "Seizure", terms: ["seizure", "fits", "convulsion", "mirgi"], level: 1, dept: "Emergency" },
  { flag: "Stroke signs", terms: ["face droop", "slurred", "one side weak", "paralysis", "lakwa"], level: 1, dept: "Neurology / Emergency" },
  { flag: "Heavy bleeding", terms: ["bleeding heavily", "vomiting blood", "khoon", "blood in vomit", "heavy bleeding"], level: 1, dept: "Emergency" },
  { flag: "Pregnancy concern", terms: ["pregnant", "pregnancy", "garbh", "labour pain"], level: 2, dept: "Obstetrics & Gynaecology" },
  { flag: "Severe head injury", terms: ["head injury", "accident", "sar par chot"], level: 2, dept: "Emergency / Surgery" },
  { flag: "Poisoning", terms: ["poison", "zeher", "overdose", "snake bite", "saanp"], level: 1, dept: "Emergency" },
];

const DEPT_KEYWORDS: { dept: string; terms: string[] }[] = [
  { dept: "Paediatrics", terms: ["child", "baby", "bacha", "infant"] },
  { dept: "Orthopaedics", terms: ["bone", "fracture", "joint", "back pain", "knee", "haddi"] },
  { dept: "ENT", terms: ["ear", "throat", "nose", "kaan", "gala"] },
  { dept: "Dermatology", terms: ["rash", "itch", "skin", "khujli"] },
  { dept: "Ophthalmology", terms: ["eye", "vision", "aankh"] },
  { dept: "Gastroenterology", terms: ["stomach", "vomit", "diarrh", "loose motion", "pet dard", "abdominal"] },
];

const rank = (a: number, b: number) => Math.min(a, b) as 1 | 2 | 3 | 4 | 5;

/** Treats a vital as unknown when it is missing or physiologically impossible. */
function plausible(v: number | undefined, min: number, max: number) {
  if (v === undefined || Number.isNaN(v) || v === 0) return { ok: false, present: v !== undefined && v !== 0 ? true : false };
  return { ok: v >= min && v <= max, present: true };
}

export function triage(input: TriageInput): TriageResult {
  const text = input.complaint.toLowerCase();
  const redFlags: string[] = [];
  const rulesFired: string[] = [];
  const notes: string[] = [];
  let level: 1 | 2 | 3 | 4 | 5 = 5;
  let department = "General Medicine";

  // Data-quality checks: implausible values (e.g. temp 96°C) are discarded, not trusted.
  const checks = {
    systolic: plausible(input.systolic, 40, 260),
    pulse: plausible(input.pulse, 20, 250),
    tempC: plausible(input.tempC, 30, 44),
    spo2: plausible(input.spo2, 40, 100),
  };
  const implausible = Object.entries(checks).filter(([, c]) => c.present && !c.ok).map(([k]) => k);
  if (implausible.length) notes.push(`Ignored implausible values: ${implausible.join(", ")} — please re-measure.`);

  const v = {
    systolic: checks.systolic.ok ? input.systolic! : undefined,
    pulse: checks.pulse.ok ? input.pulse! : undefined,
    tempC: checks.tempC.ok ? input.tempC! : undefined,
    spo2: checks.spo2.ok ? input.spo2! : undefined,
  };

  // Hard-coded escalation rules — always override the softer scoring below.
  if (v.spo2 !== undefined && v.spo2 < 90) { level = 1; rulesFired.push(`SpO₂ ${v.spo2}% < 90%`); }
  if (v.systolic !== undefined && v.systolic < 90) { level = 1; rulesFired.push(`Systolic BP ${v.systolic} < 90`); }
  if (v.systolic !== undefined && v.systolic >= 180) { level = rank(level, 2); rulesFired.push(`Systolic BP ${v.systolic} ≥ 180`); }
  if (v.pulse !== undefined && (v.pulse > 130 || v.pulse < 40)) { level = 1; rulesFired.push(`Pulse ${v.pulse} outside 40–130`); }
  if (v.tempC !== undefined && v.tempC >= 40) { level = rank(level, 2); rulesFired.push(`Temperature ${v.tempC}°C ≥ 40`); }
  if (v.tempC !== undefined && v.tempC < 35) { level = rank(level, 2); rulesFired.push(`Temperature ${v.tempC}°C < 35`); }

  for (const rf of RED_FLAG_TERMS) {
    if (rf.terms.some((t) => text.includes(t))) {
      redFlags.push(rf.flag);
      if (rf.level < level) department = rf.dept;
      level = rank(level, rf.level);
    }
  }

  if (level >= 3) {
    if (v.tempC !== undefined && v.tempC >= 38.5) level = rank(level, 3);
    else if (v.spo2 !== undefined && v.spo2 < 94) level = rank(level, 3);
    else if (text.includes("pain") || text.includes("dard")) level = rank(level, 4);
    else if (text.trim().length > 0) level = rank(level, 4);
    if ((input.age ?? 30) >= 70 || ((input.age ?? 30) < 2 && input.age !== undefined)) {
      level = rank(level, 3);
      notes.push("Age-based uplift applied (very young or elderly).");
    }
    const match = DEPT_KEYWORDS.find((d) => d.terms.some((t) => text.includes(t)));
    if (match) department = match.dept;
    if ((input.age ?? 30) < 14 && input.age !== undefined) department = "Paediatrics";
  }
  if (level <= 2 && department === "General Medicine") department = "Emergency";

  // Abstain when there is too little information to assess safely.
  const missingVitals = Object.values(v).filter((x) => x === undefined).length;
  const abstain = level > 2 && (text.trim().length < 4 || missingVitals >= 3);
  if (abstain) notes.push("Not enough reliable information to assess — send to nurse now.");

  return { abstain, level: abstain ? null : level, department: abstain ? "Nurse station" : department, redFlags, rulesFired, notes };
}

export const LEVELS = {
  1: { name: "Resuscitation", wait: "Immediate" },
  2: { name: "Emergent", wait: "< 10 min" },
  3: { name: "Urgent", wait: "< 30 min" },
  4: { name: "Less urgent", wait: "< 60 min" },
  5: { name: "Non-urgent", wait: "< 120 min" },
} as const;
