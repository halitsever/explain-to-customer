/** Composition template fill. Run: node --test scripts/test/composition.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fillComposition } from "../lib/scenes.mjs";
import { SKILL_DIR } from "../lib/common.mjs";

const tpl = fs.readFileSync(`${SKILL_DIR}/templates/scenes/_composition.html`, "utf8");
const data = { width: 1080, height: 1920, format: "9-16", lang: "en", title: "T", total: 10, clips: "", spec: "{}" };

test("leaves no placeholders behind", () => assert.ok(!fillComposition(tpl, data).includes("{{")));
test("fills size everywhere", () => {
  const out = fillComposition(tpl, data);
  assert.match(out, /data-width="1080" data-height="1920"/);
  assert.match(out, /content="width=1080, height=1920"/);
  assert.match(out, /--stage-w:1080px;--stage-h:1920px/);
});
