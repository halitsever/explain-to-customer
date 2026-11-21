/** Music bed and sound cues -> FFmpeg filter graph. Paths stay as given; the caller resolves them against _source. */
import path from "node:path";
import { exists, findFfmpeg, runStream, runSync } from "./common.mjs";

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

/** The graph ends at the un-normalised label in `map`; mixAudio adds gain, limiter and the 48 kHz stereo format. Video is input 0, so audio inputs start at 1. Ducking ratio grows with duckDb (6 dB is about 4:1). */
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
    parts.push(`[${idx()}:a]adelay=${ms}:all=1,volume=${num(c.gainDb, 0)}dB[c${i}]`);
    labels.push(`[c${i}]`);
  });
  if (!inputs.length) return { inputs: [], filter: "", map: null };

  let bus = null;
  if (labels.length) {
    bus = "[bus]";
    parts.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:duration=longest,apad=whole_dur=${fmt(totalS)}[bus]`);
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
  parts.push(`${mixed}atrim=0:${fmt(totalS)}[pre]`);
  return { inputs, filter: parts.join(";"), map: "[pre]" };
}

/** Strip container metadata so no encoder or title tag leaks into the file. */
export const CLEAN = ["-map_metadata", "-1", "-fflags", "+bitexact"];

/** Integrated loudness and true peak of the first audio stream, or null without one. */
export function measureLoudness(file) {
  const r = runSync(findFfmpeg().ffmpeg, ["-hide_banner", "-nostats", "-i", file, "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null", "-"], { timeout: 120000 });
  if (r.code !== 0) return null;
  return parseSummary(r.stderr);
}

function parseSummary(text) {
  const tail = text.slice(text.lastIndexOf("Summary:"));
  const lufs = /I:\s+(-?[\d.]+)\s+LUFS/.exec(tail);
  const peak = /Peak:\s+(-?[\d.]+)\s+dBFS/.exec(tail);
  if (!lufs) return null;
  return { loudnessLufs: Number(lufs[1]), truePeakDb: peak ? Number(peak[1]) : null };
}

/** Stream copy with clean metadata. Re-encodes leave a stream-level encoder tag that only a remux drops. */
export async function stripTags(src, dst) {
  await ffmpegRun(["-i", src, "-map", "0", "-c", "copy", ...CLEAN, "-movflags", "+faststart", dst], "strip tags");
}

async function ffmpegRun(argv, label) {
  const r = await runStream(findFfmpeg().ffmpeg, ["-hide_banner", "-loglevel", "info", "-y", ...argv], { quiet: true });
  if (r.code !== 0) throw new Error(`ffmpeg ${label} failed: ${r.stderr.slice(-600)}`);
  return r.stderr;
}

/** Mix music and cues into the video. Missing or undecodable audio becomes a warning and the output stays silent. */
export async function mixAudio(videoIn, out, sb, tl, src) {
  try {
    return await mix(videoIn, out, sb, tl, src);
  } catch (e) {
    await silentRemux(videoIn, out);
    return { loudnessLufs: null, truePeakDb: null, warnings: [{ kind: "audio-failed", detail: String(e.message).split("\n")[0].slice(0, 300) }] };
  }
}

const silentRemux = (videoIn, out) => ffmpegRun(["-i", videoIn, "-map", "0:v:0", "-c", "copy", "-an", ...CLEAN, "-movflags", "+faststart", out], "remux");

async function mix(videoIn, out, sb, tl, src) {
  const audio = sb.meta?.audio || {};
  const { cues, warnings } = resolveCues(sb, tl);
  const abs = (p) => path.resolve(src, p);
  const kept = [];
  for (const c of cues) {
    if (!c.sound || !exists(abs(c.sound))) warnings.push({ kind: "audio-missing", detail: `cue ${c.sound || "(no sound)"} at ${c.at}s` });
    else kept.push(c);
  }
  let music = audio.music;
  if (music && !exists(abs(music))) {
    warnings.push({ kind: "audio-missing", detail: `music ${music}` });
    music = null;
  }
  const g = audioGraph({ ...audio, music }, kept, tl.total);
  if (!g.map) {
    if (audio && Object.keys(audio).length) warnings.push({ kind: "audio-empty", detail: "no usable music or cues, output is silent" });
    await silentRemux(videoIn, out);
    return { loudnessLufs: null, truePeakDb: null, warnings };
  }
  const inputs = g.inputs.flatMap((p) => ["-i", abs(p)]);
  // loudnorm falls back to dynamic mode on peaky cues and misses the target, so set the gain by measurement.
  const target = num(audio.loudness, -14);
  const build = (gain, meter) =>
    `${g.filter};${g.map}volume=${gain.toFixed(2)}dB,alimiter=limit=0.794:level=0,aresample=48000,aformat=channel_layouts=stereo${meter ? ",ebur128=peak=true" : ""}[aout]`;
  let gain = 0;
  for (let pass = 0; pass < 4; pass++) {
    const err = await ffmpegRun(["-i", videoIn, ...inputs, "-filter_complex", build(gain, true), "-map", "[aout]", "-f", "null", "-"], "loudness pass");
    const m = parseSummary(err);
    if (!m || !Number.isFinite(m.loudnessLufs)) break;
    if (Math.abs(m.loudnessLufs - target) < 0.3) break;
    gain += target - m.loudnessLufs;
  }
  const filter = build(gain, false);
  await ffmpegRun(
    [
      "-i",
      videoIn,
      ...inputs,
      "-filter_complex",
      filter,
      "-map",
      "0:v:0",
      "-map",
      "[aout]",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-shortest",
      ...CLEAN,
      "-movflags",
      "+faststart",
      out,
    ],
    "mix",
  );
  const m = measureLoudness(out);
  return { loudnessLufs: m?.loudnessLufs ?? null, truePeakDb: m?.truePeakDb ?? null, warnings };
}
