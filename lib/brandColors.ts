/**
 * Colour arithmetic for school branding, kept free of any server import so the
 * settings form can run the same check the API does and say why before saving.
 */

/** Lower-case #rrggbb, or null for anything else. Accepts #rgb shorthand. */
export function normalizeHex(value: string): string | null {
  const text = value.trim().toLowerCase();
  const short = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(text);
  if (short)
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;

  const long = /^#?([0-9a-f]{6})$/.exec(text);
  return long ? `#${long[1]}` : null;
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b]
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

/** Moves a colour toward white (amount > 0) or black (amount < 0). */
export function mix(hex: string, amount: number) {
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  return toHex(
    channels(hex).map((c) => c + (target - c) * t) as [number, number, number]
  );
}

function luminance(hex: string) {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between a colour and white. */
export function contrastWithWhite(hex: string) {
  return 1.05 / (luminance(hex) + 0.05);
}

/**
 * The accent is the fill behind white button text, so it has to be dark enough
 * to read. 4.5:1 is WCAG AA for text at the size the buttons use. A school
 * whose colour is a pale yellow is told so, rather than getting buttons their
 * students cannot read on a projector.
 */
export const MIN_ACCENT_CONTRAST = 4.5;

export function isReadableAccent(hex: string) {
  return contrastWithWhite(hex) >= MIN_ACCENT_CONTRAST;
}

/**
 * The accent spread across the design system's green tokens, so every button,
 * focus ring and tint on a branded page follows it without a line of the
 * components changing. The mix amounts approximate the steps between the
 * house greens in globals.css.
 */
export function accentTokens(hex: string): Record<string, string> {
  return {
    "--green-500": mix(hex, 0.12),
    "--green-600": hex,
    "--green-800": mix(hex, -0.35),
    "--green-tint": mix(hex, 0.94),
    "--green-edge": mix(hex, 0.75),
    "--leafgreen": hex
  };
}
