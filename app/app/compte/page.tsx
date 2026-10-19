import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, getProfileStatus } from "@/lib/dal";
import { getAccountOverview } from "@/app/actions/account";
import { logout } from "@/app/actions/auth";
import { DeleteAccountButton } from "@/components/Account/DeleteAccountButton";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: `Mon compte — ${SITE_NAME}` };
export const instant = false;

export default async function MemberAccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/compte/");
  const profile = await getProfileStatus();
  if (!profile?.profileCompleted) redirect("/compte/");

  const overview = await getAccountOverview();
  if (!overview) redirect("/compte/");

  const periodEnd = overview.periodEnd
    ? new Date(overview.periodEnd).toLocaleDateString("fr-FR")
    : null;

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold">Mon compte</h1>

      <section className="mt-6 rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold text-neutral-500">Profil</h2>
        <p className="mt-2 text-sm">
          {overview.firstName ?? "—"} · {overview.email}
          {overview.city ? ` · ${overview.city}` : ""}
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold text-neutral-500">Abonnement</h2>
        <p className="mt-2 text-sm">
          Forfait <b>{overview.plan}</b>
          {periodEnd ? ` · renouvellement le ${periodEnd}` : ""}
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          {overview.credits} crédit{overview.credits === 1 ? "" : "s"} disponible
          {overview.credits === 1 ? "" : "s"}.
        </p>
        <p className="mt-3 text-sm text-neutral-500">
          Le paiement en ligne n'est pas encore activé — les forfaits payants ne peuvent pas
          encore être souscrits directement sur le site.{" "}
          <Link href="/tarifs/" className="underline">
            Voir les offres
          </Link>
          .
        </p>
      </section>

      <form action={logout} className="mt-6">
        <button type="submit" className="text-sm underline">
          Se déconnecter
        </button>
      </form>

      <div className="mt-8">
        <DeleteAccountButton />
      </div>
    </main>
  );
}
