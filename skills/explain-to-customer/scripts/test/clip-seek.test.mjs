/** Video clips inside scenes follow the timeline. Run: node --test scripts/test/clip-seek.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { SKILL_DIR, WS, findFfmpeg, runSync } from "../lib/common.mjs";

const ff = findFfmpeg();
const skip = !fs.existsSync(WS) || !ff.ffmpeg ? "needs the tool workspace and FFmpeg (node scripts/setup.mjs)" : false;
const hfMissing =
  Number(process.versions.node.split(".")[0]) < 22 || !fs.existsSync(path.join(WS, "node_modules", "hyperframes", "bin", "hyperframes.mjs"))
    ? "HyperFrames needs Node 22+ and the tool workspace install"
    : false;
const ENGINES = { playwright: skip, hyperframes: skip || hfMissing };
/** The clip scene starts after a title scene, so clip time and video time differ. */
const LEAD = 3;

const run = (...a) => {
  const r = runSync(ff.ffmpeg, ["-hide_banner", "-y", ...a], { timeout: 60000 });
  assert.equal(r.code, 0, r.stderr);
  return r.stderr;
};

/** 4 s testsrc2 clip with a frame counter in two top strips (this FFmpeg build has no drawtext): a coarse ramp and N mod 8 in big steps. */
function makeClip(file) {
  run(
    "-v",
    "error",
    "-f",
    "lavfi",
    "-i",
    "testsrc2=s=1920x1080:r=30:d=4",
    "-f",
    "lavfi",
    "-i",
    "nullsrc=s=1920x120:r=30:d=4,geq=lum='if(lt(Y,60),16+N*1.75,16+mod(N,8)*25)':cb=128:cr=128",
    "-filter_complex",
    "[0][1]overlay=0:0:shortest=1,format=yuv420p",
    "-c:v",
    "libx264",
    "-crf",
    "12",
    file,
  );
}

const frameAt = (file, t, out) => run("-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1", out);
const frameN = (file, n, out) => run("-v", "error", "-i", file, "-vf", `select=eq(n\\,${n})`, "-frames:v", "1", out);
/** Luma only: Chromium and FFmpeg pick different matrices for an untagged clip, which shifts chroma but not the picture. */
const ssim = (a, b) => Number(run("-i", a, "-i", b, "-lavfi", "[0]format=gray[a];[1]format=gray[b];[a][b]ssim", "-f", "null", "-").match(/All:([0-9.]+)/)[1]);
/** Mean luma of a strip in limited range. PNG gray is full range. */
function stripY(png, y) {
  const log = run("-i", png, "-vf", `crop=1920:40:0:${y},format=gray,signalstats,metadata=print:key=lavfi.signalstats.YAVG`, "-f", "null", "-");
  return (Number(log.match(/YAVG=([0-9.]+)/)[1]) * 219) / 255 + 16;
}
/** The coarse strip narrows it to a few frames, the mod-8 strip picks the exact one. */
function stripFrame(png) {
  const coarse = Math.round((stripY(png, 10) - 16) / 1.75);
  const fine = Math.round((stripY(png, 70) - 16) / 25) % 8;
  let d = (((fine - coarse) % 8) + 8) % 8;
  if (d >= 4) d -= 8;
  return coarse + d;
}

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "etc-clip-"));
  const sceneDir = path.join(root, "scene-templates");
  const src = path.join(root, "out", "_source");
  fs.mkdirSync(sceneDir);
  fs.mkdirSync(src, { recursive: true });
  makeClip(path.join(root, "rec.mp4"));
  fs.writeFileSync(path.join(sceneDir, "clip.html"), '<section class="scene scene--clip" data-scene="{{id}}">{{clipVideo}}</section>');
  fs.writeFileSync(
    path.join(sceneDir, "clip.css"),
    ".scene--clip { padding: 0; } .scene--clip video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; }",
  );
  const sb = {
    meta: { title: "Clip", lang: "en", sceneDir },
    scenes: [
      { id: "intro", type: "title", durationS: LEAD, onScreenText: ["Clip check"] },
      { id: "rec", type: "clip", durationS: 6, data: { clipVideo: path.join(root, "rec.mp4") } },
    ],
  };
  fs.writeFileSync(path.join(src, "storyboard.json"), JSON.stringify(sb));
  const layout = { video: "clip.mp4", poster: "clip-poster.png", gif: "clip-preview.gif", images: "images", diagrams: "diagrams", message: "message.md" };
  fs.writeFileSync(path.join(src, "run.json"), JSON.stringify({ slug: "clip", folder: path.dirname(src), layout }));
  execFileSync(process.execPath, [path.join(SKILL_DIR, "scripts", "theme.mjs"), "--style", "shadcn", "--src", src], { stdio: "ignore" });
  return { root, src, clip: path.join(root, "rec.mp4"), out: path.join(path.dirname(src), "clip.mp4") };
}

function assertFrame(png, want) {
  assert.equal(stripFrame(png), want, `clip frame shown instead of ${want}`);
}

for (const [engine, engineSkip] of Object.entries(ENGINES)) {
  test(`clip frames follow the timeline (${engine})`, { skip: engineSkip, timeout: 300000 }, () => {
    const p = project();
    try {
      check(p, engine);
    } finally {
      fs.rmSync(p.root, { recursive: true, force: true });
    }
  });
}

/** Renders the project, then checks the clip frame shown mid-scene and after the clip ran out. */
function check(p, engine) {
  const res = JSON.parse(
    execFileSync(process.execPath, [path.join(SKILL_DIR, "scripts", "render-video.mjs"), "--src", p.src, "--engine", engine, "--no-gif"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }),
  );
  assert.equal(res.engine, engine, JSON.stringify(res.warnings));
  const f = (n) => path.join(p.root, n);
  frameAt(p.out, LEAD + 2, f("out-2.png"));
  frameN(p.clip, 60, f("src-60.png"));
  assert.ok(ssim(f("out-2.png"), f("src-60.png")) > 0.9);
  assertFrame(f("out-2.png"), 60);
  frameAt(p.out, LEAD + 5, f("out-5.png"));
  frameN(p.clip, 119, f("src-119.png"));
  assert.ok(ssim(f("out-5.png"), f("src-119.png")) > 0.9);
  assertFrame(f("out-5.png"), 119);
}
