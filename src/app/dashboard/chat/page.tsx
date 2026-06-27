import { ChatWidget } from "@/components/ChatWidget";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          SpendSense AI Assistant
        </h1>
        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
          Ask questions about your spending — powered by your own transaction history.
        </p>
      </div>
      <ChatWidget />
    </div>
  );
}