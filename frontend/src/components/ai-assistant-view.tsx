"use client";

import { useState } from "react";
import { Send, Bot, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api";

type ChatEntry = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "What chores are pending?",
  "What's on the grocery list?",
  "What's our budget this month?",
  "Any upcoming events?",
];

export function AiAssistantView() {
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      role: "assistant",
      text: "Hi! Ask me about chores, grocery, pantry, calendar, budget, notes, or health.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send(message: string) {
    if (!message.trim() || sending) return;
    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setSending(true);
    try {
      const res = await apiPost<{ reply: string }>("/api/ai-assistant/chat", { message });
      setMessages((m) => [...m, { role: "assistant", text: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Sorry, I couldn't reach the MorusuHQ API." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 max-h-[50vh] overflow-y-auto py-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 text-sm ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && <Bot className="size-5 shrink-0 text-primary/70" />}
              <p
                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {m.text}
              </p>
              {m.role === "user" && <User className="size-5 shrink-0 text-muted-foreground" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
            {s}
          </Button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask MorusuHQ anything…"
        />
        <Button type="submit" disabled={sending}>
          <Send />
        </Button>
      </form>
    </div>
  );
}
