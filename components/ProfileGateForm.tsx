"use client";
import { useActionState } from "react";
import { completeProfile, type ProfileState } from "@/app/actions/auth";

const inputCls =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";

export function ProfileGateForm() {
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    completeProfile,
    undefined
  );
  return (
    <form action={action} className="mx-auto max-w-sm space-y-3">
      <h1 className="text-xl font-bold">Dernière étape</h1>
      <p className="text-sm text-neutral-500">
        On a besoin de ton prénom, nom et date de naissance pour continuer (l'accès est réservé
        aux 18 ans et plus).
      </p>
      <input className={inputCls} name="firstName" placeholder="Prénom" required />
      <input className={inputCls} name="lastName" placeholder="Nom" required />
      <input className={inputCls} type="date" name="birth" required />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "…" : "Continuer"}
      </button>
    </form>
  );
}
