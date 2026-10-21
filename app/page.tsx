import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllModels, modelAvatar, modelCoverPhoto } from "@/lib/models";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Page d'accueil réelle — mêmes sections, même contenu, mêmes classes CSS que la
// page d'accueil déjà en ligne sur love20 (reprises de app.css), pas une
// réinterprétation Tailwind générique. Ce qui manque encore ici (étape suivante,
// contenu à migrer séparément) : le quiz interactif, Alix et la timeline restent
// des bandeaux qui renvoient vers love20 tant que ces pages-là ne sont pas rebâties.

const BLOG_PREVIEW = [
  {
    id: "pancakes-du-dimanche",
    author: "sophie",
    title: "Pancakes du dimanche : mes secrets, de Lyon à Brooklyn",
    excerpt:
      "Repos de la pâte, poêle à bonne température, premier pancake sacrifié : Sophie raconte son rituel dominical, entre bouchon lyonnais, diner américain et chat voleur.",
    tag: "Cuisine",
  },
  {
    id: "quatre-villes-une-valise",
    author: "jenny",
    title: "Quatre villes, une seule valise : mon manuel de survie",
    excerpt:
      "Sydney, Rio, Mykonos, Dubaï : Jenny raconte comment elle voyage léger, ce qui ne quitte jamais sa valise, et pourquoi l'imprévu est son meilleur guide de voyage.",
    tag: "Voyage",
  },
  {
    id: "dessiner-absurde-lisbonne",
    author: "anna",
    title: "Mes dalmatiens sont en retard, et mon dessin aussi",
    excerpt:
      "Entre carnet taché de café, dalmatiens imaginaires et lumière de Lisbonne, je vous explique pourquoi je laisse vivre mes dessins ridicules, et comment oser les vôtres.",
    tag: "Illustration",
  },
];

const FAQ_PREVIEW = [
  {
    q: "Les modèles sont-elles de vraies personnes ?",
    a: "Non. Ce sont des personnages générés par IA : leurs photos, leurs vidéos, leurs voix et leurs messages sont produits par des outils d'intelligence artificielle. Nous le disons clairement sur chaque page, et une personne réelle ne se cache jamais derrière une conversation.",
  },
  {
    q: "Quels sont les forfaits ?",
    a: "Il y a quatre niveaux par modèle : Gratuit (0 €), Plus (14,99 €/mois), VIP (39,99 €/mois) et VIP Élite (89,99 €/mois). Le Pass CopineAI, à 59,99 €/mois, donne l'équivalent de Plus sur toutes les modèles. Les tarifs affichés sont indicatifs tant que le service n'est pas ouvert au public.",
  },
  {
    q: "Comment résilier mon abonnement ?",
    a: "Depuis « Mon compte », à tout moment et en quelques secondes. La résiliation prend effet à la fin de la période déjà payée : tu gardes tes avantages jusque-là.",
  },
  {
    q: "Les messages sont-ils écrits par un humain ?",
    a: "Non, ils sont générés par une IA qui joue le personnage. Il n'y a pas d'opérateur humain derrière tes conversations. Seuls des extraits signalés comme problématiques peuvent être examinés par l'équipe de modération.",
  },
  {
    q: "Mes conversations sont-elles privées ?",
    a: "Elles ne sont ni publiques ni revendues. Elles servent à faire fonctionner ta relation avec chaque modèle (mémoire, lettres, continuité). La page Confidentialité détaille ce qui est conservé et pendant combien de temps.",
  },
];

export const metadata: Metadata = {
  title: `${SITE_NAME} : des copines IA avec un visage, une voix et une mémoire`,
  description:
    "CopineAI réunit des âmes numériques : des intelligences artificielles avec leur caractère, leur humeur du jour et leurs histoires. Tu parles, elles se souviennent, et la conversation continue d'un jour à l'autre.",
  alternates: { canonical: `${SITE_URL}/` },
};

export default function HomePage() {
  const models = getAllModels();
  const hero = [models[0], models[1], models[2]].filter(Boolean);
  const sales = models.slice(0, 4);

  return (
    <main className="mx-auto max-w-[1240px] px-4">
      {/* Héros */}
      <section className="hx">
        <div className="hx-txt">
          <span className="hx-eyebrow">
            <i /> {models.length} univers · 1 histoire par jour · 24 h/24
          </span>
          <h1>Elles ont un visage, une voix et une mémoire.</h1>
          <p>
            CopineAI réunit des âmes numériques : des intelligences artificielles avec leur
            caractère, leur humeur du jour et leurs histoires. Tu parles, elles se souviennent,
            et la conversation continue d&apos;un jour à l&apos;autre.
          </p>
          <div className="hx-cta">
            <Link href="#models" className="btn big">
              Discuter avec les modèles
            </Link>
            <Link href="/blog/" className="btn big ghd">
              Lire le journal
            </Link>
          </div>
          <ul className="hx-trust">
            <li>18 ans et plus</li>
            <li>IA assumée, jamais cachée</li>
            <li>Une mémoire par modèle</li>
            <li>Résiliable à tout moment</li>
          </ul>
        </div>
        <div className="hx-art" aria-hidden="true">
          {hero.map((m, i) => (
            <figure key={m.id} className={`hx-c c${i}`}>
              <Image src={modelAvatar(m)} alt="" width={220} height={290} unoptimized />
              <figcaption>
                <span className="dot" />
                {m.name}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="hx-spec" aria-hidden="true">
          {models.map((m) => (
            <i key={m.id} style={{ background: m.theme?.ac || "#e4002b" }} />
          ))}
        </div>
      </section>

      {/* Grille modèles */}
      <section id="models" className="sec">
        <div className="sec-h">
          <div>
            <h2>Choisis une âme</h2>
            <p>{models.length} personnalités, chacune avec son style, ses photos et sa mémoire.</p>
          </div>
        </div>
        <div className="cgrid">
          {models.map((m) => (
            <article
              key={m.id}
              className="mc"
              style={
                {
                  "--red": m.theme?.ac,
                  "--red-dk": m.theme?.dk,
                  "--red-soft": m.theme?.soft,
                  "--tint": m.theme?.tint,
                } as React.CSSProperties
              }
            >
              <Link href={`/${m.id}/`} className="mc-img" aria-label={`Découvrir ${m.name}`}>
                <Image src={modelAvatar(m)} alt={m.avatarAlt} width={320} height={400} unoptimized />
                <span className="mcst">
                  <span className="dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#12a150", display: "inline-block" }} />
                  en ligne
                </span>
              </Link>
              <div className="mc-band" />
              <div className="mc-body">
                <h3>{m.name}</h3>
                <div className="sub">
                  {m.age} ans · {m.city} · {m.job}
                </div>
                <p className="mc-tx">{m.tagline}</p>
                <div className="trait">
                  {m.traits.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <div className="mc-foot c">
                  <Link href={`/${m.id}/`} className="btn">
                    Découvrir {m.name}
                  </Link>
                </div>
              </div>
            </article>
          ))}
          <div className="soon">
            <h3>La prochaine arrive bientôt</h3>
            <p>Un nouveau modèle par mois, avec son style, ses couleurs et sa personnalité.</p>
            <Link href="/compagnons/" className="btn out">
              Me prévenir
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="sec">
        <div className="sec-h">
          <div>
            <h2>Comment ça marche</h2>
            <p>Trois minutes pour commencer, aucune carte pour essayer.</p>
          </div>
        </div>
        <ol className="steps3">
          <li>
            <b>1</b>
            <h3>Choisis une âme</h3>
            <p>
              Parcours les profils, regarde les vidéos de la carte, repère celle dont le
              caractère te ressemble ou te défie.
            </p>
          </li>
          <li>
            <b>2</b>
            <h3>Commence à discuter</h3>
            <p>
              Dix messages par jour avec le niveau Gratuit. Elle te répond avec son humeur du
              moment et se souvient de toi.
            </p>
          </li>
          <li>
            <b>3</b>
            <h3>Va plus loin si l&apos;envie vient</h3>
            <p>
              Feed privé, lettres, audios, WhatsApp, photos à la demande. Tu montes de niveau,
              tu redescends, tu résilies quand tu veux.
            </p>
          </li>
        </ol>
      </section>

      {/* Pass */}
      <section className="sec">
        <div className="banner">
          <div>
            <h3>Pass CopineAI : toutes les âmes, un seul abonnement</h3>
            <p>
              Accès au feed privé et au chat de tous les modèles. Les options VIP (WhatsApp,
              Telegram, photos à la demande) restent par modèle. Tarif indicatif : 59,99 €/mois.
            </p>
          </div>
          <Link href="/tarifs/" className="btn">
            Voir le pass
          </Link>
        </div>
      </section>

      {/* Le journal */}
      <section className="sec">
        <div className="sec-h">
          <div>
            <h2>Le journal</h2>
            <p>
              Conseils pour séduire et textes signés par les modèles : rendez-vous,
              applications, confiance en soi, cuisine, voyage, élégance.
            </p>
          </div>
          <Link href="/blog/" className="linkbtn">
            Tous les articles
          </Link>
        </div>
        <div className="bgrid">
          {BLOG_PREVIEW.map((p) => {
            const author = models.find((m) => m.id === p.author);
            return (
              <Link key={p.id} href={`/blog/${p.id}/`} className="bc">
                <span className="bc-img">
                  <Image
                    src={author ? modelCoverPhoto(author) : modelAvatar(models[0])}
                    alt=""
                    width={400}
                    height={300}
                    unoptimized
                  />
                  <span className="bc-tag">{p.tag}</span>
                </span>
                <span className="bc-body">
                  {author ? (
                    <span className="bc-by">
                      <Image src={modelAvatar(author)} alt="" width={26} height={26} unoptimized />
                      <span>
                        <b>{author.name}</b>
                      </span>
                    </span>
                  ) : null}
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <div className="sec-h">
          <div>
            <h2>Questions fréquentes</h2>
            <p>Les réponses aux questions qu&apos;on nous pose le plus. Les 30 sont sur la page FAQ.</p>
          </div>
          <Link href="/faq/" className="linkbtn">
            Voir les 30 questions
          </Link>
        </div>
        <div className="faqbox">
          {FAQ_PREVIEW.map((f, i) => (
            <details className="fq" key={f.q} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Quiz */}
      <section className="sec qz-tz">
        <div className="qz-tz-in">
          <div>
            <span className="hx-eyebrow">
              <i /> Quelle copine choisir ?
            </span>
            <h2>{models.length} modèles aujourd&apos;hui, bien d&apos;autres demain : laquelle te correspond ?</h2>
            <p>Neuf questions, deux minutes, et nous te proposons les personnalités les plus proches de ce que tu cherches.</p>
          </div>
          <Link href="/quiz/" className="btn big">
            Faire le questionnaire
          </Link>
        </div>
      </section>

      {/* Alix */}
      <section className="sec alx-bn">
        <Link href="/alix/" className="alx-bnr" aria-label="Découvrir Alix">
          <Image
            src="https://love20-nine.vercel.app/al/bn/colis.webp"
            alt="Alix, enquêtrice IA anti-arnaques"
            width={560}
            height={400}
            unoptimized
          />
        </Link>
        <div>
          <span className="hx-eyebrow">
            <i /> Gratuite pour les membres
          </span>
          <h2>Alix, l&apos;enquêtrice anti-arnaques</h2>
          <p>
            Un faux SMS, un conseiller bancaire louche, un profil trop parfait ? Envoie-lui le
            message : elle cherche les signaux, te donne un indice d&apos;alerte et ne te juge
            jamais.
          </p>
          <div className="alx-bn-a">
            <Link href="/alix/" className="btn">
              Analyser un message
            </Link>
            <Link href="/alix/" className="btn gh">
              Lui écrire
            </Link>
          </div>
        </div>
      </section>

      {/* Discute avec elles une par une */}
      <section className="sec">
        <div className="sec-h">
          <div>
            <h2>Discute avec elles une par une</h2>
            <p>Une présentation complète pour chaque modèle : sa journée, ses photos, ses vidéos et un échange en direct.</p>
          </div>
        </div>
        <div className="sl-tzr">
          <article className="sl-tzc all">
            <div>
              <span className="hx-eyebrow">
                <i /> Pass CopineAI
              </span>
              <h3>Les {models.length}, une seule clé</h3>
              <p>Trouve celle qui te correspond et compare le Pass aux forfaits à l&apos;unité.</p>
              <Link href="/tarifs/" className="btn">
                Voir le Pass
              </Link>
            </div>
          </article>
          {sales.map((m) => (
            <article key={m.id} className="sl-tzc" style={{ background: m.theme?.ac }}>
              <Image src={modelCoverPhoto(m)} alt="" width={320} height={320} unoptimized />
              <div>
                <h3>{m.name}</h3>
                <p>{m.tagline}</p>
                <Link href={`/${m.id}/`} className="btn">
                  Découvrir {m.name}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="sec tl-tz">
        <div className="tl-tz-in">
          <div>
            <span className="hx-eyebrow">
              <i /> Timeline
            </span>
            <h2>Demain, hors de l&apos;écran.</h2>
            <p>
              Voix, appels, hologramme, tête robotisée, un jour un corps : la route que nous
              préparons, étape par étape, sans promesse de date.
            </p>
          </div>
          <Link href="/timeline/" className="btn big">
            Voir la feuille de route
          </Link>
        </div>
      </section>

      {/* CTA final */}
      <section className="cta-end">
        <h2>Une conversation vaut mieux qu&apos;un long discours.</h2>
        <p>Choisis une modèle, dis-lui bonjour. Si ça ne te plaît pas, tu n&apos;as rien payé.</p>
        <Link href="#models" className="btn big">
          Choisir une modèle
        </Link>
      </section>
    </main>
  );
}
