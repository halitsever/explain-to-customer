/** Music bed and sound cues -> FFmpeg filter graph. Paths stay as given; the caller resolves them against _source. */

const num = (v, d) => (Number.isFinite(Number(v)) && v !== null && v !== "" && v !== undefined ? Number(v) : d);
const fmt = (n) => String(+Number(n).toFixed(3));

/** Merge meta.audio.cues and per-scene sfx into absolute-time cues; out-of-range ones become warnings. */
export function resolveCues(sb, tl) {
  const raw = [];
  for (const c of sb.meta?.audio?.cues || []) raw.push({ at: Number(c.at), sound: c.sound, gainDb: num(c.gainDb, 0) });
  for (const s of tl.list || []) {
    for (const x of s.scene?.sfx || []) {
      raw.push({ at: s.start + num(x.offsetS, 0), sound: x.sound, gainDb: num(x.gainDb, 0) });
    }
  }
  const cues = [];
  const warnings = [];
  for (const c of raw) {
    if (!Number.isFinite(c.at) || c.at < 0 || c.at >= tl.total) {
      warnings.push({ kind: "cue-out-of-range", detail: `${c.sound} at ${c.at}s is outside 0-${tl.total}s` });
    } else cues.push({ ...c, at: +c.at.toFixed(3) });
  }
  cues.sort((a, b) => a.at - b.at);
  return { cues, warnings };
}

/** Video is input 0, so audio inputs start at 1. Ducking ratio grows with duckDb (6 dB is about 4:1). */
export function audioGraph(audio, cues, totalS) {
  const a = audio || {};
  const inputs = [];
  const parts = [];
  const idx = () => inputs.length;
  let music = null;
  if (a.music) {
    inputs.push(a.music);
    const fadeIn = Math.min(num(a.fadeInS, 0.6), totalS);
    const fadeOut = Math.min(num(a.fadeOutS, 1.8), totalS);
    parts.push(
      `[${idx()}:a]aloop=loop=-1:size=2e9,atrim=0:${fmt(totalS)},asetpts=N/SR/TB,` +
        `afade=t=in:st=0:d=${fmt(fadeIn)},afade=t=out:st=${fmt(totalS - fadeOut)}:d=${fmt(fadeOut)},` +
        `volume=${num(a.musicGainDb, -16)}dB[music]`,
    );
    music = "[music]";
  }
  const labels = [];
  cues.forEach((c, i) => {
    inputs.push(c.sound);
    const ms = Math.round(c.at * 1000);
    parts.push(`[${idx()}:a]adelay=${ms}|${ms},volume=${num(c.gainDb, 0)}dB[c${i}]`);
    labels.push(`[c${i}]`);
  });
  if (!inputs.length) return { inputs: [], filter: "", map: null };

  let bus = null;
  if (labels.length) {
    bus = "[bus]";
    parts.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:duration=longest[bus]`);
  }
  let mixed;
  if (music && bus) {
    const ratio = fmt(Math.min(20, Math.max(1, 10 ** (num(a.duckDb, 6) / 10))));
    parts.push(
      `[bus]asplit=2[busmix][bussc]`,
      `[music][bussc]sidechaincompress=threshold=0.05:ratio=${ratio}:attack=20:release=300[ducked]`,
      `[ducked][busmix]amix=inputs=2:normalize=0:duration=longest[mix]`,
    );
    mixed = "[mix]";
  } else mixed = music || bus;
  parts.push(`${mixed}atrim=0:${fmt(totalS)},loudnorm=I=${num(a.loudness, -14)}:TP=-1:LRA=11,aresample=48000,aformat=channel_layouts=stereo[aout]`);
  return { inputs, filter: parts.join(";"), map: "[aout]" };
}
