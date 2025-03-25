import { useMemo } from "react";
import styled from "styled-components";

export default function Pill({
  text,
  useLightPalette = false,
}: {
  text: string;
  useLightPalette?: boolean;
}) {
  const backgroundColor = useMemo(
    () => generateColor(text, false, true),
    [text]
  );
  const textColor = useMemo(() => generateColor(text, false, false), [text]);

  return (
    <StyledPill style={{ backgroundColor, color: textColor }}>
      {text}
    </StyledPill>
  );
}

// Styled component for the pill
const StyledPill = styled.div`
  display: inline-block;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  text-transform: capitalize;
  white-space: nowrap;
  margin-right: 5px;
`;

// Predefined colors for specific parts
const PREDEFINED_COLORS: { [key: string]: string } = {
  "part 1": "#b3efb2", // Light Green
  "part 2": "#7a9e7e", // Muted Green
  "part 3": "#31493c", // Dark Green
  "part 4": "#356240", // Dark Green
};

// Function to generate color based on text
function generateColor(text: string, useLightPalette: boolean, forBg: boolean) {
  const normalizedText = text.trim().toLowerCase();

  // if (PREDEFINED_COLORS[normalizedText]) {
  //   return PREDEFINED_COLORS[normalizedText];
  // }

  return generateColorFromText(text, useLightPalette, forBg);
}

// Function to generate color from text
function generateColorFromText(
  text: string,
  useLightPalette: boolean,
  forBg: boolean
) {
  if (text.length < 2 || BASE_COLORS.length === 0) return "#ccc"; // Fallback color

  const char1 = text.charCodeAt(0);
  const char2 = text.charCodeAt(1);
  const index = (char1 + char2) % BASE_COLORS.length;

  let [r, g, b] = forBg ? BASE_COLORS[index].bg : BASE_COLORS[index].text;

  // Apply pastel effect if needed (mix with white)
  if (useLightPalette) {
    r = Math.round(r + (255 - r) * 0.5);
    g = Math.round(g + (255 - g) * 0.5);
    b = Math.round(b + (255 - b) * 0.5);
  }

  return `rgb(${r}, ${g}, ${b})`;
}

// Predefined base colors with high contrast text colors
// Predefined base colors with adjusted high contrast text colors
const BASE_COLORS = [
  { bg: [255, 235, 178], text: [66, 47, 0] },
  { bg: [208, 230, 242], text: [7, 35, 50] },
  { bg: [248, 200, 220], text: [58, 0, 23] },
  { bg: [230, 230, 250], text: [3, 3, 54] },
  { bg: [255, 218, 185], text: [66, 26, 0] },
  { bg: [245, 197, 66], text: [63, 44, 4] },
  { bg: [200, 230, 201], text: [14, 43, 15] },
  { bg: [165, 214, 167], text: [14, 43, 15] },
  { bg: [255, 204, 188], text: [66, 8, 0] },
  { bg: [195, 177, 225], text: [24, 11, 45] },
  { bg: [178, 235, 242], text: [1, 49, 55] },
  { bg: [255, 235, 238], text: [66, 0, 1] },
  { bg: [197, 225, 165], text: [30, 47, 9] },
  { bg: [174, 213, 129], text: [30, 47, 9] },
  { bg: [255, 204, 128], text: [66, 36, 0] },
  { bg: [248, 187, 208], text: [59, 0, 19] },
  { bg: [179, 157, 219], text: [23, 11, 46] },
];
