"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import type { Model } from "@/lib/models";
import { modelAvatar } from "@/lib/models";
import { getMessages, sendMessage, type ChatMessage } from "@/app/actions/chat";

export function ChatShell({
  models,
  initialModelId,
  initialMessages,
}: {
  models: Model[];
  initialModelId: string;
  initialMessages: ChatMessage[];
}) {
  const [activeId, setActiveId] = useState(initialModelId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const listEnd = useRef<HTMLDivElement>(null);
  const active = models.find((m) => m.id === activeId) ?? models[0];

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function switchModel(id: string) {
    setActiveId(id);
    setError(null);
    startTransition(async () => {
      setMessages(await getMessages(id));
    });
  }

  function submit() {
    const content = text.trim();
    if (!content || pending) return;
    setText("");
    setError(null);
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content,
      created_at: new Date().toISOString(),
      flagged: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    startTransition(async () => {
      const res = await sendMessage(activeId, content);
      if (res.error) {
        setError("Message non envoyé — réessaie dans un instant.");
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          role: "model",
          content: res.reply ?? "",
          created_at: new Date().toISOString(),
          flagged: Boolean(res.flagged),
        },
      ]);
    });
  }

  return (
    <div className="flex h-[calc(100vh-0px)] max-h-[800px] overflow-hidden rounded-2xl border border-neutral-200">
      <aside className="w-20 shrink-0 overflow-y-auto border-r border-neutral-200 sm:w-56">
        <ul>
          {models.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => switchModel(m.id)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${
                  m.id === activeId ? "bg-neutral-100" : ""
                }`}
              >
                <Image
                  src={modelAvatar(m)}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                  unoptimized
                />
                <span className="hidden truncate text-sm font-medium sm:inline">{m.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
          <Image
            src={modelAvatar(active)}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
            unoptimized
          />
          <b className="text-sm">{active.name}</b>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <p className="mt-10 text-center text-sm text-neutral-400">
              Dis bonjour à {active.name} 👋
            </p>
          )}
          <ul className="space-y-2">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  {m.content}
                </p>
              </li>
            ))}
          </ul>
          <div ref={listEnd} />
        </div>

        {error && <p className="px-4 text-xs text-red-600">{error}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex gap-2 border-t border-neutral-200 p-3"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Écris à ${active.name}…`}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Envoyer
          </button>
        </form>
      </section>
    </div>
  );
}
