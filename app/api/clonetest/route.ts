// Relais temporaire pour valider Clone Studio (wan-2.2-animate-replace) : la fonction
// Supabase clonetest n'est pas joignable depuis le bac à sable, donc on passe par un
// déploiement Vercel. À supprimer une fois le test terminé.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const action = u.searchParams.get("action") || "schema";
  const id = u.searchParams.get("id") || "";
  const CHARACTER_IMAGE =
    "https://allbwtoexfxupksbvfnh.supabase.co/storage/v1/object/public/media-public/site/p/avatar.webp";
  const REFERENCE_VIDEO = "https://love20-nine.vercel.app/v/demo.mp4";

  const body: Record<string, unknown> = { action };
  if (action === "get") body.id = id;
  if (action === "create") {
    body.input = {
      character_image: CHARACTER_IMAGE,
      video: REFERENCE_VIDEO,
      resolution: "480",
    };
  }

  const r = await fetch("https://allbwtoexfxupksbvfnh.supabase.co/functions/v1/clonetest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  return new Response(text, { status: r.status, headers: { "Content-Type": "application/json" } });
}
