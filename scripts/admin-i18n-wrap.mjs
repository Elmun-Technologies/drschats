/*
  One-off helper for the admin's Russian translation (lib/admin/i18n).

  Wraps the Uzbek text a person reads in t("…") in the files you name:
    - JSX text between tags;
    - placeholder / title / aria-label / alt / label attributes written as plain strings;
    - values of object keys that are labels (label, title, description, text, hint, lead,
      empty, error, message, heading, note, cta) when they sit inside a function.
  Module-level constants are NOT wrapped (they would be read once, before the request's
  language is known): they are listed so they can be translated where they are used.

  node scripts/admin-i18n-wrap.mjs [--write] file.tsx …
  Without --write it only reports. Server files get `import { t }`, client files
  ("use client") get `const t = useT()` in every component that needs it.
*/
import fs from "node:fs";
import ts from "typescript";

const write = process.argv.includes("--write");
const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const LABEL_KEYS = new Set(["label", "title", "description", "text", "hint", "lead", "empty", "error", "message", "heading", "note", "cta", "subtitle"]);
const ATTRS = new Set(["placeholder", "title", "aria-label", "alt", "label", "hint", "lead", "empty", "subtitle", "description", "tooltip", "confirm", "eyebrow", "submitLabel", "pendingLabel", "detail", "emptyText", "submit"]);
const HAS_LETTER = /\p{L}/u;
const LOOKS_CODE = /^[\w./:#@?=&%+-]+$/; // slugs, paths, ids: one token with no spaces

function isText(value) {
  const v = value.trim();
  if (!HAS_LETTER.test(v)) return false;
  if (LOOKS_CODE.test(v) && !/\p{Lu}/u.test(v.slice(0, 1))) return false;
  return true;
}

const q = (s) => JSON.stringify(s);
const isFn = (n) => ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isMethodDeclaration(n);

function componentOf(node) {
  for (let p = node.parent; p; p = p.parent) {
    if (!isFn(p)) continue;
    let name = p.name?.getText();
    if (!name && ts.isVariableDeclaration(p.parent)) name = p.parent.name.getText();
    if (name && /^[A-Z]/.test(name)) return p;
  }
  return null;
}
const insideFunction = (node) => { for (let p = node.parent; p; p = p.parent) if (isFn(p)) return true; return false; };

let total = 0;
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const client = /^\s*["']use client["']/.test(text);
  const edits = [];
  const skipped = [];
  const needT = new Set();

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const raw = node.getText();
      if (isText(raw)) {
        if (/&[a-z#0-9]+;/i.test(raw)) skipped.push(["entity", raw.trim()]);
        else {
          const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
          const core = raw.trim().replace(/\s+/g, " ");
          if (!core.includes("{") && !core.includes("}")) {
            const comp = componentOf(node);
            if (!comp) skipped.push(["no-component", core]);
            else {
              edits.push([node.getStart(), node.getEnd(), `${lead.includes("\n") ? lead : lead}{t(${q(core)})}${trail}`]);
              needT.add(comp);
            }
          }
        }
      }
    } else if (ts.isJsxAttribute(node) && ATTRS.has(node.name.getText()) && node.initializer && ts.isStringLiteral(node.initializer) && isText(node.initializer.text)) {
      const comp = componentOf(node);
      if (!comp) skipped.push(["no-component", node.initializer.text]);
      else {
        edits.push([node.initializer.getStart(), node.initializer.getEnd(), `{t(${q(node.initializer.text)})}`]);
        needT.add(comp);
      }
    } else if (ts.isPropertyAssignment(node) && LABEL_KEYS.has(node.name.getText()) && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer)) && isText(node.initializer.text) && /\s|[ʻʼ]|^\p{Lu}/u.test(node.initializer.text)) {
      if (!insideFunction(node)) skipped.push(["module-level", node.initializer.text]);
      else {
        edits.push([node.initializer.getStart(), node.initializer.getEnd(), `t(${q(node.initializer.text)})`]);
        if (client) {
          const comp = componentOf(node);
          if (comp) needT.add(comp);
          else skipped.push(["client-no-component", node.initializer.text]);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (!edits.length && !skipped.length) continue;
  total += edits.length;
  console.log(`${file}: ${edits.length} wrapped${skipped.length ? `, ${skipped.length} left` : ""}`);
  for (const [why, s] of skipped) console.log(`   · ${why}: ${s.slice(0, 90)}`);
  if (!write || !edits.length) continue;

  if (client) {
    for (const comp of needT) {
      const body = comp.body;
      if (body && ts.isBlock(body) && body.getText().includes("useT()")) continue;
      if (body && ts.isBlock(body)) edits.push([body.getStart() + 1, body.getStart() + 1, "\n  const t = useT();"]);
      else console.log(`   ! ${file}: a component without a block body needs const t = useT() by hand`);
    }
  }
  let out = text;
  edits.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  for (const [s, e, r] of edits) out = out.slice(0, s) + r + out.slice(e);
  const importLine = client ? 'import { useT } from "@/lib/admin/i18n/client";\n' : 'import { t } from "@/lib/admin/i18n/server";\n';
  if (!/from "@\/lib\/admin\/i18n\/(server|client)"/.test(out)) {
    const m = [...out.matchAll(/^import .*$/gm)].at(-1);
    out = m ? out.slice(0, m.index + m[0].length) + "\n" + importLine.trimEnd() + out.slice(m.index + m[0].length) : importLine + out;
  }
  fs.writeFileSync(file, out);
}
console.log(`\n${total} strings ${write ? "wrapped" : "would be wrapped"}.`);
