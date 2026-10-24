/** Small pointed-arch outline used to frame sections (drawn in px to the box it sits in). */
export function archPath(w: number, h: number, inset: number) {
  const x0 = inset;
  const x1 = w - inset;
  const rise = Math.min(w * 0.34, h * 0.4);
  const spring = inset + rise;
  const mid = w / 2;
  const span = x1 - x0;
  // two arcs meeting in a point: the ravoq of Central Asian portals
  return `M${x0},${h - inset} L${x0},${spring} C${x0},${spring - rise * 0.6} ${mid - span * 0.14},${inset + rise * 0.22} ${mid},${inset} C${mid + span * 0.14},${inset + rise * 0.22} ${x1},${spring - rise * 0.6} ${x1},${spring} L${x1},${h - inset} Z`;
}
