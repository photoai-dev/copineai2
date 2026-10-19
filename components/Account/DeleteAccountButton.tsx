"use client";
import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/actions/account";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-red-600 underline"
      >
        Supprimer mon compte
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">
        Cette action est définitive : conversations, photos et abonnement seront perdus.
        Confirmer la suppression ?
      </p>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await deleteAccount();
              if (res?.error) setError(res.error);
            })
          }
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Suppression…" : "Oui, supprimer"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
