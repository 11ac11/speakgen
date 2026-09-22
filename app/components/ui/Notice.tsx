import React from "react";
import styled from "styled-components";

const Box = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  width: 100%;
  box-sizing: border-box;
  padding: 0.9rem 1.1rem;
  /* The control radius, not the card one: this sits against inputs and buttons
     rather than standing on its own. */
  border-radius: var(--radius-control);
  border: 1.5px solid var(--warn-edge);
  background: var(--warn-bg);
  color: var(--warn-text);
  font-size: var(--text-sm);
  line-height: 1.5;

  svg {
    flex: none;
    width: 18px;
    height: 18px;
    margin-top: 0.1rem;
  }

  p {
    margin: 0;
    color: var(--warn-text);
    font-size: var(--text-sm);
  }

  ul {
    margin: 0;
    padding-left: 1.1rem;
    list-style: disc;
  }

  li {
    color: var(--warn-text);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  li::marker {
    color: var(--warn-edge);
  }
`;

const Title = styled.p`
  font-weight: 600;
  margin-bottom: 0.3rem !important;
`;

/**
 * Why you cannot do the thing yet.
 *
 * A disabled button is a dead end on its own: it says no and not why, and the
 * commonest reason across these forms — no name yet — is invisible, because an
 * empty text box looks the same as one you have decided not to fill.
 *
 * Amber rather than red. Nothing has gone wrong; the form is waiting. Red is
 * for a save that failed, which these forms also have and which should not look
 * the same as this.
 */
export const Notice = ({
  title,
  reasons,
  children
}: {
  /** One line above the list, where a list needs introducing. */
  title?: string;
  /** The things standing in the way. One is printed as a sentence. */
  reasons?: string[];
  children?: React.ReactNode;
}) => {
  const list = reasons?.filter(Boolean) ?? [];
  if (!children && list.length === 0) return null;

  return (
    <Box role="status">
      {/* A triangle as well as a colour: the box has to read as a caution to
          somebody who cannot tell amber from grey. */}
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3.8 2.6 20h18.8L12 3.8Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M12 9.6v4.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16.9" r="1.05" fill="currentColor" />
      </svg>
      <div>
        {children ?? (
          <>
            {title && list.length > 1 ? <Title>{title}</Title> : null}
            {list.length === 1 ? (
              <p>{list[0]}</p>
            ) : (
              <ul>
                {list.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </Box>
  );
};

export default Notice;
