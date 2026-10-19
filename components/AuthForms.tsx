"use client";
import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "@/app/actions/auth";

const inputCls =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500";
const btnCls =
  "w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50";

export function AuthForms() {
  const [tab, setTab] = useState<"login" | "signup">("login");

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-6 flex gap-2 rounded-lg bg-neutral-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-md py-1.5 ${tab === "login" ? "bg-white shadow-sm" : "text-neutral-500"}`}
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`flex-1 rounded-md py-1.5 ${tab === "signup" ? "bg-white shadow-sm" : "text-neutral-500"}`}
        >
          Inscription
        </button>
      </div>
      {tab === "login" ? <LoginForm /> : <SignupForm />}
    </div>
  );
}

function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, undefined);
  return (
    <form action={action} className="space-y-3">
      <input className={inputCls} type="email" name="email" placeholder="Email" required />
      <input
        className={inputCls}
        type="password"
        name="password"
        placeholder="Mot de passe"
        required
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button className={btnCls} disabled={pending} type="submit">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

function SignupForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signup, undefined);
  return (
    <form action={action} className="space-y-3">
      <input className={inputCls} type="email" name="email" placeholder="Email" required />
      <input
        className={inputCls}
        type="password"
        name="password"
        placeholder="Mot de passe (8 caractères min.)"
        required
      />
      <input
        className={inputCls}
        type="password"
        name="confirm"
        placeholder="Confirme le mot de passe"
        required
      />
      <label className="flex items-start gap-2 text-xs text-neutral-600">
        <input type="checkbox" name="age18" className="mt-0.5" />
        J'ai 18 ans ou plus.
      </label>
      <label className="flex items-start gap-2 text-xs text-neutral-600">
        <input type="checkbox" name="cgu" className="mt-0.5" />
        J'accepte les CGU.
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button className={btnCls} disabled={pending} type="submit">
        {pending ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}
