/** Audio graph builder. Run: node --test scripts/test/audio.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import { audioGraph, resolveCues } from "../lib/audio.mjs";

test("loops short music", () => assert.match(audioGraph({ music: "m.mp3" }, [], 30).filter, /aloop=loop=-1.*atrim=0:30/));
test("delays cues to their time", () => assert.match(audioGraph({}, [{ at: 1.25, sound: "w.wav", gainDb: -6 }], 10).filter, /adelay=1250\|1250/));
test("drops out-of-range cues", () => {
  const { cues, warnings } = resolveCues(
    {
      meta: {
        audio: {
          cues: [
            { at: -1, sound: "a" },
            { at: 40, sound: "b" },
            { at: 2, sound: "c" },
          ],
        },
      },
      scenes: [],
    },
    { list: [], total: 30 },
  );
  assert.deepEqual(
    cues.map((c) => c.sound),
    ["c"],
  );
  assert.equal(warnings.length, 2);
  assert.equal(warnings[0].kind, "cue-out-of-range");
});
test("scene sfx resolve against scene start", () => {
  const scene = { type: "intro", sfx: [{ offsetS: 0.5, sound: "s.wav", gainDb: -8 }] };
  const { cues } = resolveCues({ meta: {}, scenes: [scene] }, { list: [{ scene, start: 4, duration: 3 }], total: 7 });
  assert.deepEqual(cues, [{ at: 4.5, sound: "s.wav", gainDb: -8 }]);
});
test("ends in loudnorm at the requested loudness", () =>
  assert.match(audioGraph({ music: "m.mp3", loudness: -14 }, [], 10).filter, /loudnorm=I=-14:TP=-1:LRA=11,aresample=48000,aformat=channel_layouts=stereo/));
test("applies defaults", () => {
  const g = audioGraph({ music: "m.mp3" }, [{ at: 1, sound: "w.wav" }], 20);
  assert.match(g.filter, /volume=-16dB/);
  assert.match(g.filter, /afade=t=in:st=0:d=0\.6/);
  assert.match(g.filter, /afade=t=out:st=18\.2:d=1\.8/);
  assert.match(g.filter, /volume=0dB/);
  assert.match(g.filter, /loudnorm=I=-14:/);
});
test("inputs start after the video input and map the final label", () => {
  const g = audioGraph(
    { music: "m.mp3" },
    [
      { at: 1, sound: "a.wav" },
      { at: 2, sound: "b.wav" },
    ],
    10,
  );
  assert.deepEqual(g.inputs, ["m.mp3", "a.wav", "b.wav"]);
  assert.match(g.filter, /\[1:a\]aloop/);
  assert.match(g.filter, /\[2:a\]adelay=1000/);
  assert.match(g.filter, /\[3:a\]adelay=2000/);
  assert.match(g.filter, /sidechaincompress/);
  assert.equal(g.map, "[aout]");
  assert.match(g.filter, /\[aout\]$/);
});
test("music only has no ducking, cues only has no music chain", () => {
  assert.doesNotMatch(audioGraph({ music: "m.mp3" }, [], 10).filter, /sidechaincompress/);
  const c = audioGraph({}, [{ at: 1, sound: "a.wav" }], 10);
  assert.doesNotMatch(c.filter, /aloop|sidechaincompress/);
  assert.deepEqual(c.inputs, ["a.wav"]);
  assert.match(c.filter, /\[1:a\]adelay/);
});
test("nothing to mix yields an empty graph", () => assert.deepEqual(audioGraph({}, [], 10), { inputs: [], filter: "", map: null }));
