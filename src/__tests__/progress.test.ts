import { describe, expect, it } from "vitest";
import { getProgressPercent } from "../utils/progress";

describe("getProgressPercent", () => {
  it("returns the current progress as a percentage", () => {
    expect(getProgressPercent(1, 5)).toBe(20);
    expect(getProgressPercent(5, 5)).toBe(100);
  });

  it("returns zero when there are no steps", () => {
    expect(getProgressPercent(0, 0)).toBe(0);
  });
});
