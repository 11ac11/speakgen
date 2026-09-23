/**
 * Two chain links: "a share link is active". One drawing, used by the dashboard
 * card's badge and the exam and practice page's Share button, so the two
 * places that say a link is active look like they are saying the same thing.
 */
export default function LinkIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <path
        d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
