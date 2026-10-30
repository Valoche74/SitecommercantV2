# _GABARIT.md — le socle commun de perify.app (refonte A, 30/10/2026)

> Fichier de TRAVAIL pour les sessions qui touchent aux pages. **Pas publié** (`.vercelignore`), mais le dépôt
> GitHub est public. Les règles : `CLAUDE.md` (elles priment). Ici : le HTML commun prêt à copier et le mode
> d'emploi de `site.css` / `site.js`. L'ancien gabarit (socle du 26/09 : marqueur, mot qui défile, bordure
> lumineuse, apparitions, compteurs, rythme blanc / crème) se relit avec `git show 5e0d6ac:_GABARIT.md` — il ne
> s'applique plus.

## 0. À savoir avant de commencer

- **Une feuille commune, `site.css`** (toutes les pages), puis la feuille de la page (`accueil.css`, `comment.css`,
  `pilotez.css`, `essai.css`, `calculateur.css`). Aide et mentions n'ont que `site.css` (§ 9). Une mise en page propre
  à une page va dans SA feuille ; ce qui sert à deux pages ou plus va dans `site.css`.
- **Un seul script commun, `site.js`** (menu téléphone, compteur pour le calculateur, e-mail assemblé) ; les scripts
  de page : `eventail.js` (accueil), `essai.js`, `calcul.js`. `consentement.js` sur toutes les pages.
- Chemins **relatifs** pour les fichiers (`site.css`, `img/…`) ; liens entre pages **absolus sans .html**
  (`/comment-ca-marche`) — `cleanUrls`. Fins de ligne : LF.
- Aucun script externe, aucun jaune, aucune crème en fond, aucun chiffre / prix / texte hors de ceux validés, aucun
  logo de marque tierce.
- Essais : `node _outils/tests/lancer-tous.mjs --seulement "des pages" > fichier 2>&1`, puis le code de sortie.
  Captures : `SANS_BANDEAU=1 node _outils/captures-vitrine.mjs` (les 7 pages, 1440 et 390 px, sans le bandeau cookies).

## 1. Le `<head>` type (remplacer les ⟨…⟩)

```html
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>⟨Titre⟩ — Perify</title>
<meta name="description" content="⟨…⟩">
<meta name="theme-color" content="#1B1F3B">
<link rel="canonical" href="https://perify.app/⟨adresse⟩">
<link rel="icon" href="img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
<meta property="og:title" content="⟨Titre⟩ — Perify">
<meta property="og:description" content="⟨…⟩">
<meta property="og:type" content="website">
<meta property="og:url" content="https://perify.app/⟨adresse⟩">
<meta property="og:image" content="https://perify.app/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<!-- Refonte A (30/10/2026) : site.css est la feuille commune (polices servies par perify.app, déclarées en tête) -->
<link rel="stylesheet" href="site.css">
<link rel="stylesheet" href="⟨feuille de la page⟩.css">
<script src="site.js" defer></script>
<script src="consentement.js" defer></script>
<script src="⟨script de la page, s'il y en a un⟩.js" defer></script>
</head>
```

Plus de `<script>document.documentElement.classList.add('js')</script>` : plus rien n'en dépend.

## 2. L'en-tête (identique sur toutes les pages)

Poser `aria-current="page"` sur le lien de la page courante (le logo sur l'accueil, « Comment ça marche »,
« Ce que vous pilotez », ou les deux boutons « Essai gratuit » sur la page 4).

```html
<header class="entete">
  <div class="container entete-barre">
    <a class="entete-logo" href="/"><img src="img/logo-perify-blanc.png" alt="Perify, accueil" width="359" height="156"></a>
    <nav class="entete-nav" aria-label="Menu principal">
      <ul class="nav-liens">
        <li><a href="/comment-ca-marche">Comment ça marche</a></li>
        <li><a href="/ce-que-vous-pilotez">Ce que vous pilotez</a></li>
        <li><a href="/essai-gratuit#qui">Qui est derrière</a></li>
      </ul>
    </nav>
    <a class="btn btn-contour entete-essai" href="/essai-gratuit">Essai gratuit<span class="entete-essai-plus">&nbsp;14 jours</span></a>
    <details class="nav-tel">
      <summary><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path class="trait-menu" d="M4 7h16M4 12h16M4 17h16"/><path class="trait-croix" d="M6 6l12 12M18 6L6 18"/></svg>Menu</summary>
      <nav class="nav-tel-panneau" aria-label="Menu principal">
        <ul class="nav-tel-liens">
          <li><a href="/comment-ca-marche">Comment ça marche</a></li>
          <li><a href="/ce-que-vous-pilotez">Ce que vous pilotez</a></li>
          <li><a href="/essai-gratuit#qui">Qui est derrière</a></li>
          <li><a class="btn btn-contour" href="/essai-gratuit">Essai gratuit 14 jours</a></li>
        </ul>
      </nav>
    </details>
  </div>
</header>
```

- Ordinateur (> 60rem) : les trois liens + « Essai gratuit 14 jours » en contour orange.
- Sous 60rem : logo, « Essai gratuit 14 jours » (« Essai gratuit » seul sous 40rem, « 14 jours » reste lu par les
  lecteurs d'écran), « Menu ». Sous 22,4rem (320 px) le bouton de la barre s'efface : il reste dans le menu.
- Le menu est un `<details>` : il s'ouvre et se ferme sans script. `site.js` ajoute Échap (focus rendu à « Menu »),
  clic dehors, clic sur un lien, passage en grand écran.
- Le bouton de la barre est **toujours en contour** : il ne compte jamais comme un second bouton orange plein.

## 3. Le corps : sections et chapeau

```html
<main>
  <section class="page-tete">
    <div class="container">
      <p class="page-nom">⟨Nom de la page⟩</p>
      <h1>⟨Titre⟩</h1>
      <p class="chapo">⟨Phrase d'introduction⟩</p>
    </div>
  </section>

  <section class="section" aria-labelledby="titre-x">            <!-- sur le fond de la page -->
    <div class="container">
      <div class="section-tete centre">                          <!-- « centre » : titre centré -->
        <h2 id="titre-x">⟨Titre⟩</h2>
        <p class="chapo">⟨…⟩</p>
      </div>
      …
    </div>
  </section>

  <section class="section teinte">…</section>                     <!-- LA bande teintée de la page (une au plus) -->
  <section class="section filet">…</section>                      <!-- un filet au-dessus (deux sections qui se suivent) -->
</main>
```

- Un seul `<h1>` par page ; `h2` des sections, `h3` dedans.
- `.page-nom` : le nom de la page, en petit, gris, **casse normale**. Pas d'autre « étiquette » au-dessus d'un titre.
- Espacements : `--section-gap` (128 px ordinateur, 96 tablette, 72 téléphone), `--section-gap-s` (96 / 80 / 64).

## 4. Les briques du socle (site.css)

| classe | rôle |
|---|---|
| `.btn.btn-plein` | le bouton principal, orange, texte nuit — **un seul à l'écran** |
| `.btn.btn-second` | bouton secondaire sur le clair (contour nuit) : « Retour », « Ouvrir le calculateur » |
| `.btn.btn-contour` | bouton sur la nuit (barre du haut, menu) |
| `.lien`, `.lien-fleche` | lien souligné ; lien avec une flèche SVG après le texte (cible 48 px) |
| `.cadre-visuel` | la plaque teintée aux coins ronds sous une capture (l'image prend une ombre douce) |
| `.liste` | liste cochée (coche dessinée par la feuille, en nuit) — `<ul class="liste"><li>…</li></ul>` |
| `.pastille` | courte indication en casse normale : « Nouveau », « Sur iPhone », « En option » |
| `.legende` | « Données de démonstration. » sous une capture chiffrée |
| `.champ`, `.champ-aide`, `.champ-erreur`, `.pastilles` | champs de formulaire, aide, erreur, choix en pastilles (cibles 48 px) |
| `.direct` | contacts directs en pilules (téléphone, e-mail, aide) |
| `.faq-grille` + `.faq-liste` | questions : titre à gauche, `<details>` à droite (flèche SVG dans le `<summary>`) |
| `.insecable`, `.visually-hidden` | pas de coupure ; lu par les lecteurs d'écran seulement |

## 5. Le bloc final « Essai » (pages 2, 3 et calculateur — juste avant « Suite »)

```html
<section class="essai-final" aria-labelledby="titre-essai">
  <div class="container">
    <div class="essai-final-cadre">
      <h2 id="titre-essai">Essayez-le quatorze jours sur votre comptoir.</h2>
      <p>Présentoir et mise en place compris. Si ça ne vous convient pas, vous arrêtez&nbsp;: rien à payer, je reprends le présentoir, et les données de vos clients sont supprimées.</p>
      <a class="btn btn-plein" href="/essai-gratuit">Essai gratuit 14 jours</a>
    </div>
  </div>
</section>
```

## 6. Le lien « Suite » (bas de page)

```html
<div class="suite">
  <div class="container">
    <a class="suite-lien" href="/ce-que-vous-pilotez"><span class="suite-texte"><span class="suite-mot">Suite&nbsp;:</span> ce que vous pilotez</span><span class="suite-fleche" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
  </div>
</div>
```

## 7. Le pied (identique sur toutes les pages)

```html
<footer class="pied">
  <div class="container pied-grille">
    <div class="pied-marque">
      <img src="img/logo-perify-blanc.png" alt="Perify" width="359" height="156" loading="lazy">
      <p>La carte de fidélité qui vit dans le téléphone de vos clients.</p>
    </div>
    <nav class="pied-nav" aria-label="Pied de page">
      <ul>
        <li><a href="/comment-ca-marche">Comment ça marche</a></li>
        <li><a href="/ce-que-vous-pilotez">Ce que vous pilotez</a></li>
        <li><a href="/calculateur">Faites le calcul</a></li>
        <li><a href="/essai-gratuit">Essai gratuit</a></li>
      </ul>
      <ul class="pied-liens">
        <li><a href="/aide">Aide</a></li>
        <li><a href="/mentions-legales">Mentions légales</a></li>
        <li><a href="/mentions-legales#donnees">Données personnelles</a></li>
      </ul>
    </nav>
  </div>
  <div class="container">
    <p class="pied-legal">© 2026 Perify — Valentin CARRILLO, entrepreneur individuel — programme de fidélité pour commerces de proximité.</p>
  </div>
</footer>
```

`consentement.js` ajoute « Gérer les cookies » en dernier `<li>` de `.pied-liens` (quand Clarity est configuré).

## 8. Le script commun (site.js)

- `window.PerifySite.mouvementReduit` : vrai si le visiteur a demandé moins d'animations (lu par `essai.js`,
  `eventail.js`).
- `window.PerifyCompteur` : `animer(el, valeur, options)`, `ecrire(el, valeur, options)`, `format(v, décimales)`.
  Un élément `[data-compte]` n'est **plus** animé tout seul : seul `calcul.js` fait rouler ses résultats quand on tape.
- E-mail jamais en clair : `<a id="lienMail" href="#">Écrire un e-mail</a>`, `<a data-mail="Perify — aide" href="#">…</a>`
  (`data-mail-texte` pour afficher l'adresse), `window.PerifyMail.lien(sujet, corps)`.

## 9. Les pages de texte (aide, mentions légales)

`<body class="page-texte">` et `<main class="wrap">` : une colonne de lecture (46rem). Les classes d'origine sont
habillées par `site.css` : `.mono` (le surtitre, casse normale), `.chapeau` (l'introduction), `.bloc` (carte blanche
avec la liste `dl`), `.actions` (liens en pilules en bas de page), `h2` avec un filet au-dessus, `code`. On ne touche
pas au contenu de `<main>` des mentions légales (validé le 30/10, cd72817) : seulement l'en-tête, le pied et le `<head>`.

## 10. L'accueil (accueil.css)

- `.heros` : titre (`--text-display`), `.heros-phrase`, le bouton, `.heros-note`, puis `.scene` : `.scene-plateau`
  (variable `--tel`, la largeur du téléphone) avec `img.scene-tel` et quatre `figure.morceau` (`-tampons`, `-cadeau`,
  `-roue`, `-avis`), chacun avec sa `.etiquette` nuit. Les positions sont calculées depuis les bords du téléphone.
  Au-delà de 64rem, `--tel` suit la hauteur de la fenêtre (`clamp(224px, calc((100vh - 420px) * .5), 272px)`) pour
  que le téléphone tienne en entier dans le premier écran à 1440 × 900 (les marges du héros y sont resserrées à 24 px) ;
  si le texte du héros s'allonge, revoir les 420 px. Entre 48 et 64rem, `--tel` vaut 220 px. Sous 48rem, le plateau
  prend sa hauteur (`aspect-ratio`) et la roue et le cadeau se posent au pied du téléphone, la barre de tampons dessous.
- `.avec` (noms en texte entre deux filets), `.presentoirs` (l'éventail), `.film` (deux vidéos : paysage / verticale
  sous 48rem), `.parcours` + `.etapes` (4 dessins numérotés), `.jeux` (bande teintée) + `.vers-calcul`, `.pilotez`,
  `.essai-accueil` (texte + `.qui-court` + `.essai-photos`), questions (`.faq-grille`).

## 11. Les images ajoutées le 30/10/2026

| fichier | contenu |
|---|---|
| `img/carte-wallet.webp` (680 × 1284) | le visuel de Valentin (deux cartes dans l'app Cartes), détouré ; QR de perify.app |
| `img/carte-tampons.webp`, `carte-roue.webp`, `carte-cadeau.webp`, `carte-avis.webp` | morceaux de la vraie carte (captures, données de démonstration) |
| `img/scenes/*.svg` | les 4 dessins du parcours et les 3 jeux (session Design, 29/10) |
| `video/perify-promo-affiche-9s-16x9.jpg`, `…-9x16.jpg` | les affiches des vidéos (image de la 9e seconde) |

Ne sont plus affichés (gardés dans `img/`) : `carte-wallet-2026-10-30.webp`, `carte-main.webp`, `cadeau-gagne.webp`,
`parcours.webp`, `presentoir-3.webp`, `offre-mail-3.webp`, `logos/*`, et les anciennes affiches de `video/`.
