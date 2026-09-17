import styled, { css } from "styled-components";

const TextSection = styled.div`
  padding: 2px 9px;
`;

const RemoveBox = styled.div`
  padding: 0 0.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  & svg {
    width: 12px;
  }
`;

// Styled component for the pill
const StyledPill = styled.div<{ $showHoverEffect: boolean; $shadow: string }>`
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;
  /* Wraps rather than colliding when a question carries several themes. */
  margin: 0 5px 4px 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition:
    transform 0.12s var(--lift),
    box-shadow 0.12s ease,
    filter 0.12s ease;

  /* A clickable pill behaves like a button: it sits on a hard shadow in its
     own darker ink and lifts on hover. A pill that is only a label stays flat,
     so nothing looks clickable that is not. */
  ${({ $showHoverEffect, $shadow }) => css`
    ${
      $showHoverEffect &&
      `
      cursor: pointer;
      box-shadow: 0 3px 0 0 ${$shadow};

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 0 0 ${$shadow};
        filter: brightness(1.04);
      }

      &:active {
        transform: translateY(1px);
        box-shadow: 0 1px 0 0 ${$shadow};
      }
    `
    }
  `}
`;

export default function Pill({
  className,
  bgColor,
  textColor,
  text,
  onClick,
  showRemove,
  style
}: {
  className?: string;
  bgColor?: string;
  textColor?: string;
  text: string;
  onClick?: () => void;
  showRemove?: boolean;
  style?: any; // todo change
}) {
  const backgroundColor = bgColor ? bgColor : generateColor(text, true);
  const _textColor = textColor ? textColor : generateColor(text, false);
  // Derived rather than configured: a nineteenth theme gets a correct shadow
  // without anyone adding a hex to constants.ts.
  const shadowColor = darken(backgroundColor, 0.18);

  return (
    <StyledPill
      style={{ ...style, backgroundColor, color: _textColor }}
      onClick={onClick}
      className={className}
      $showHoverEffect={!!onClick}
      $shadow={shadowColor}
    >
      <TextSection>{text}</TextSection>
      {showRemove && (
        <RemoveBox style={{ borderLeft: `1px solid ${_textColor}` }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.59 7.1 5.7a1 1 0 1 0-1.4 1.42L10.59 12l-4.9 4.88a1 1 0 1 0 1.42 1.42L12 13.41l4.88 4.89a1 1 0 0 0 1.42-1.42L13.41 12l4.89-4.88a1 1 0 0 0 0-1.42z" />
          </svg>
        </RemoveBox>
      )}
    </StyledPill>
  );
}

/**
 * Mixes a colour towards black by `amount`, for the hard shadow a pill sits on.
 * Anything it cannot parse falls back to a neutral, so a bad value is a dull
 * pill rather than a broken one.
 */
function darken(color: string, amount: number) {
  const hex = color.trim().replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;

  if (!/^[0-9a-f]{6}$/i.test(full)) return "rgba(0, 0, 0, 0.18)";

  const channels = [0, 2, 4].map((i) =>
    Math.round(parseInt(full.slice(i, i + 2), 16) * (1 - amount))
  );

  return `rgb(${channels.join(", ")})`;
}

// Function to generate color based on text
function generateColor(text: string, forBg: boolean) {
  return generateColorFromText(text, forBg);
}

// Function to generate color from text
function generateColorFromText(text: string, forBg: boolean) {
  if (text.length < 2 || BASE_COLORS.length === 0) return "#ccc"; // Fallback color

  const char1 = text.charCodeAt(0);
  const char2 = text.charCodeAt(1);
  const index = (char1 + char2) % BASE_COLORS.length;

  const [r, g, b] = forBg ? BASE_COLORS[index].bg : BASE_COLORS[index].text;

  return `rgb(${r}, ${g}, ${b})`;
}

// Predefined base colors with high contrast text colors
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
  { bg: [179, 157, 219], text: [23, 11, 46] }
];
