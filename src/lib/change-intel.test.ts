import { describe, expect, it } from "vitest";
import { compare, guard } from "./change-intel";

const f = { age: "40", systolic: "120", diastolic: "80", pulse: "80", tempC: "37", spo2: "98", complaint: "fever two days" };

describe("missing data safety guard", () => {
  it("flags empty fields", () => {
    expect(guard({ ...f, pulse: "" }, { onset: "x" }).empty).toEqual(["Pulse"]);
  });
  it("flags a temperature of 96 as invalid", () => {
    expect(guard({ ...f, tempC: "96" }, { onset: "x" }).invalid).toHaveLength(1);
  });
  it("flags missing symptom start time", () => {
    expect(guard(f, { onset: "" }).missingInfo).toHaveLength(1);
  });
});

describe("follow-up comparison", () => {
  it("lists only changed fields", () => {
    expect(compare(f, { ...f, spo2: "92" })).toEqual([{ field: "SpO₂", before: "98", after: "92" }]);
  });
});
