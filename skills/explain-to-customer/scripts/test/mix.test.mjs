/** Audio mix against real FFmpeg. Run: node --test scripts/test/mix.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { mixAudio, measureLoudness } from "../lib/audio.mjs";
import { findFfmpeg, runSync } from "../lib/common.mjs";

const ff = findFfmpeg();
const gen = (...a) => assert.equal(runSync(ff.ffmpeg, ["-v", "error", "-y", ...a], { timeout: 60000 }).code, 0);
const probe = (f) => JSON.parse(runSync(ff.ffprobe, ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", f]).stdout);

function fixture(dur) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mix-"));
  gen("-f", "lavfi", "-i", `testsrc2=s=1080x1350:r=30:d=${dur}`, "-c:v", "libx264", "-pix_fmt", "yuv420p", path.join(dir, "v.mp4"));
  gen("-f", "lavfi", "-i", "sine=frequency=440:duration=2", path.join(dir, "m.mp3"));
  gen("-f", "lavfi", "-i", "anoisesrc=d=0.2:c=white", path.join(dir, "c.wav"));
  return dir;
}
const sbOf = (audio) => ({ meta: { audio }, scenes: [] });
const tlOf = (total) => ({ list: [], total });

test("mixes music and cues to -14 LUFS with no metadata", { skip: !ff.ffmpeg || !ff.ffprobe }, async () => {
  const dir = fixture(6);
  const out = path.join(dir, "out.mp4");
  const r = await mixAudio(path.join(dir, "v.mp4"), out, sbOf({ music: "m.mp3", cues: [{ at: 3, sound: "c.wav" }] }), tlOf(6), dir);
  const j = probe(out);
  const a = j.streams.filter((s) => s.codec_type === "audio");
  assert.equal(a.length, 1);
  assert.equal(a[0].codec_name, "aac");
  assert.equal(Number(a[0].sample_rate), 48000);
  assert.equal(a[0].channels, 2);
  assert.ok(Math.abs(Number(j.format.duration) - 6) <= 0.1, `duration ${j.format.duration}`);
  const m = measureLoudness(out);
  assert.ok(Math.abs(m.loudnessLufs + 14) <= 1, `loudness ${m.loudnessLufs}`);
  assert.ok(m.truePeakDb <= -1, `true peak ${m.truePeakDb}`);
  assert.ok(Math.abs(r.loudnessLufs + 14) <= 1);
  for (const k of ["encoder", "title", "comment"]) assert.equal(j.format.tags?.[k], undefined, k);
});

test("drops missing files with a warning and falls back to silence", { skip: !ff.ffmpeg || !ff.ffprobe }, async () => {
  const dir = fixture(6);
  const out = path.join(dir, "out.mp4");
  const r = await mixAudio(path.join(dir, "v.mp4"), out, sbOf({ music: "nope.mp3", cues: [{ at: 1, sound: "gone.wav" }, { at: 2 }] }), tlOf(6), dir);
  assert.equal(r.warnings.filter((w) => w.kind === "audio-missing").length, 3);
  assert.equal(r.loudnessLufs, null);
  assert.equal(probe(out).streams.filter((s) => s.codec_type === "audio").length, 0);
});
