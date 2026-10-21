import data from "@/data/models.json";

export type ModelTheme = { ac: string; dk: string; soft: string; tint: string };

export type Model = {
  id: string;
  name: string;
  full: string;
  dir: string;
  job: string;
  city: string;
  age: number;
  handleLine: string;
  tagline: string;
  traits: string[];
  cats: string[];
  bio: string;
  cover: number | string;
  avatarAlt: string;
  theme: ModelTheme | null;
};

const MODELS = data as Record<string, Model>;

// Ordre éditorial du site d'origine (le tableau MODEL_ORDER de index.html) — on le fige ici
// pour garder le même ordre de présentation tant qu'on n'a pas de logique de tri côté Supabase.
export const MODEL_ORDER = [
  "sophie", "jessica", "jenny", "anna", "nina", "liloo", "natasha", "lee",
  "alma", "olivia", "annabelle", "cindy", "ayo", "nabilla", "charlotte",
  "beatrice", "aya", "capucine",
  // Kim & Anaïs (#libertine) : dernier modèle activé en base (20/10/2026), absent du
  // snapshot JSON pris lors de la migration initiale — ajouté ici (#113).
  "libertine",
];

export function getAllModels(): Model[] {
  return MODEL_ORDER.map((id) => MODELS[id]).filter(Boolean);
}

export function getModel(id: string): Model | undefined {
  return MODELS[id];
}

// Modèles sans page de vente côté love20 (/app/vente/<id>/) : trop récents, pas
// encore ajoutés à son propre jeu de données (#120) — love20 affiche alors un
// générique "Cette présentation arrive bientôt... découvre Sophie" au lieu de
// la vraie fiche du modèle demandé. Le CTA "Discuter" pointe directement vers
// le chat pour ces modèles-là, en attendant que love20 ait sa vraie page de
// vente. Retirer l'id d'ici dès que /app/vente/<id>/ fonctionne réellement.
const NO_VENTE_PAGE = new Set(["libertine"]);

export function modelCtaHref(m: Pick<Model, "id">): string {
  return NO_VENTE_PAGE.has(m.id) ? `/app/me/?m=${m.id}` : `/app/vente/${m.id}/`;
}

const CDN_BASE =
  "https://allbwtoexfxupksbvfnh.supabase.co/storage/v1/object/public/media-public/site/";

export function modelAsset(m: Pick<Model, "dir">, file: string): string {
  return `${CDN_BASE}${m.dir}/${file}`;
}

export function modelAvatar(m: Pick<Model, "dir">): string {
  return modelAsset(m, "avatar.webp");
}

export function modelLiveCover(m: Pick<Model, "dir">): string {
  return modelAsset(m, "live-cover.webp");
}

export function modelCoverPhoto(m: Pick<Model, "dir" | "cover">): string {
  return modelAsset(m, `${m.cover}.webp`);
}
