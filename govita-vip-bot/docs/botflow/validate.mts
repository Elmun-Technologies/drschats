import { readFileSync } from "fs";
const [schemaPath, file] = process.argv.slice(2);
const m = await import(new URL(schemaPath, "file://" + process.cwd() + "/").href);
const raw = JSON.parse(readFileSync(file, "utf8"));
const r = m.botFlowDefinitionSchema.safeParse(raw);
if (!r.success) { console.log("FAIL", file, JSON.stringify(r.error.issues, null, 1)); process.exit(1); }
const refs = m.validateFlowRefs(r.data); const orph = m.findOrphanScreens(r.data);
// callback_data byte check: worst case "b:<screen>:<button>"
let maxLen = 0; for (const s of r.data.screens) for (const b of s.buttons) maxLen = Math.max(maxLen, Buffer.byteLength(`${s.id}:${b.id}`));
console.log("OK", file.split("/").pop(), "screens", r.data.screens.length, "forms", r.data.forms.length, "refErrors", refs, "orphans", orph, "maxIdBytes", maxLen);
