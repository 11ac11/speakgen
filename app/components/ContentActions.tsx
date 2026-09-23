"use client";

import React, { useState, useSyncExternalStore } from "react";
import NextLink from "next/link";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";

/**
 * What a teacher can do with an exam or a practice from its own page: take it
 * away on paper, and hand it to a class as a link.
 *
 * Both live here rather than behind the dashboard's kebab, because the page is
 * where a teacher is when they decide to use something with a class.
 */

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

/* The secondary-button shape as a real link, for the upgrade path: it
   navigates, so it is an anchor, as ExamsLink explains. */
const UpgradeLink = styled(NextLink)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  padding: 0.6rem 1.1rem;
  border-radius: var(--radius-control);
  border: 1.5px dashed var(--green-edge);
  color: var(--text-muted);
  font-size: var(--text-sm);
  font-weight: 500;

  span {
    padding: 0.05rem 0.45rem;
    border-radius: var(--radius-pill);
    background: var(--green-tint);
    color: var(--green-600);
    font-size: var(--text-xs);
    font-weight: 600;
  }

  &:hover {
    color: var(--text-body);
    border-color: var(--leafgreen);
  }
`;

const Panel = styled.div`
  width: 100%;
  margin-top: 1rem;
  padding: 1.1rem 1.25rem;
  border-radius: var(--radius-card);
  color: var(--text-body);

  h2 {
    font-size: var(--text-lg);
    margin: 0 0 0.3rem;
  }

  p {
    margin: 0 0 0.9rem;
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
`;

const LinkRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;

  input {
    flex: 1;
    min-width: 0;
    min-height: 44px;
    font-family: inherit;
    font-size: var(--text-sm);
    color: var(--text-body);
    background: #fff;
    padding: 0.55rem 0.7rem;
    border: 1.5px solid var(--field-edge);
    border-radius: var(--radius-control);
  }

  @media (max-width: 560px) {
    input {
      flex-basis: 100%;
    }
  }
`;

const Confirm = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 0.9rem;
  font-size: var(--text-sm);
`;

const ErrorText = styled.p`
  && {
    color: var(--danger);
    margin: 0.6rem 0 0;
  }
`;

const noSubscription = () => () => {};

export type PdfAccess = "allowed" | "upgrade" | "hidden";

type Props = {
  kind: "exam" | "practice";
  id: number;
  pdf: PdfAccess;
  /** Only the author or their school may share, as only they may edit. */
  canShare: boolean;
  initialSharePath: string | null;
  /** Rendered after the built-in actions, such as the Edit link. */
  children?: React.ReactNode;
};

export default function ContentActions({
  kind,
  id,
  pdf,
  canShare,
  initialSharePath,
  children
}: Props) {
  const [sharePath, setSharePath] = useState(initialSharePath);
  const [shareOpen, setShareOpen] = useState(false);
  const [busy, setBusy] = useState<"pdf" | "share" | "revoke" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  // The origin is the browser's, read on the client rather than guessed on the
  // server, which may sit behind a proxy with another host. Empty while
  // rendering on the server, so hydration matches.
  const origin = useSyncExternalStore(
    noSubscription,
    () => window.location.origin,
    () => ""
  );

  const shareUrl = sharePath ? `${origin}${sharePath}` : "";
  const target = `kind=${kind}&id=${id}`;

  /* Fetched rather than linked: a script with photographs takes a few seconds
     to build, and a bare link gives no sign anything is happening, so teachers
     click it again. */
  const downloadPdf = async () => {
    setBusy("pdf");
    setError(null);
    try {
      const res = await fetch(`/api/${kind}s/${id}/pdf`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Could not make the PDF. Please try again.");
        return;
      }
      const filename =
        /filename="([^"]+)"/.exec(
          res.headers.get("Content-Disposition") ?? ""
        )?.[1] ?? `${kind}.pdf`;
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setError("Could not make the PDF. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    setBusy("share");
    setError(null);
    try {
      const res = await fetch(`/api/share-links?${target}`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.path) {
        setError(body?.error ?? "Could not make a link. Please try again.");
        return;
      }
      setSharePath(body.path);
    } catch {
      setError("Could not make a link. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const revoke = async () => {
    setBusy("revoke");
    setError(null);
    try {
      const res = await fetch(`/api/share-links?${target}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Could not stop sharing. Please try again.");
        return;
      }
      setSharePath(null);
      setConfirmRevoke(false);
    } catch {
      setError("Could not stop sharing. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the link is selectable in the field.
      setError("Could not copy. Select the link and copy it instead.");
    }
  };

  const noun = kind === "exam" ? "exam" : "practice";

  return (
    <>
      <Row>
        {pdf === "allowed" ? (
          <Button
            text={busy === "pdf" ? "Preparing PDF…" : "Download PDF"}
            secondary
            disabled={busy === "pdf"}
            onClick={downloadPdf}
          />
        ) : pdf === "upgrade" ? (
          <UpgradeLink href="/pricing" title="PDF export is part of Pro">
            Download PDF <span>Pro</span>
          </UpgradeLink>
        ) : null}

        {canShare ? (
          <Button
            text={sharePath ? "Shared" : "Share"}
            secondary
            onClick={() => setShareOpen((open) => !open)}
          />
        ) : null}

        {children}
      </Row>

      {error && !shareOpen ? <ErrorText role="alert">{error}</ErrorText> : null}

      {canShare && shareOpen ? (
        <Panel className="glass">
          <h2>Share with students</h2>
          {sharePath ? (
            <>
              <p>
                {kind === "exam"
                  ? "Anyone with this link can run this exam without an account. It opens nothing else of yours."
                  : "Anyone with this link can run this practice without an account, and gets their own random set each time. It opens nothing else of yours."}
              </p>
              <LinkRow>
                <input
                  readOnly
                  value={shareUrl}
                  aria-label={`Share link for this ${noun}`}
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button
                  text={copied ? "Copied" : "Copy link"}
                  onClick={copy}
                  disabled={!shareUrl}
                />
              </LinkRow>
              {confirmRevoke ? (
                <Confirm>
                  <span>
                    Anyone using this link will lose access. Sharing again makes
                    a new link.
                  </span>
                  <Button
                    text="Keep sharing"
                    secondary
                    onClick={() => setConfirmRevoke(false)}
                  />
                  <Button
                    text={busy === "revoke" ? "Stopping…" : "Stop sharing"}
                    disabled={busy === "revoke"}
                    onClick={revoke}
                  />
                </Confirm>
              ) : (
                <Confirm>
                  <Button
                    text="Stop sharing"
                    secondary
                    onClick={() => setConfirmRevoke(true)}
                  />
                </Confirm>
              )}
            </>
          ) : (
            <>
              <p>
                {`Make a private link a class can open without signing up. Only this ${noun} is shared, and you can stop the link working at any time.`}
              </p>
              <Button
                text={busy === "share" ? "Making link…" : "Create link"}
                disabled={busy === "share"}
                onClick={share}
              />
            </>
          )}
          {error ? <ErrorText role="alert">{error}</ErrorText> : null}
        </Panel>
      ) : null}
    </>
  );
}
