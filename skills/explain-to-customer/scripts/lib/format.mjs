/** Video frame formats. The default keeps every existing storyboard at 1920x1080. */
export const FORMATS = {
  "16:9": { width: 1920, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
  "9:16": { width: 1080, height: 1920 },
};

export function formatOf(sb) {
  const name = sb?.meta?.format ?? "16:9";
  const size = Object.hasOwn(FORMATS, name) ? FORMATS[name] : null;
  if (!size) throw new Error(`Unknown meta.format "${name}". Use 16:9, 4:5 or 9:16.`);
  return { name, ...size, slug: name.replace(":", "-") };
}
