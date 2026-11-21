/** Scene templates loaded from meta.sceneDir. Run: node --test scripts/test/external-scenes.test.mjs */
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

const skip = fs.existsSync(WS) ? false : "needs the tool workspace (node scripts/setup.mjs)";
const HOOK = '<section class="scene" id="{{id}}"><h1>{{heading}}</h1><p>{{tagline}}</p></section>';

const roots = [];
test.after(() => roots.forEach((r) => fs.rmSync(r, { recursive: true, force: true })));

/** A source folder plus a scene folder holding the given templates. */
function fixture(scenes, templates = { "hook.html": HOOK }, { theme = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "etc-external-"));
  roots.push(root);
  const sceneDir = path.join(root, "scene-templates");
  const src = path.join(root, "_source");
  fs.mkdirSync(sceneDir);
  fs.mkdirSync(src);
  for (const [name, body] of Object.entries(templates)) fs.writeFileSync(path.join(sceneDir, name), body);
  fs.writeFileSync(path.join(src, "storyboard.json"), JSON.stringify({ meta: { title: "External", lang: "en", sceneDir }, scenes }));
  if (theme) execFileSync(process.execPath, [path.join(SKILL_DIR, "scripts", "theme.mjs"), "--style", "shadcn", "--src", src], { stdio: "ignore" });
  return { root, src, sceneDir };
}
const read = (r, i = 0) => fs.readFileSync(r.scenes[i].path, "utf8");

test("uses an external template for an unknown type", { skip }, () => {
  const { src } = fixture([{ id: "hook", type: "hook", onScreenText: ["Hi **there**"], data: { tagline: "<b>x</b>" } }]);
  const html = read(buildScenes(src, { force: true }));
  assert.match(html, /<mark>there<\/mark>/);
  assert.match(html, /&lt;b&gt;x&lt;\/b&gt;/);
  assert.match(html, /id="hook"/);
});

test("fills lines from onScreenText[1..]", { skip }, () => {
  const { src } = fixture([{ id: "l", type: "list", onScreenText: ["Head", "One", "**Two**"] }], { "list.html": '<section class="scene">{{lines}}</section>' });
  assert.match(read(buildScenes(src, { force: true })), /<p>One<\/p><p><mark>Two<\/mark><\/p>/);
});

test("built-in types still win when no external file exists", { skip }, () => {
  const { src } = fixture([{ id: "t", type: "title", onScreenText: ["Hello"] }]);
  assert.match(read(buildScenes(src, { force: true })), /scene--title/);
});

test("built-in types win over an external file of the same name", { skip }, () => {
  const { src } = fixture([{ id: "t", type: "title", onScreenText: ["Hello"] }], { "title.html": "<section>EXTERNAL</section>" });
  const html = read(buildScenes(src, { force: true }));
  assert.match(html, /scene--title/);
  assert.doesNotMatch(html, /EXTERNAL/);
});

test("an unknown type with no template names sceneDir in the error", { skip }, () => {
  const { src } = fixture([{ id: "x", type: "nope" }]);
  assert.throws(() => buildScenes(src, { force: true }), /Unknown scene type "nope".*sceneDir/s);
});

test("a placeholder with no value raises template-missing-key", { skip }, () => {
  const { src } = fixture([{ id: "hook", type: "hook", onScreenText: ["Hi"] }]);
  const { warnings } = buildScenes(src, { force: true });
  assert.deepEqual(
    warnings.filter((w) => w.kind === "template-missing-key").map((w) => [w.scene, /tagline/.test(w.detail)]),
    [["hook", true]],
  );
});

test("copies scene CSS into lib and links it after tokens.css", { skip }, () => {
  const { src } = fixture([{ id: "hook", type: "hook", onScreenText: ["Hi"], data: { tagline: "t" } }], { "hook.html": HOOK, "brand.css": ".x{}" });
  const html = read(buildScenes(src, { force: true }));
  assert.equal(fs.readFileSync(path.join(src, "lib", "brand.css"), "utf8"), ".x{}");
  const at = (s) => html.indexOf(s);
  assert.ok(at('href="../lib/brand.css"') > at('href="../tokens.css"'), html);
  assert.ok(at('href="../tokens.css"') > at('href="../lib/base.css"'));
});

test("keys ending in Image and Video become img and video tags", { skip }, () => {
  const rec = path.join(os.tmpdir(), `etc-rec-${process.pid}.mp4`);
  fs.writeFileSync(rec, "");
  const { src } = fixture([{ id: "c", type: "clip", data: { shotImage: "shot.png", clipVideo: rec } }], {
    "clip.html": '<section class="scene">{{shotImage}}{{clipVideo}}</section>',
  });
  fs.writeFileSync(path.join(src, "shot.png"), "");
  const html = read(buildScenes(src, { force: true }));
  assert.match(html, /<img src="\.\.\/shot\.png" alt=""/);
  assert.match(html, /<video src="\.\.\/assets\/etc-rec-\d+\.mp4" muted playsinline preload="auto" data-clip-start="0"/);
  assert.ok(fs.existsSync(path.join(src, "assets", path.basename(rec))));
  fs.rmSync(rec);
});

test("missing clip raises asset-missing", { skip, timeout: 120000 }, async () => {
  const { src } = fixture([{ id: "c", type: "clip", data: { clipVideo: "gone.mp4" } }], { "clip.html": '<section class="scene">{{clipVideo}}</section>' }, { theme: true });
  const { sb, scenes } = buildScenes(src, { force: true });
  const [report] = await bakeScenes(src, scenes, new Map(), formatOf(sb));
  const hit = report.issues.find((i) => i.kind === "asset-missing");
  assert.ok(hit, JSON.stringify(report.issues));
  assert.match(JSON.stringify(hit), /gone\.mp4/);
});

test("an edited template rebuilds its scenes without --force", { skip }, () => {
  const { src, sceneDir } = fixture([{ id: "hook", type: "hook", onScreenText: ["Hi"], data: { tagline: "t" } }]);
  buildScenes(src);
  const later = new Date(Date.now() + 5000);
  fs.writeFileSync(path.join(sceneDir, "hook.html"), "<section>EDITED</section>");
  fs.utimesSync(path.join(sceneDir, "hook.html"), later, later);
  assert.match(read(buildScenes(src)), /EDITED/);
});
