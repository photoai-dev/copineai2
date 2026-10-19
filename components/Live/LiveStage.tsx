"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Model } from "@/lib/models";
import {
  startLive,
  heartbeatLive,
  closeLive,
  giftOutfit,
  giftSettle,
  type LiveLook,
} from "@/app/actions/live";

// Port du live avatar temps réel (TRTC + canal de contrôle WebSocket Vivix) depuis
// love20/index.html (LV / lvJoin / lvCall...). Le SDK TRTC est chargé depuis le même
// fichier statique que l'ancien site (/_gestion/vendor/trtc.js, servi en asset public,
// jamais modifié) — _gestion lui-même reste figé, on ne fait que charger ce script.
// Simplification volontaire par rapport à l'ancien SPA : page dédiée plutôt qu'incrustée
// dans le fil de chat ; le fil de messages affiché ici est local à la session (comme
// avant : les messages live ne sont jamais écrits dans la table `messages`).

declare global {
  interface Window {
    TRTC?: any;
    _lvTrtcP?: Promise<any>;
  }
}

function loadTRTC(): Promise<any> {
  if (window.TRTC) return Promise.resolve(window.TRTC);
  if (window._lvTrtcP) return window._lvTrtcP;
  window._lvTrtcP = new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = "/_gestion/vendor/trtc.js";
    s.onload = () => (window.TRTC ? ok(window.TRTC) : fail(new Error("SDK vidéo incompatible.")));
    s.onerror = () => fail(new Error("Chargement du SDK vidéo impossible."));
    document.head.appendChild(s);
  });
  return window._lvTrtcP;
}

type LogLine = { who: "user" | "model"; text: string };

export function LiveStage({ model }: { model: Model }) {
  const router = useRouter();
  const videoRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Préparation du live…");
  const [open, setOpen] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [caption, setCaption] = useState("");
  const [log, setLog] = useState<LogLine[]>([]);
  const [text, setText] = useState("");
  const [looks, setLooks] = useState<LiveLook[]>([]);
  const [gifting, setGifting] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const rtcRef = useRef<any>(null);
  const hbRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captionBufRef = useRef("");
  const pendingAcksRef = useRef<Map<string, () => void>>(new Map());
  const switchRef = useRef<{ id: string; outfit: string; gift: boolean; chargeId?: string } | null>(
    null
  );
  const closedRef = useRef(false);

  function waitAck(id: string, ms = 5000) {
    return new Promise<void>((resolve) => {
      let done = false;
      const fin = () => {
        if (done) return;
        done = true;
        pendingAcksRef.current.delete(id);
        resolve();
      };
      pendingAcksRef.current.set(id, fin);
      setTimeout(fin, ms);
    });
  }

  async function endSession(skipServerClose = false) {
    if (closedRef.current) return;
    closedRef.current = true;
    if (hbRef.current) clearInterval(hbRef.current);
    try {
      wsRef.current?.close();
    } catch {}
    try {
      if (rtcRef.current) {
        await rtcRef.current.exitRoom();
        rtcRef.current.destroy();
      }
    } catch {}
    const sid = sessionIdRef.current;
    if (sid && !skipServerClose) {
      try {
        await closeLive(sid);
      } catch {}
    }
    setOpen(false);
    router.push("/app/live/");
  }

  useEffect(() => {
    let cancelled = false;

    async function join() {
      const res = await startLive(model.id);
      if (cancelled) return;
      if (res.error || !res.session_id) {
        const label =
          res.error === "insufficient_credits"
            ? "Pas assez de crédits pour lancer ce live."
            : res.error === "auth"
            ? "Session expirée — reconnecte-toi."
            : `Live indisponible (${res.error ?? res._status ?? "erreur"}).`;
        setStatus(label);
        setTimeout(() => router.push("/app/live/"), 2500);
        return;
      }
      sessionIdRef.current = res.session_id;
      setLooks(res.looks ?? []);

      try {
        const TRTC = await loadTRTC();
        const t = res.delivery?.media?.trtc as any;
        if (!t) throw new Error("Connexion vidéo indisponible.");
        if (!res.control) throw new Error("Connexion vidéo indisponible.");

        const url = new URL(res.control.url);
        url.searchParams.set("token", res.control.client_secret);
        const ws = new WebSocket(url);
        wsRef.current = ws;
        await new Promise<void>((ok, fail) => {
          const to = setTimeout(() => {
            ws.close();
            fail(new Error("Délai de connexion dépassé."));
          }, 15000);
          ws.onopen = () => {
            clearTimeout(to);
            ok();
          };
          ws.onerror = () => {
            clearTimeout(to);
            fail(new Error("Connexion impossible."));
          };
        });
        ws.onclose = () => setStatus("Connexion coupée");
        ws.onmessage = ({ data }) => {
          try {
            const ev = JSON.parse(data);
            if (ev.type === "conversation.item.created" && ev.item && pendingAcksRef.current.has(ev.item.id)) {
              pendingAcksRef.current.get(ev.item.id)!();
            } else if (ev.type === "response.output_text.delta") {
              captionBufRef.current += ev.delta || "";
              setCaption(captionBufRef.current);
            } else if (ev.type === "response.output_text.done") {
              const final = ev.text || captionBufRef.current || "";
              captionBufRef.current = "";
              setCaption("");
              if (final) setLog((l) => [...l, { who: "model", text: final }]);
            } else if (
              ev.type === "response.output_item.done" &&
              ev.item?.type === "function_call" &&
              ev.item.name === "change_outfit"
            ) {
              const item = ev.item;
              let args: { outfit?: string } = {};
              try {
                args = JSON.parse(item.arguments || "{}");
              } catch {}
              const known = (res.looks ?? []).find((l) => l.key === args.outfit);
              const reply = (status: string, extra?: Record<string, unknown>) => {
                const outId = "fcout_" + Date.now();
                ws.send(
                  JSON.stringify({
                    type: "conversation.item.create",
                    event_id: outId,
                    item: {
                      id: outId,
                      type: "function_call_output",
                      call_id: item.call_id,
                      output: JSON.stringify({ status, outfit: args.outfit, ...extra }),
                    },
                  })
                );
                waitAck(outId).then(() => {
                  ws.send(JSON.stringify({ type: "response.create", response: { scheduling_policy: "interrupt" } }));
                });
              };
              if (!known) {
                reply("failed", { reason: "unknown_outfit" });
                return;
              }
              const evId = "switch_" + Date.now();
              switchRef.current = { id: evId, outfit: args.outfit!, gift: false };
              ws.send(JSON.stringify({ event_id: evId, type: "session.update", session: { source_image_id: args.outfit } }));
              setTimeout(() => {
                if (switchRef.current?.id === evId) {
                  switchRef.current = null;
                  reply("failed", { reason: "timeout" });
                }
              }, 8000);
            } else if (ev.type === "session.update.done" && switchRef.current?.id === ev.request_event_id) {
              const p = switchRef.current;
              switchRef.current = null;
              const ok = ev.status === "completed";
              if (p?.gift) {
                giftSettle(p.chargeId!, ok).catch(() => {});
                setGifting(null);
              }
            }
          } catch {}
        };

        const rtc = TRTC.create();
        rtcRef.current = rtc;
        rtc.on(TRTC.EVENT.ERROR, (e: any) => setStatus(String(e?.message || e)));
        rtc.on(TRTC.EVENT.AUTOPLAY_FAILED, ({ resume }: any) => {
          setStatus("Clique sur la vidéo pour activer le son");
          const el = videoRef.current;
          if (el)
            el.onclick = () => {
              resume?.();
              setStatus("");
            };
        });
        rtc.on(TRTC.EVENT.REMOTE_VIDEO_AVAILABLE, ({ userId, streamType }: any) => {
          if (userId !== t.publisher_user_id) return;
          rtc.startRemoteVideo({ userId, streamType, view: "lv-video" }).catch((e: any) => setStatus(String(e?.message || e)));
        });
        rtc.on(TRTC.EVENT.FIRST_VIDEO_FRAME, ({ userId }: any) => {
          if (userId === t.publisher_user_id) setStatus("");
        });

        await rtc.enterRoom({
          sdkAppId: Number(t.sdk_app_id),
          userId: t.user_id,
          userSig: t.user_sig,
          strRoomId: t.room_id,
          scene: TRTC.TYPE.SCENE_RTC,
          autoReceiveVideo: false,
        });

        if (cancelled) return;
        setOpen(true);
        setStatus("");
        hbRef.current = setInterval(async () => {
          const sid = sessionIdRef.current;
          if (!sid) return;
          const r = await heartbeatLive(sid);
          if (r.error === "insufficient_credits" || r.closed) {
            setStatus("Crédits épuisés — le live est terminé");
            endSession(true);
          }
        }, 50000);
      } catch (e) {
        setStatus("Live indisponible : " + String((e as Error)?.message || e));
        setTimeout(() => endSession(true), 2500);
      }
    }

    void join();
    return () => {
      cancelled = true;
      void endSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.id]);

  async function toggleMic() {
    const rtc = rtcRef.current;
    if (!rtc) return;
    try {
      if (micOn) {
        await rtc.stopLocalAudio();
        setMicOn(false);
      } else {
        await rtc.startLocalAudio({ option: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        setMicOn(true);
      }
    } catch (e) {
      setStatus("Micro indisponible : " + String((e as Error)?.message || e));
    }
  }

  async function sendInline() {
    const content = text.trim();
    const ws = wsRef.current;
    if (!content || !ws || ws.readyState !== 1) return;
    setText("");
    setLog((l) => [...l, { who: "user", text: content }]);
    const id = "msg_" + Date.now();
    ws.send(
      JSON.stringify({ type: "conversation.item.create", event_id: id, item: { id, type: "message", role: "user", content: [{ type: "input_text", text: content }] } })
    );
    await waitAck(id);
    ws.send(JSON.stringify({ type: "response.create", response: { scheduling_policy: "interrupt" } }));
  }

  async function gift(key: string) {
    const sid = sessionIdRef.current;
    const ws = wsRef.current;
    if (!sid || !ws || gifting) return;
    const look = looks.find((l) => l.key === key);
    if (!look) return;
    setGifting(key);
    const r = await giftOutfit(sid, key);
    if (r.error || !r.ok) {
      setGifting(null);
      setStatus(r.error === "insufficient_credits" ? "Pas assez de crédits pour ce cadeau" : "Cadeau indisponible");
      return;
    }
    if (!r.charge_id) {
      setGifting(null);
      return;
    }
    const evId = "gift_" + Date.now();
    switchRef.current = { id: evId, outfit: key, gift: true, chargeId: r.charge_id };
    ws.send(JSON.stringify({ event_id: evId, type: "session.update", session: { source_image_id: key } }));
    setTimeout(() => {
      if (switchRef.current?.id === evId) {
        switchRef.current = null;
        giftSettle(r.charge_id!, false).catch(() => {});
        setGifting(null);
      }
    }, 8000);
  }

  const gifts = looks.filter((l) => l.credits > 0);

  return (
    <div className="mx-auto max-w-lg">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black">
        <div id="lv-video" ref={videoRef} className="absolute inset-0 h-full w-full" />
        {!open && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white">
            {status || "Connexion…"}
          </div>
        )}
        {caption && (
          <p className="absolute bottom-16 left-3 right-3 rounded-lg bg-black/60 px-3 py-2 text-sm text-white">
            {caption}
          </p>
        )}
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            type="button"
            onClick={toggleMic}
            className="rounded-full bg-black/50 px-3 py-2 text-sm text-white"
          >
            {micOn ? "🎙️" : "🔇"}
          </button>
          <button
            type="button"
            onClick={() => endSession()}
            className="rounded-full bg-black/50 px-3 py-2 text-sm text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {gifts.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {gifts.map((g) => (
            <button
              key={g.key}
              type="button"
              disabled={Boolean(gifting)}
              onClick={() => gift(g.key)}
              className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-xs disabled:opacity-50"
            >
              🎁 {g.label} · {g.credits}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 max-h-40 space-y-1 overflow-y-auto text-sm">
        {log.map((l, i) => (
          <p key={i} className={l.who === "user" ? "text-right text-neutral-500" : "text-neutral-900"}>
            {l.text}
          </p>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendInline();
        }}
        className="mt-2 flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Parle à ${model.name}…`}
          disabled={!open}
          className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-neutral-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!open || !text.trim()}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
