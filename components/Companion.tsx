"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
}

const TOOL_LABEL: Record<string, string> = {
  rank_nights: "upcoming nights",
  next_dark_window: "the next dark window",
  whats_up: "tonight's sky",
  star_lore: "star lore",
  list_sites: "host families",
};

const EXAMPLES = [
  "When is the next great night to come?",
  "What can I see in the sky tonight?",
  "Tell me the story of Suhail",
  "Find me a host family for 4 people",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hello. I can help you plan a night under the dark sky at Al Qua'a, tell you what is up there and the old names for it, and point you to a host family. What would you like to know?",
};

export default function Companion({ live, compact = false }: { live: boolean; compact?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m !== GREETING).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((cur) => [
        ...cur,
        { role: "assistant", content: data.reply || "Sorry, I could not answer that.", toolsUsed: data.toolsUsed },
      ]);
    } catch {
      setMessages((cur) => [
        ...cur,
        { role: "assistant", content: "Something went wrong just now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "" : "mt-8"}>
      {!live && !compact && (
        <p className="mb-4 rounded-md border border-sage/20 bg-raised/60 px-4 py-3 font-body text-sm leading-relaxed text-sage-light">
          The companion answers fully once the guide is connected. Until then it still gives you
          a real, calculated answer to get started.
        </p>
      )}

      <div className={`panel flex flex-col ${compact ? "h-full rounded-none border-0" : "h-[34rem]"}`}>
        {/* conversation */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              <div className={m.role === "user" ? "max-w-[85%]" : "max-w-[90%]"}>
                {m.role === "assistant" && (
                  <div className="mb-1 font-body text-sm text-brass smallcaps">Anwa</div>
                )}
                <div
                  className={
                    m.role === "user"
                      ? "rounded-md border border-sage/25 bg-observatory/70 px-4 py-2.5 font-body text-[1.02rem] leading-relaxed text-bone"
                      : "font-body text-[1.08rem] leading-relaxed text-bone"
                  }
                >
                  {m.content}
                </div>
                {m.toolsUsed && m.toolsUsed.length > 0 && (
                  <div className="mt-1.5 font-body text-xs text-sage">
                    checked {m.toolsUsed.map((t) => TOOL_LABEL[t] || t).join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="font-body text-[1.02rem] text-accent-bright">looking it up...</div>
          )}
          <div ref={endRef} />
        </div>

        {/* example prompts (only before the first question) */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 border-t border-sage/15 px-5 py-3 sm:px-6">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => send(ex)}
                className="rounded border border-sage/25 px-3 py-1.5 text-left font-body text-sm text-bone-muted transition-colors hover:border-sage/50 hover:text-bone"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-3 border-t border-sage/15 p-3 sm:p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the sky, a star, or a host family..."
            className="flex-1 bg-transparent px-2 py-2 font-body text-[1.02rem] text-bone outline-none placeholder:text-sage"
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn">
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
