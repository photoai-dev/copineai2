import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionUser, getProfileStatus } from "@/lib/dal";
import { getMyConversations } from "@/app/actions/mine";
import { getModel, modelAvatar } from "@/lib/models";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: `Mes copines — ${SITE_NAME}` };
export const instant = false;

export default async function MinePage() {
  const user = await getSessionUser();
  if (!user) redirect("/compte/");
  const profile = await getProfileStatus();
  if (!profile?.profileCompleted) redirect("/compte/");

  const conversations = await getMyConversations();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Mes copines</h1>

      {conversations.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Tu n'as encore discuté avec personne.{" "}
          <a href="/app/me/" className="underline">
            Lance une conversation
          </a>
          .
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
          {conversations.map((c) => {
            const m = getModel(c.modelId);
            if (!m) return null;
            return (
              <li key={c.modelId}>
                <a
                  href={`/app/me/?m=${m.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50"
                >
                  <Image
                    src={modelAvatar(m)}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                    unoptimized
                  />
                  <div className="min-w-0 flex-1">
                    <b className="block text-sm">{m.name}</b>
                    <p className="truncate text-xs text-neutral-500">
                      {c.lastMessage ?? "Dis bonjour !"}
                    </p>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
