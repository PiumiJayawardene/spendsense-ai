"use client";

import { useState, useRef, useEffect } from "react";
import { SendIcon, ChatIcon } from "@/components/ui/Icons";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How much did I spend on transport?",
  "What's my biggest expense category?",
  "Did I receive any income this month?",
];

export function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm SpendSense AI. Ask me anything about your spending — like \"how much did I spend on transport?\" or \"what's my biggest expense category?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendQuestion(question: string) {
    if (!question.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      const answer = res.ok
        ? data.answer
        : data.error ?? "Something went wrong. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error — couldn't reach the server." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(input);
    }
  }

  const showSuggestions = messages.length === 1;

  return (
    <div className="flex h-[600px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-sunken)] px-5 py-3.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
          <ChatIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            SpendSense AI
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Grounded in your own transaction history
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto styled-scrollbar p-5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex animate-fade-in ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-[var(--radius-md)] px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--accent)] text-[var(--accent-on)]"
                  : "bg-[var(--bg-surface-sunken)] text-[var(--text-primary)]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex animate-fade-in justify-start">
            <div className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--bg-surface-sunken)] px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-tertiary)] [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-tertiary)] [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-tertiary)] [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {showSuggestions && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendQuestion(s)}
                className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 border-t border-[var(--border-subtle)] p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask about your spending…"
          className="flex-1 resize-none rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        <button
          onClick={() => sendQuestion(input)}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-on)] transition-all hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}