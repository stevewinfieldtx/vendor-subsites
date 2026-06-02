"use client";

/**
 * AI advisor launcher + panel. Calls our own /api/advisor route, which proxies
 * to TDE /agent/query so the TDE key stays server-side. Grounded answers only.
 */
import { useRef, useState } from "react";

interface Msg {
  role: "user" | "advisor";
  text: string;
}

export function Advisor({
  collections,
  productName,
  resellerName,
}: {
  collections: string;
  productName: string;
  resellerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "advisor",
      text: `Hi — I can answer questions about ${productName} and how ${resellerName} delivers it. What are you trying to solve?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send() {
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, collections }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      setMessages((m) => [
        ...m,
        {
          role: "advisor",
          text:
            data.answer ??
            "I couldn't reach the knowledge base just now. Please try again, or book a call and a specialist will follow up.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "advisor", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      });
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open the AI advisor"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
        style={{
          background: "var(--vsn-primary)",
          color: "#fff",
          borderRadius: "999px",
        }}
      >
        <span aria-hidden>✦</span>
        {open ? "Close advisor" : "Ask the AI advisor"}
      </button>

      {open ? (
        <div
          className="fixed bottom-20 right-5 z-50 flex w-[min(92vw,380px)] flex-col overflow-hidden shadow-2xl"
          style={{
            background: "var(--vsn-surface)",
            border: "1px solid color-mix(in oklab, var(--vsn-ink) 12%, transparent)",
            borderRadius: "calc(var(--vsn-radius) + 4px)",
            maxHeight: "70vh",
          }}
        >
          <div
            className="px-4 py-3 text-sm font-semibold"
            style={{
              background: "var(--vsn-secondary)",
              color: "#fff",
            }}
          >
            Solution advisor
          </div>
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className="max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed"
                style={{
                  marginLeft: m.role === "user" ? "auto" : undefined,
                  background:
                    m.role === "user"
                      ? "var(--vsn-primary)"
                      : "var(--vsn-surface-alt)",
                  color: m.role === "user" ? "#fff" : "var(--vsn-ink)",
                  borderRadius: "var(--vsn-radius)",
                }}
              >
                {m.text}
              </div>
            ))}
            {busy ? (
              <div className="text-xs" style={{ color: "var(--vsn-ink-muted)" }}>
                Thinking…
              </div>
            ) : null}
          </div>
          <div
            className="flex items-center gap-2 p-3"
            style={{ borderTop: "1px solid color-mix(in oklab, var(--vsn-ink) 10%, transparent)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about fit, deployment, pricing…"
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
              style={{ color: "var(--vsn-ink)" }}
            />
            <button
              onClick={send}
              disabled={busy}
              className="px-3 py-2 text-sm font-semibold disabled:opacity-50"
              style={{
                background: "var(--vsn-primary)",
                color: "#fff",
                borderRadius: "var(--vsn-radius)",
              }}
            >
              Send
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
