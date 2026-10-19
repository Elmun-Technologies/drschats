import { describe, expect, it } from "vitest";
import { hydrationFinding, isReportOnlyNoise } from "./checks/console.mjs";

/*
  The check's whole judgement is this matcher, so it is tested without a
  browser: the exact text Chromium printed for a deliberately mismatching page
  (React 19, production build) must count, and the one message about our own
  Report-Only header must not.
*/
describe("console audit matcher", () => {
  it("counts the minified hydration errors", () => {
    expect(hydrationFinding("Error: Minified React error #418; visit https://react.dev/errors/418?args[]=text")).toBe(true);
    expect(hydrationFinding("Minified React error #423")).toBe(true);
    expect(hydrationFinding("Minified React error #425")).toBe(true);
  });

  it("counts the readable variants", () => {
    expect(hydrationFinding("Hydration failed because the server rendered HTML didn't match the client.")).toBe(true);
    expect(hydrationFinding("Text content does not match server-rendered HTML.")).toBe(true);
    expect(hydrationFinding("Warning: Expected server HTML to contain a matching <p> in <div>. did not match. Server: \"a\" Client: \"b\"")).toBe(true);
  });

  it("leaves unrelated console errors to the caller", () => {
    expect(hydrationFinding("Failed to load resource: the server responded with a status of 404")).toBe(false);
    expect(hydrationFinding("Minified React error #421")).toBe(false);
  });

  it("filters only the report-only header notice, by exact text", () => {
    const noise = "The Content Security Policy directive 'upgrade-insecure-requests' is ignored when delivered in a report-only policy.";
    expect(isReportOnlyNoise(noise)).toBe(true);
    expect(isReportOnlyNoise("Refused to load the script 'https://evil.example/x.js'")).toBe(false);
    expect(isReportOnlyNoise(`${noise} also something else`)).toBe(false);
  });
});
