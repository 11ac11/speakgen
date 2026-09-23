"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";
import { Notice } from "@/app/components/ui/Notice";

/**
 * Making, copying and stopping the share link for one exam or practice.
 *
 * Shared by the exam and practice pages, where it opens under the header, and
 * the dashboard, where it opens in a dialog from a card's menu. The dashboard
 * does not know whether a link exists, so leaving `initialPath` undefined
 * makes the panel ask; the pages already know, and pass it.
 */

const Body = styled.div`
  color: var(--text-body);

  h2 {
    font-size: var(--text-lg);
    margin: 0 0 0.3rem;
  }

  /* The panel's own paragraphs only: a descendant rule turned the amber
     notice's text grey. */
  > p {
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
    min-height: var(--control-height);
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

/* The warning, then the choice under it: read what happens, then decide. The
   amber box is the one the forms use for "before you can save", which is the
   same kind of message — nothing has gone wrong, but read this first. */
const ConfirmStep = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.9rem;
`;

const ErrorText = styled.p`
  && {
    color: var(--danger);
    margin: 0.6rem 0 0;
  }
`;

const noSubscription = () => () => {};

export type ShareKind = "exam" | "practice";

export default function SharePanel({
  kind,
  id,
  title,
  initialPath,
  onChange
}: {
  kind: ShareKind;
  id: number;
  /** Names what is being shared, where the panel stands on its own. */
  title?: string;
  /** The live link's path, null for none, undefined to look it up. */
  initialPath?: string | null;
  /** Told when a link is made or stopped, so a caller can relabel itself. */
  onChange?: (path: string | null) => void;
}) {
  const [path, setPath] = useState<string | null | undefined>(initialPath);
  const [busy, setBusy] = useState<"share" | "revoke" | null>(null);
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

  const target = `kind=${kind}&id=${id}`;

  useEffect(() => {
    if (initialPath !== undefined) return;
    let cancelled = false;

    fetch(`/api/share-links?${target}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((body) => {
        if (!cancelled) setPath(body.path ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setPath(null);
          setError("Could not check for an existing link.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialPath, target]);

  const update = (next: string | null) => {
    setPath(next);
    onChange?.(next);
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
      update(body.path);
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
      update(null);
      setConfirmRevoke(false);
    } catch {
      setError("Could not stop sharing. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const shareUrl = path ? `${origin}${path}` : "";

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
    <Body>
      <h2>Share with students</h2>
      {title ? <p style={{ marginTop: "-0.1rem" }}>{title}</p> : null}

      {path === undefined ? (
        <p>Checking for a link…</p>
      ) : path ? (
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
            <ConfirmStep>
              <Notice>
                <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                  Stop sharing this link?
                </p>
                <p>
                  Anyone using this link will lose access straight away. Sharing
                  again makes a new link, so the old one stays dead.
                </p>
              </Notice>
              <Confirm style={{ marginTop: 0 }}>
                <Button
                  text="Keep sharing"
                  secondary
                  onClick={() => setConfirmRevoke(false)}
                />
                <Button
                  text={busy === "revoke" ? "Stopping…" : "Stop sharing"}
                  danger
                  disabled={busy === "revoke"}
                  onClick={revoke}
                />
              </Confirm>
            </ConfirmStep>
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
    </Body>
  );
}
