import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

// Même identité visuelle que l'app (love20) : sidebar sombre + topnav en pilules,
// classes et couleurs copiées de app.css / assets/site.css (.side*, .appbar/.topnav)
// pour que toutes les pages publiques (accueil, fiches, feed, tarifs, blog...) aient
// EXACTEMENT le même menu de gauche et le même menu du haut que le reste du site —
// de vrais <a href> (pas de JS requis), donc indexables.

const ICONS: Record<string, string> = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  flame:
    '<path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
  feed: '<rect x="4" y="3.5" width="16" height="7.5" rx="1.8"/><rect x="4" y="13" width="16" height="7.5" rx="1.8"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/>',
  camera:
    '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  pen: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  crown: '<path d="M3 18h18M4 18l-1-11 5 4 4-7 4 7 5-4-1 11z"/>',
  book:
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  star:
    '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      className="i"
      viewBox="0 0 24 24"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }}
    />
  );
}

// Reprend le menu réel de l'app (var SIDE dans index.html) — mêmes libellés, même
// ordre, mêmes icônes. Les routes privées (chat, mon espace...) restent sous /app/
// (non indexées) ; les routes publiques pointent vers les vraies pages publiques —
// dont /feed/ et /tarifs/, les vitrines publiques de ce site, plutôt que leurs
// équivalents privés /app/feed/ et /app/pay/.
const SIDE: { id: string; label: string; icon: string; href: string; badge?: string }[] = [
  { id: "discover", label: "Explorer", icon: "compass", href: "/" },
  { id: "live", label: "Live Streaming", icon: "flame", href: "/live/" },
  { id: "feed", label: "Feed", icon: "feed", href: "/feed/" },
  { id: "chats", label: "Messagerie", icon: "heart", href: "/app/me/" },
  { id: "mine", label: "Mes copines", icon: "heart", href: "/app/mine/" },
  { id: "coach", label: "Mon coach", icon: "bolt", href: "/app/coach/" },
  { id: "quiz", label: "Trouver ma copine", icon: "sparkle", href: "/quiz/" },
  { id: "alix", label: "Alix", icon: "shield", href: "/alix/", badge: "Gratuit" },
  { id: "generate", label: "Générer", icon: "camera", href: "/app/generate/" },
  { id: "drague", label: "Simulateur de drague", icon: "heart", href: "/drague/" },
  { id: "studio", label: "Sur mesure", icon: "pen", href: "/app/studio/" },
  { id: "pay", label: "Offres et crédits", icon: "crown", href: "/tarifs/" },
  { id: "blog", label: "Blog", icon: "book", href: "/blog/" },
  { id: "compagnons", label: "Compagnons", icon: "star", href: "/compagnons/" },
];

const TOPNAV = [
  { href: "/", label: "Modèles" },
  { href: "/feed/", label: "Feed" },
  { href: "/blog/", label: "Blog" },
  { href: "/guides/", label: "Guides" },
  { href: "/tarifs/", label: "Tarifs" },
  { href: "/faq/", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="appbar">
      <div className="appbar-in">
        <label htmlFor="side-toggle" className="side-burger" aria-label="Ouvrir le menu">
          <Icon name="menu" />
        </label>
        <Link href="/" className="logo">
          {SITE_NAME}
        </Link>
        <nav className="topnav" aria-label="Navigation principale">
          {TOPNAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ab-auth">
          <Link href="/compte/">Connexion</Link>
          <Link href="/compte/" className="pri">
            Inscription
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteSidebar() {
  return (
    <>
      <input type="checkbox" id="side-toggle" className="side-toggle" aria-hidden="true" />
      <label htmlFor="side-toggle" className="side-ov" aria-hidden="true" />
      <aside id="side" className="side" aria-label="Menu principal">
      <div className="side-top">
        <Link href="/" className="side-logo" aria-label="CopineAI, accueil">
          Copine<b>AI</b>
        </Link>
        <label htmlFor="side-toggle" className="side-x" aria-label="Fermer le menu">
          <Icon name="close" />
        </label>
      </div>
      <nav className="side-nav" aria-label="Menu principal">
        {SIDE.map((s) => (
          <Link key={s.id} href={s.href} aria-label={s.label} title={s.label}>
            <Icon name={s.icon} />
            <span>{s.label}</span>
            {s.badge ? <em>{s.badge}</em> : null}
          </Link>
        ))}
        <div className="side-sep" role="presentation" />
        <Link href="/pourquoi-une-petite-amie-ia/" aria-label="Pourquoi une petite amie IA ?">
          <Icon name="heart" />
          <span>Pourquoi une copine IA ?</span>
          <em>Lire</em>
        </Link>
      </nav>
      <div className="side-bot">
        <Link href="/tarifs/" className="side-up">
          <Icon name="crown" />
          <span>Passer à l’abonnement</span>
        </Link>
        <div className="side-gu">
          <Link href="/compte/">Connexion</Link>
          <Link href="/compte/" className="pri">
            Inscription
          </Link>
        </div>
        <div className="side-ft">
          <Link href="/faq/">FAQ</Link>
          <span>·</span>
          <Link href="/timeline/">Timeline</Link>
          <span>·</span>
          <Link href="/webmaster/">Partenaires</Link>
        </div>
      </div>
      </aside>
    </>
  );
}
