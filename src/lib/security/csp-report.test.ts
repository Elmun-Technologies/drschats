import { describe, expect, it } from "vitest";
import { blockedOrigin, parseCspReport } from "./csp-report";

describe("CSP report parsing", () => {
  it("reads the legacy report-uri body and keeps only directive and origin", () => {
    const body = {
      "csp-report": {
        "document-uri": "https://www.govita.uz/uz/track/123.secret?x=1",
        "violated-directive": "script-src-elem 'self'",
        "effective-directive": "script-src-elem",
        "blocked-uri": "https://evil.example/x.js?token=abc",
      },
    };
    expect(parseCspReport(body)).toEqual([{ directive: "script-src-elem", blocked: "https://evil.example" }]);
  });

  it("reads a Reporting API batch and skips other report types", () => {
    const body = [
      { type: "csp-violation", body: { effectiveDirective: "img-src", blockedURL: "data:image/png;base64,AAAA" } },
      { type: "deprecation", body: {} },
      { type: "csp-violation", body: { effectiveDirective: "script-src", blockedURL: "inline" } },
    ];
    expect(parseCspReport(body)).toEqual([
      { directive: "img-src", blocked: "data" },
      { directive: "script-src", blocked: "inline" },
    ]);
  });

  it("never keeps free text", () => {
    expect(blockedOrigin("not a url with spaces")).toBe("other");
    expect(parseCspReport({ "csp-report": { "violated-directive": "<script>", "blocked-uri": 5 } })).toEqual([{ directive: "unknown", blocked: "unknown" }]);
    expect(parseCspReport(null)).toEqual([]);
  });
});
