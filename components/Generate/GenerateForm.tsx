"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import type { Model } from "@/lib/models";
import { modelAvatar } from "@/lib/models";
import { createGeneration, getGeneration, type GenJob } from "@/app/actions/generate";

const ERR_LABEL: Record<string, string> = {
  credits: "Pas assez de crédits pour cette génération.",
  quota: "Quota de ton forfait atteint pour ce mois/aujourd'hui.",
  disabled: "La génération est temporairement désactivée.",
  not_configured: "La génération n'est pas disponible pour le moment.",
  model: "Aucune photo de référence pour ce modèle.",
  refused: "Cette demande ne peut pas être générée (contenu non autorisé).",
  busy: "Tu as déjà 3 générations en cours — attends qu'elles se terminent.",
  rate: "Trop de générations cette heure, réessaie plus tard.",
  auth: "Session expirée, reconnecte-toi.",
  email_unconfirmed: "Confirme ton email avant de générer des photos.",
};

export function GenerateForm({ models }: { models: Model[] }) {
  const [modelId, setModelId] = useState(models[0].id);
  const [prompt, setPrompt] = useState("");
  const [job, setJob] = useState<GenJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const model = models.find((m) => m.id === modelId) ?? models[0];

  useEffect(() => () => void (pollRef.current && clearTimeout(pollRef.current)), []);

  function poll(id: string) {
    pollRef.current = setTimeout(async () => {
      const g = await getGeneration(id);
      if (!g) return;
      setJob(g);
      if (g.status === "running" || g.status === "queued") poll(id);
    }, 3000);
  }

  function submit() {
    const text = prompt.trim();
    if (!text || pending) return;
    setError(null);
    setJob(null);
    startTransition(async () => {
      const res = await createGeneration(modelId, text);
      if (res.error) {
        setError(ERR_LABEL[res.error] || "Une erreur est survenue.");
        return;
      }
      if (res.id) {
        setJob({ id: res.id, kind: "photo", model_id: modelId, status: "running" });
        poll(res.id);
      }
    });
  }

  return (
    <div className="mx-auto max-w-lg">
      <label className="mb-1 block text-sm font-medium">Qui ?</label>
      <select
        value={modelId}
        onChange={(e) => setModelId(e.target.value)}
        className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <label className="mb-1 block text-sm font-medium">Décris la photo</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        placeholder="Ex. : un selfie à la plage au coucher du soleil, robe blanche…"
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending || !prompt.trim() || job?.status === "running" || job?.status === "queued"}
        className="mt-3 w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {job?.status === "running" || job?.status === "queued" ? "Génération en cours…" : "Générer"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {job && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
          {job.status === "done" && job.url ? (
            <Image src={job.url} alt="" width={600} height={800} className="w-full object-cover" unoptimized />
          ) : job.status === "failed" || job.status === "rejected" ? (
            <p className="p-4 text-sm text-red-600">
              {ERR_LABEL[job.error ?? ""] || "La génération a échoué, crédit remboursé."}
            </p>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <Image
                src={modelAvatar(model)}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
                unoptimized
              />
              <p className="text-sm text-neutral-500">{model.name} prépare ta photo…</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
