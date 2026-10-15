import { describe, expect, it } from "vitest";
import { triage } from "./triage";

const base = { systolic: 120, pulse: 80, tempC: 37, spo2: 98 };

describe("triage escalation rules", () => {
  it("SpO2 below 90 forces level 1 even with a mild complaint", () => {
    expect(triage({ ...base, spo2: 85, complaint: "mild cough" }).level).toBe(1);
  });
  it("chest pain is never triaged below level 2", () => {
    expect(triage({ ...base, complaint: "seene mein dard since morning" }).level).toBeLessThanOrEqual(2);
  });
  it("implausible temperature like 96°C is ignored, not escalated", () => {
    const r = triage({ ...base, tempC: 96, complaint: "mild fever" });
    expect(r.rulesFired).toHaveLength(0);
  });
  it("abstains when vitals are missing and there is no red flag", () => {
    const r = triage({ complaint: "not well" });
    expect(r.abstain).toBe(true);
  });
});
