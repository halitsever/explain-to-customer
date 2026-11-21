/** Portrait scene layout, baked in Chromium. Run: node --test scripts/test/portrait-bake.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { SKILL_DIR, WS } from "../lib/common.mjs";
import { formatOf } from "../lib/format.mjs";
import { buildScenes } from "../lib/scenes.mjs";
import { bakeScenes } from "../lib/stills.mjs";

const HEADING = "Orders placed after midnight now land on the correct day in your monthly sales report view";
const LONG = `${HEADING} `.repeat(5).slice(0, 400);
const LINE = "Each order is counted on the day the customer placed it, in their own time zone";

/** One scene of every type, each with a 90-character heading. */
function allScenes(heading = HEADING) {
  return [
    { id: "title", type: "title", onScreenText: [heading, "Your sales report now matches what your customers see"] },
    { id: "before-after", type: "before-after", onScreenText: [heading], data: { before: { text: "Late orders showed up on the next day" }, after: { text: LINE } } },
    { id: "callouts", type: "screenshot-callouts", onScreenText: [heading, "Open the monthly sales report", "Pick any day in the calendar", LINE] },
    { id: "steps", type: "steps", onScreenText: [heading, "Open Reports", "Choose Monthly sales", "Pick the month you want to check"] },
    { id: "diagram", type: "diagram", onScreenText: [heading, "The order date follows the customer's own clock"] },
    { id: "benefits", type: "benefits", onScreenText: [heading, "Daily totals match your bank", "No more manual fixes", "Fewer support questions", LINE] },
    { id: "action", type: "action-needed", onScreenText: [heading, "Check last month's report once", "Tell us if a day still looks off"] },
    { id: "summary", type: "summary-card", onScreenText: [heading, "Orders land on the right day", "Totals match your bank", "Nothing to install"] },
    { id: "outro", type: "outro", onScreenText: [heading, "Questions? Reply to this message"] },
  ];
}

function makeSource(aspect, scenes) {
  const src = fs.mkdtempSync(path.join(os.tmpdir(), "etc-portrait-"));
  const sb = { meta: { title: "Portrait check", lang: "en", aspect, product: "Shop admin" }, brief: { before: "Late orders on the next day", after: LINE }, scenes };
  fs.writeFileSync(path.join(src, "storyboard.json"), JSON.stringify(sb));
  execFileSync(process.execPath, [path.join(SKILL_DIR, "scripts", "theme.mjs"), "--style", "shadcn", "--src", src], { stdio: "ignore" });
  return src;
}

async function bake(aspect, scenes) {
  const src = makeSource(aspect, scenes);
  try {
    const { sb, scenes: built } = buildScenes(src, { force: true });
    return await bakeScenes(src, built, new Map(), formatOf(sb));
  } finally {
    fs.rmSync(src, { recursive: true, force: true });
  }
}

const skip = fs.existsSync(WS) ? false : "needs the tool workspace (node scripts/setup.mjs)";
const layoutIssues = (reports) => reports.flatMap((r) => r.issues.filter((i) => i.kind === "safe-area" || i.kind === "text-overflow").map((i) => `${r.file}: ${i.kind}`));

for (const aspect of ["4:5", "9:16"]) {
  test(`portrait bake fits a 90-character heading on every scene type (${aspect})`, { skip, timeout: 120000 }, async () => {
    assert.equal(HEADING.length, 90);
    const reports = await bake(aspect, allScenes());
    assert.equal(reports.length, 9);
    assert.deepEqual(layoutIssues(reports), []);
  });
}

test("portrait bake reports a heading that cannot shrink enough", { skip, timeout: 120000 }, async () => {
  assert.equal(LONG.length, 400);
  const [report] = await bake("4:5", [{ id: "long", type: "steps", onScreenText: [LONG, "Open Reports", "Choose Monthly sales"] }]);
  assert.ok(
    report.issues.some((i) => i.kind === "text-overflow"),
    JSON.stringify(report.issues),
  );
});
