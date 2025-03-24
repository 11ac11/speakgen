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
    () => generateColor(text, useLightPalette),
    [text, useLightPalette]
  );

  return <StyledPill style={{ backgroundColor }}>{text}</StyledPill>;
}

// Styled component for the pill
const StyledPill = styled.div`
  display: inline-block;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
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

// Function to generate color based on text (with predefined mappings)
function generateColor(text: string, useLightPalette: boolean) {
  // Normalize text (case-insensitive check for parts)
  const normalizedText = text.trim().toLowerCase();

  // Check for predefined part mappings
  if (PREDEFINED_COLORS[normalizedText]) {
    let color = PREDEFINED_COLORS[normalizedText];

    // Lighten if needed
    if (useLightPalette) {
      color = lightenColor(color);
    }

    return color;
  }

  // For other text values, generate a color based on the first two characters
  return generateColorFromText(text, useLightPalette);
}

// Function to generate color from first two characters of text
function generateColorFromText(text: string, useLightPalette: boolean) {
  if (text.length < 2) return "#ccc"; // Fallback color

  // Get the first two characters and calculate their ASCII sum
  const char1 = text.charCodeAt(0);
  const char2 = text.charCodeAt(1);
  const index = (char1 + char2) % BASE_COLORS.length;

  // Get the base color from a predefined list
  let [r, g, b] = BASE_COLORS[index];

  // Apply pastel effect if needed
  if (useLightPalette) {
    r = Math.min(255, r + 80);
    g = Math.min(255, g + 80);
    b = Math.min(255, b + 80);
  }

  return `rgb(${r}, ${g}, ${b})`;
}

// Predefined base colors for text-based color generation
const BASE_COLORS = [
  [220, 20, 60], // Crimson
  [30, 144, 255], // Dodger Blue
  [34, 139, 34], // Forest Green
  [255, 165, 0], // Orange
  [128, 0, 128], // Purple
  [255, 69, 0], // Red-Orange
  [0, 128, 128], // Teal
  [218, 112, 214], // Orchid
  [255, 105, 180], // Hot Pink
  [60, 179, 113], // Medium Sea Green
];

// Function to lighten a color (pastel effect)
function lightenColor(hex: string) {
  let r: number, g: number, b: number;

  if (hex.startsWith("#")) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  } else {
    [r, g, b] = hex
      .slice(4, -1)
      .split(",")
      .map((n) => parseInt(n.trim(), 10));
  }

  // Lighten the color by adding to RGB values
  r = Math.min(255, r + 80);
  g = Math.min(255, g + 80);
  b = Math.min(255, b + 80);

  return `rgb(${r}, ${g}, ${b})`;
}
