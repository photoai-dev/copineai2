"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import type { Model } from "@/lib/models";
import { modelAvatar } from "@/lib/models";
import {
  getMessages,
  getModelGallery,
  sendMessage,
  type ChatMessage,
  type GalleryItem,
} from "@/app/actions/chat";

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
  const [sexyOn, setSexyOn] = useState(false);
  const [confirmSexy, setConfirmSexy] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[] | null>(null);
  const [galleryZoom, setGalleryZoom] = useState<GalleryItem | null>(null);
  const listEnd = useRef<HTMLDivElement>(null);
  const active = models.find((m) => m.id === activeId) ?? models[0];

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function switchModel(id: string) {
    setActiveId(id);
    setError(null);
    setSexyOn(false);
    setConfirmSexy(false);
    setGalleryItems(null);
    startTransition(async () => {
      setMessages(await getMessages(id));
    });
  }

  // Le bouton "Mode sexy" ne l'active pas directement : la compagne demande d'abord une
  // confirmation (un seul message, affiché localement — jamais envoyé comme vrai message).
  function toggleSexy() {
    if (sexyOn) {
      setSexyOn(false);
      setConfirmSexy(false);
      return;
    }
    setConfirmSexy(true);
  }

  function confirmSexyYes() {
    setSexyOn(true);
    setConfirmSexy(false);
  }

  function confirmSexyNo() {
    setConfirmSexy(false);
  }

  function openGallery() {
    setGalleryOpen(true);
    if (galleryItems === null) {
      startTransition(async () => {
        setGalleryItems(await getModelGallery(activeId));
      });
    }
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
      const res = await sendMessage(activeId, content, sexyOn);
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
          media_url: res.media_url ?? null,
          media_kind: res.media_kind ?? null,
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
          <b className="flex-1 text-sm">{active.name}</b>
          <button
            type="button"
            onClick={openGallery}
            className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Galerie média
          </button>
          <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={sexyOn}
              onChange={toggleSexy}
              className="h-3.5 w-3.5 accent-neutral-900"
            />
            Mode sexy
          </label>
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
                <div
                  className={`max-w-[75%] space-y-1.5 rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  {m.media_url &&
                    (m.media_kind === "video" ? (
                      <video src={m.media_url} controls className="max-h-72 w-full rounded-xl" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.media_url}
                        alt=""
                        className="max-h-72 w-full rounded-xl object-cover"
                      />
                    ))}
                  {m.content && <p>{m.content}</p>}
                </div>
              </li>
            ))}
          </ul>
          {confirmSexy && (
            <div className="mt-3 flex justify-start">
              <div className="max-w-[75%] space-y-2 rounded-2xl bg-neutral-100 px-3.5 py-2 text-sm text-neutral-900">
                <p>Tu es sur le point d&apos;activer le mode coquin, tu confirmes ?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={confirmSexyYes}
                    className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white"
                  >
                    Je confirme
                  </button>
                  <button
                    type="button"
                    onClick={confirmSexyNo}
                    className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-700"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
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

      {galleryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => {
            setGalleryOpen(false);
            setGalleryZoom(null);
          }}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <b className="text-sm">Galerie média — {active.name}</b>
              <button
                type="button"
                onClick={() => {
                  setGalleryOpen(false);
                  setGalleryZoom(null);
                }}
                className="text-sm text-neutral-500 hover:text-neutral-900"
              >
                Fermer
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {galleryItems === null ? (
                <p className="py-10 text-center text-sm text-neutral-400">Chargement…</p>
              ) : galleryItems.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-400">
                  Aucun média disponible pour l&apos;instant.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {galleryItems.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setGalleryZoom(it)}
                      className="aspect-square overflow-hidden rounded-lg bg-neutral-100"
                    >
                      {it.kind === "video" ? (
                        <video src={it.url} className="h-full w-full object-cover" muted />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.url} alt="" className="h-full w-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {galleryZoom && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
              onClick={(e) => {
                e.stopPropagation();
                setGalleryZoom(null);
              }}
            >
              {galleryZoom.kind === "video" ? (
                <video src={galleryZoom.url} controls autoPlay className="max-h-full max-w-full rounded-lg" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={galleryZoom.url} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
