# _GABARIT.md — le socle commun des 4 pages (26/09/2026)

> Fichier de TRAVAIL pour les agents qui construisent les pages. **Pas publié** (`.vercelignore`).
> Les textes et les règles viennent du cahier `EN-COURS/IMAGE/design-kit/REFONTE-4-PAGES.md` : il prime
> sur tout. Ici : le HTML commun prêt à copier, et le mode d'emploi de `site.css` / `site.js`.
> **27/09** : les retours de Valentin (`REFONTE-V2.md`) priment sur le premier cahier là où ils le
> contredisent ; les ajouts du socle pour la lisibilité et la fluidité sont au **§ 12**.

## 0. À savoir avant de commencer

- **Ne modifie ni `site.css` ni `site.js`** (ni `doc.css`) : ce sont les fichiers du socle. Ta mise en
  page va dans ta feuille (`accueil.css`, `comment.css`, `pilotez.css`, `essai.css`) et ton script dans le
  tien (`accueil.js`, `calcul.js`, `essai.js`). S'il te manque vraiment quelque chose dans le socle,
  écris-le dans ta feuille et signale-le.
- **L'ancienne page d'accueil** (étapes, modules, invendus, FAQ à recopier « à l'identique ») : NE PAS lire
  `index.html` pour ça. L'ancienne page unique (avant le 26/09) se relit avec
  `git show 2f5eab3:index.html` (lecture seule).
  Ses classes de mise en page (`.etape`, `.module`, `.visu`, `.mails`, `.option`, `.grille`, `.carte`,
  `.piliers`, `.nombres`, `.hero`…) ne sont PAS dans le socle : reprends-les dans ta feuille.
- Chemins **relatifs** pour les fichiers (`site.css`, `img/…`) ; liens entre pages **absolus sans .html**
  (`/comment-ca-marche`) — `cleanUrls`. Fins de ligne des nouveaux fichiers : LF.
- Aucun script externe, aucun jaune, aucun chiffre/prix/texte hors cahier, aucun logo de marque tierce
  (seule exception, V2 § 1.1 : les logos OFFICIELS de la grille « Ça marche avec », jamais téléchargés
  sans accord).
- Essais : `node _outils/tests/lancer-tous.mjs --seulement "des pages"` (syntaxe + catch des pages
  ET des .js du site : `site.js`, `accueil.js`, `eventail.js`, `calcul.js`, `essai.js` — si ta page n'a pas de .js
  prévu par le cahier, dis-le, l'essai le réclamera). Capture téléphone : `node _outils/apercu-mobile.mjs`.

## 1. Le `<head>` type (remplacer les ⟨…⟩)

```html
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>⟨titre du cahier⟩</title>
<meta name="description" content="⟨description du cahier⟩">
<meta name="theme-color" content="#1B1F3B">
<link rel="canonical" href="https://perify.app/⟨chemin⟩">
<link rel="icon" href="img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
<meta property="og:title" content="⟨titre⟩">
<meta property="og:description" content="⟨description⟩">
<meta property="og:type" content="website">
<meta property="og:url" content="https://perify.app/⟨chemin⟩">
<meta property="og:image" content="https://perify.app/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<!-- .js dès le départ : les apparitions et le menu téléphone se préparent sans clignoter (le filet de site.css montre tout si site.js ne se charge pas) -->
<script>document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700&display=swap"></noscript>
<link rel="stylesheet" href="site.css">
<link rel="stylesheet" href="⟨accueil|comment|pilotez|essai⟩.css">
<script src="site.js" defer></script>
<script src="⟨accueil|calcul|essai⟩.js" defer></script>
</head>
<body>
```

`⟨chemin⟩` : vide pour l'accueil (`https://perify.app/`), `comment-ca-marche`, `ce-que-vous-pilotez`,
`essai-gratuit`. Les scripts `defer` s'exécutent dans l'ordre : ton script peut utiliser
`window.PerifyCompteur` / `window.PerifyMail` dès son lancement.

## 2. L'en-tête + le menu téléphone (identique sur les 4 pages)

Mets `aria-current="page"` sur le lien de TA page (souligné orange clair) : page 2 → « Comment ça
marche », page 3 → « Ce que vous pilotez », page 4 → le bouton « Essai gratuit 14 jours » (pas « Qui est
derrière », qui est une ancre de la page 4). Page 1 : aucun.

```html
<header class="entete">
  <div class="wrap entete-barre">
    <a class="entete-logo" href="/"><img src="img/logo-perify-blanc.png" alt="Perify, accueil" width="359" height="156"></a>
    <button class="menu-bouton" type="button" aria-expanded="false" aria-controls="menu-principal">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path class="trait-1" d="M4 6h16"/><path class="trait-2" d="M4 12h16"/><path class="trait-3" d="M4 18h16"/></svg>
      <span>Menu</span>
    </button>
    <nav class="menu" id="menu-principal" aria-label="Menu principal">
      <ul class="menu-liens">
        <li><a href="/comment-ca-marche">Comment ça marche</a></li>
        <li><a href="/ce-que-vous-pilotez">Ce que vous pilotez</a></li>
        <li><a href="/essai-gratuit#qui">Qui est derrière</a></li>
      </ul>
      <a class="btn btn-o" href="/essai-gratuit">Essai gratuit 14 jours</a>
    </nav>
  </div>
</header>
```

Comportement (site.js) : sous 920 px, « Menu » ouvre un panneau sous l'en-tête (`aria-expanded`), Échap
ferme et rend le focus au bouton, un clic dehors ferme, un lien cliqué ferme, repasser en grand écran
ferme. Sans JS : pas de bouton, les liens passent sous le logo. L'en-tête est collant :
`scroll-padding-top` est réglé, une ancre (`#qui`) n'arrive pas sous lui.

## 3. Le corps

```html
<main>
  <!-- pages 2 à 4 : le chapeau de page (moins haut que le héros, halo orange) -->
  <section class="page-tete">
    <div class="wrap">
      <p class="eti rev">⟨étiquette⟩</p>
      <h1 class="rev">⟨titre avec <span class="marque">mot</span>⟩</h1>
      <p class="lead rev">⟨texte⟩</p>
    </div>
  </section>

  <section class="bloc">…</section>          <!-- section sur nuit -->
  <section class="bloc blanc">…</section>    <!-- section blanche (.creme : fond crème) -->
  …
  ⟨bloc final « Essai » (pages 1, 2, 3)⟩
  ⟨lien « Suite »⟩
</main>
⟨pied de page⟩
</body>
</html>
```

## 4. Le bloc final « Essai » (pages 1, 2, 3 — juste avant le lien Suite)

```html
<section class="essai-final" aria-labelledby="titre-essai">
  <div class="wrap">
    <div class="essai-carte rev">
      <p class="eti">Essai gratuit</p>
      <h2 id="titre-essai">Essayez-le quatorze jours sur votre comptoir.</h2>
      <p>Présentoir et mise en place compris. Si ça ne vous convient pas, vous arrêtez&nbsp;: rien à payer, je reprends le présentoir, et les données de vos clients sont supprimées.</p>
      <span class="btn-lumiere"><a class="btn btn-o" href="/essai-gratuit">Essai gratuit 14 jours</a></span>
    </div>
  </div>
</section>
```

L'étiquette « Essai gratuit » garde le style `.eti` (orange clair, petites capitales) : le socle l'exclut
de `.essai-carte p` depuis le 26/09. **Aucune surcharge à écrire dans ta feuille.**

## 5. Le lien « Suite » (bas de page)

```html
<div class="suite">
  <div class="wrap">
    <a class="suite-lien" href="⟨/comment-ca-marche⟩"><span class="suite-texte"><span class="suite-mot">Suite&nbsp;:</span> ⟨comment ça marche⟩</span><span class="suite-fleche" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>
  </div>
</div>
```

| page | href | texte après « Suite : » |
|---|---|---|
| 1 accueil | `/comment-ca-marche` | `comment ça marche` |
| 2 | `/ce-que-vous-pilotez` | `ce que vous pilotez` |
| 3 | `/essai-gratuit` | `l'essai gratuit` |
| 4 | `/` | *(pas de « Suite : »)* → `<span class="suite-texte">Retour à l'accueil</span>` |

La flèche est dessinée (SVG) : ne pas ajouter de « → » dans le texte.

## 6. Le pied de page (identique sur les 4 pages)

```html
<footer class="pied">
  <div class="wrap">
    <img class="pied-logo" src="img/logo-perify-blanc.png" alt="Perify" width="359" height="156" loading="lazy">
    <p class="pied-copie">© 2026 Perify — programme de fidélité pour commerces de proximité.</p>
    <nav class="pied-liens" aria-label="Pied de page">
      <a href="/comment-ca-marche">Comment ça marche</a><span aria-hidden="true">·</span>
      <a href="/ce-que-vous-pilotez">Ce que vous pilotez</a><span aria-hidden="true">·</span>
      <a href="/essai-gratuit">Essai gratuit</a><span aria-hidden="true">·</span>
      <a href="/aide">Aide</a><span aria-hidden="true">·</span>
      <a href="/mentions-legales">Mentions légales</a><span aria-hidden="true">·</span>
      <a href="/mentions-legales#donnees">Données personnelles</a>
    </nav>
  </div>
</footer>
```

Sous 960 px (920 jusqu'au 28/09 : avec le 7e lien « Faites le calcul », un point restait seul entre 920
et 929 px), les liens passent à la ligne : site.css masque alors les points « · » (aucun ne reste seul
en bout de ligne) et les sépare par un espace. Garde les `<span aria-hidden="true">·</span>` tels quels.
Chaque lien fait au moins 48 × 48 px (« Aide » compris).

## 7. Les effets du socle — classes et attributs

### Apparitions — `.rev` (→ `.vu`)
Tout élément `.rev` apparaît quand il arrive à l'écran (cascade de 70 ms, 280 ms au plus). Depuis le
27/09, trois gestes selon ce qu'il est (plus rien n'apparaît « tout pareil ») :
- titres, cartes, blocs : fondu + montée de **16 px** (0,7 s) ;
- texte `p.rev` et étiquette `.eti.rev` : **simple fondu** de 0,5 s, sans bouger ;
- visuels `.visu.rev` et `.hero-visu.rev` : fondu + **léger zoom** (95 % → 100 %, 1 s).
Sans JS : visible. Avec la ligne `.js` mais sans site.js : visible au bout de 3 s (filet). Mouvement
réduit : visible, immobile. Ne mets pas `.rev` sur un élément dont ton script mesure la position au
chargement (il est décalé de 16 px, ou réduit à 95 % pour un visuel).

### Effet 1 — le marqueur : `<span class="marque">mot</span>`
Barre orange sous le bas des lettres, derrière le texte, qui se dessine de gauche à droite 0,35 s après
l'apparition du titre (mets `.rev` sur le titre ; un marqueur hors `.rev` se déclenche seul à l'écran).
Sur `.blanc` / `.creme` : orange clair à 45 %. **Un seul par page**, sur le mot du cahier. Le mot reste
de la couleur du titre (pas de `<em>` orange).

### Effet 2 — le mot qui défile : `[data-defile]`
```html
Pensée pour les <span class="defile" data-defile><span class="lecteur">boulangeries, restaurants, snacks, cafés, coiffeurs, fleuristes, primeurs, fromagers</span><span class="defile-mots" aria-hidden="true"><span>boulangeries</span><span>restaurants</span><span>snacks</span><span>cafés</span><span>coiffeurs</span><span>fleuristes</span><span>primeurs</span><span>fromagers</span></span></span>
```
- Plus Jakarta Sans 800, orange clair (orange texte sur `.blanc`), cadre à quatre coins orange qui prend
  la largeur du mot. La taille suit la police du parent (mets le `font-size` sur la phrase).
- La largeur réservée est celle du mot le plus long (rien ne bouge autour) ; le mot reste sur une ligne.
- Sans JS / mouvement réduit : le premier mot, immobile. Lecteur d'écran : la liste complète (`.lecteur`).
- Le mot qui défile termine la phrase (la place réservée au mot le plus long reste à sa droite).

### Effet 3 — la bordure lumineuse : `.btn-lumiere` (enveloppant)
```html
<span class="btn-lumiere"><a class="btn btn-o" href="/essai-gratuit">Essai gratuit 14 jours</a></span>
<span class="btn-lumiere"><button class="btn btn-o" type="submit">Demander mon essai gratuit</button></span>
```
Seulement autour du bouton principal d'essai (héros, bloc final, bouton d'envoi du formulaire). Liseré de
2 px, reflet qui tourne en 3,5 s ; mouvement réduit ou vieux navigateur : liseré fixe. Pour un bouton
pleine largeur : `style` ou règle de ta feuille sur l'enveloppant (`.btn-lumiere{display:flex}`).

### Effet 4 — le compteur qui roule : `[data-compte]`
```html
<b data-compte="92" data-suffixe="&nbsp;%">92&nbsp;%</b>
<b data-compte="2" data-suffixe="&nbsp;s">2&nbsp;s</b>
<b data-compte="0,15" data-decimales="2" data-suffixe="&nbsp;€">0,15&nbsp;€</b>
```
- La **valeur finale est écrite dans le HTML** (sans JS / mouvement réduit, c'est elle qu'on voit).
- L'élément ne contient QUE le texte du nombre (le renvoi ¹ ou la légende vont À CÔTÉ, pas dedans) :
  site.js le remplace par `<span class="lecteur">valeur finale</span><span class="compte-vu" aria-hidden="true">…</span>`.
- `data-suffixe` / `data-prefixe` : écris l'espace en `&nbsp;`. `data-decimales` : 0 par défaut.
- À l'entrée dans l'écran (35 % visible) : de 0 à la valeur en 1,6 s, format français (virgule, espace
  fine), chiffres à chasse fixe, largeur réservée pendant qu'il roule.
- **API** (calcul.js) :
  - `PerifyCompteur.animer(el, valeur, { duree })` — roule de la valeur affichée vers `valeur` ;
    `null`, `NaN` ou `Infinity` → affiche « — » tout de suite. Durée 1600 ms par défaut (mets ~600 pour
    une saisie). Lit `data-decimales` / `data-suffixe` de l'élément (ou `{ decimales, suffixe }`).
  - `PerifyCompteur.ecrire(el, valeur)` — écrit sans animer ; `PerifyCompteur.format(0.15, 2)` → `0,15`.
  - Appelé souvent (à chaque frappe) : il repart de la valeur affichée, sans à-coup.

### Effet 5 — la bande des métiers : `.bande`
```html
<div class="bande">
  <div class="bande-piste">
    <ul class="bande-liste"><li>Boulangerie</li><li>Restaurant</li><li>Snack</li><li>Café</li><li>Coiffeur</li><li>Fleuriste</li><li>Primeur</li><li>Fromager</li><li>Pâtisserie</li><li>Caviste</li><li>Épicerie fine</li><li>Boucherie</li></ul>
    <ul class="bande-liste" aria-hidden="true"><li>Boulangerie</li><li>Restaurant</li><li>Snack</li><li>Café</li><li>Coiffeur</li><li>Fleuriste</li><li>Primeur</li><li>Fromager</li><li>Pâtisserie</li><li>Caviste</li><li>Épicerie fine</li><li>Boucherie</li></ul>
  </div>
</div>
```
Pleine largeur (hors `.wrap`), filets dessus/dessous, capitales par la feuille (écris les mots en
minuscules accentuées), points orange, ~30 s, fondu aux bords, pause au survol, figée en mouvement
réduit. Pure CSS : tourne aussi sans JS. Les deux listes doivent être IDENTIQUES.

## 8. Les autres classes du socle

| classe | usage |
|---|---|
| `.wrap` | conteneur 1120 px, gouttière 16-20 px |
| `.bloc` / `.blanc` / `.creme` | section avec marges ; fond blanc / crème (textes, liens, champs, FAQ s'adaptent) |
| `.page-tete` | chapeau des pages 2-4 (h1 plus petit que l'accueil, halo orange) |
| `.eti` | étiquette en capitales (orange clair ; orange texte sur blanc) |
| `.titre-bloc` | h2 limité à 26 caractères de large |
| `.lead` / `.intro-bloc` | chapô / texte d'introduction d'une section |
| `.centre` | centre le texte et les blocs `.titre-bloc`, `.intro-bloc`, `.lead` |
| `.doux` / `.fort` | texte doux / mot fort en orange |
| `.mot-cle` | 27/09 — LE mot-clé d'un titre de section, en orange (voir § 12) |
| `.lien-fleche` | 27/09 — lien texte fléché, 48 px (voir § 12) |
| `.survol` | 27/09 — carte qui monte de 4 px au survol de la souris (voir § 12) |
| `[data-boucle]` | 27/09 — animation en boucle mise en pause hors de l'écran (voir § 12) |
| `.actions` | rangée de boutons (retour à la ligne, écart 12 px) |
| `.btn` + `.btn-o` / `.btn-ghost` | bouton plein orange (texte nuit) / contour. UN SEUL `.btn-o` visible par écran (hors en-tête) |
| `.liste` | liste sans puces (avec tes SVG de coche, comme l'ancienne page) |
| `.liste.coches` | même liste, la coche est dessinée par la feuille (pas de SVG à écrire) |
| `.faq` + `details`/`summary` | questions fréquentes (le « + » tourne en « × ») |
| `.champ` | `<div class="champ"><label for>…</label><input …></div>` — 16 px, 52 px de haut |
| `.champ-aide` / `.champ-erreur` | texte d'aide / message d'erreur sous le champ (`hidden` quand rien) ; le champ fautif porte `aria-invalid="true"` + `aria-describedby` |
| `fieldset.champ` + `legend` + `.pastilles` | pastilles radio : `<label><input type="radio" name="metier" value="Café"><span>Café</span></label>` |
| `.direct` | pastilles de contact direct (téléphone, « Écrire un e-mail », « Page d'aide ») |
| `.lecteur` | texte lu par les lecteurs d'écran seulement |
| `[data-mail]`, `#lienMail` | lien e-mail assemblé en JS (voir ci-dessous) |

## 9. L'adresse e-mail (jamais en clair dans le HTML)

```html
<a id="lienMail" href="#">…Écrire un e-mail</a>                       <!-- sujet « Perify — demande de renseignements » -->
<a data-mail="Perify — essai gratuit" href="#">…</a>                <!-- sujet au choix -->
<a data-mail data-mail-texte href="#">chargement…</a>               <!-- affiche aussi l'adresse -->
```
Pour le repli du formulaire (essai.js) : `PerifyMail.lien(sujet, corps)` → `mailto:…?subject=…&body=…`
(encodage fait) ; `PerifyMail.adresse()` → l'adresse.

## 10. Divers

- `window.PerifySite.mouvementReduit` : `true` si le visiteur a demandé moins d'animations → ton script
  n'anime rien (éventail : cartes posées, pas de rebond).
- Icônes : SVG 24×24, `stroke="currentColor"`, trait 1,75-1,9, `aria-hidden="true"`. Coche des listes
  (ancienne page) : `<svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="#FF8A4C" stroke-width="2.4" stroke-linecap="round"/></svg>`
  (sur blanc, `stroke="#C2410C"`).
- Focus : `:focus-visible` orange clair (orange texte sur blanc) est déjà réglé pour a, button, input,
  select, textarea, summary et `[tabindex]`.

## 11. Les nouvelles images (préparées le 26/09)

| fichier | taille | poids | à savoir |
|---|---|---|---|
| `img/parcours.webp` | 1600 × 1117 | 165 Ko | **fond TRANSPARENT** (vague rouge + présentoir + 3 téléphones), marges vides rognées. Sur la nuit, un liseré clair apparaît au bord de la vague : le poser dans un grand bloc **blanc** arrondi (cahier § 7). QR du pass **non flouté : décision de Valentin du 26/09** (« pas besoin de flouter »). |
| `img/presentoir-digital-1.webp` | 600 × 900 | 92 Ko | Baps 1 (fond orange) |
| `img/presentoir-digital-2.webp` | 600 × 900 | 97 Ko | Baps 2 (fond rouge sombre) |
| `img/presentoir-digital-3.webp` | 600 × 900 | 148 Ko | Baps 3 (fond gris granuleux) |
| `img/presentoir-digital-4.webp` | 600 × 900 | 84 Ko | **aux couleurs de Perify** (« Falman test perify 1 ») |

Les quatre présentoirs sont des visuels pleins (aucun bord à rogner), QR du présentoir net (permis).
Les badges Apple/Google qu'on y voit font partie de la vraie image du présentoir : c'est permis, ce n'est
pas de la décoration.

## 12. Ajouts du 27/09 — lisibilité et fluidité (étude comparée avec TheGiftsClub)

Cahier : `EN-COURS/IMAGE/design-kit/REFONTE-V2.md` § 1.5. Aucune classe existante renommée ni retirée.

### Le mot-clé d'un titre — `.mot-cle`
```html
<h2 class="titre-bloc rev">Essayez-le <span class="mot-cle">quatorze jours</span> sur votre comptoir.</h2>
```
UN mot (ou groupe de mots) par titre de section, en orange clair sur nuit (6,9:1), orange texte sur
`.blanc` / `.creme` (5,2:1). Le texte ne change pas : on entoure un mot existant. En faisant défiler, on
saisit le sujet en une seconde. Ce n'est PAS le marqueur (`.marque` : barre orange, un seul par page, sur
le h1). **Proposition à faire trancher par Valentin** : les mots choisis sont listés dans le rendu des
agents.

### Le lien fléché — `.lien-fleche`
```html
<a class="lien-fleche" href="/comment-ca-marche">Voir comment ça marche<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
```
Texte en gras, souligné orange clair (orange texte sur blanc), flèche orange qui glisse de 4 px vers la
droite au survol. Cible de 48 px. Page 4 : `.essai-aller` (« Faire ma demande », flèche ↓, téléphone
seulement) s'en sert.

### Cartes qui réagissent au survol — `.survol` (et automatique pour 4 cartes)
Une carte survolée à la souris monte de 4 px, prend une ombre (plus légère sur fond blanc/crème) et, si
elle a un bord, un liseré orange clair. **Automatique** pour `.bento-bloc`, `.pilier` (page 1), `.etape`,
`.nombre` (page 2) ; ailleurs, ajoute la classe `survol` (page 3 : `.option`). Marche aussi sur une
carte `.rev`. Pour donner à tes cartes un autre survol, écris dans ta feuille les MÊMES sélecteurs que
site.css (§ 18 : `.bento-bloc:hover, .js .bento-bloc.vu:hover`) — ta feuille passe après et l'emporte ;
avec un sélecteur plus faible, le socle gagnerait (la fin d'apparition `.js .rev.vu{transform:none}`
écrase tout `:hover` moins précis). Tactile : rien. Mouvement réduit : ni montée ni transition.

### Économie — `[data-boucle]` → `.hors-ecran`
site.js pose `.hors-ecran` sur la bande des métiers, les `.btn-lumiere` et tout élément `[data-boucle]`
à plus de 120 px de l'écran ; site.css met alors en pause leurs animations (l'élément ET tout ce qu'il
contient, pseudo-éléments compris). Rien n'est caché. Pour une animation en boucle à toi : pose
`data-boucle` sur son conteneur, sans rien écrire d'autre. (accueil.js le faisait pour l'accueil le
26/09 ; retiré le 27/09 : seul le socle le fait, pour toutes les pages.)

### Le bouton d'essai dans la barre du téléphone — `.entete-essai` (rien à écrire)
Sous 920 px, site.js pose « Essai gratuit » (lu « Essai gratuit 14 jours ») dans la barre, à gauche de
« Menu », sur toutes les pages SAUF la page 4 (dont le bouton du menu porte `aria-current="page"`).
C'est ce que fait TheGiftsClub (étude du 27/09 : bouton d'essai dans sa barre du haut sur ses 4 pages,
aucune barre fixe en bas). L'en-tête est collant : le bouton est toujours à portée, sans jamais masquer
un contenu ni le pied de page. Le panneau du menu ne répète alors pas le bouton orange. De 480 à 919 px :
« Essai gratuit 14 jours » en entier. Sous 360 px : pas la place, le bouton reste dans le panneau.
Sans JS : rien d'ajouté. Copié dans doc.css (aide, mentions). Texte en 16 px (relecture du 27/09).

**Un seul bouton orange plein à l'écran** (relecture du 27/09) : tant qu'un autre bouton orange plein
de la page (`main .btn-o` : le bouton du haut de l'accueil, celui du bloc final « Essai »…) est à
l'écran, sous la barre, site.js pose `.essai-cache` sur `.entete` et le bouton de la barre s'efface en
fondu (`visibility:hidden` : il garde sa place, rien ne bouge, et caché il ne reçoit ni clic ni focus).
Il revient dès que l'autre bouton sort de l'écran. Rien à écrire dans ta page : tout `.btn-o` que tu
poses dans `<main>` est pris en compte. Sur ordinateur, le bouton du menu reste affiché (exception
« hors en-tête » du § 8, à faire trancher par Valentin).

**Page 4** : le bouton du menu qui porte `aria-current="page"` n'est plus orange plein mais un
**contour** orange clair (toutes largeurs) : le seul bouton orange plein de l'écran reste celui du
formulaire.

### Divers
- FAQ : la question survolée passe en orange clair (orange texte sur blanc).
- `.bloc` garde ses marges (étude : on a déjà plus d'air entre les sections que TheGiftsClub ; l'air se
  met DANS les blocs — moins de texte, visuels plus grands). Si l'accueil paraît long après la V2 :
  `.bloc{padding:clamp(56px,7vw,96px) 0}` (à décider, pas fait).

## 13. V3 du 28/09 — décisions de Valentin (priment sur les § précédents)

- **La page « Faites le calcul »** : `calculateur.html` (`/calculateur`) + `calculateur.css` + `calcul.js`
  (inchangé). L'étiquette, le titre (devenu le h1, marqueur sur « rapporte ») et la phrase d'introduction sont
  dans le chapeau ; le bloc blanc ne garde que les 4 champs et le panneau des résultats (ordinateur : champs sur
  une ligne, résultats côte à côte). Liens : la carte `.vers-calcul` de l'accueil et une ligne « Faites le
  calcul » dans le pied de page de TOUTES les pages (après « Ce que vous pilotez ») — jamais dans le menu du haut.
  Page ajoutée à `_outils/tests/lancer-tous.mjs` (PAGES). Pied de page type (§ 6) :
  `<a href="/calculateur">Faites le calcul</a><span aria-hidden="true">·</span>` entre « Ce que vous pilotez » et
  « Essai gratuit » (`aria-current="page"` sur la page du calcul).
- **L'orange est réservé aux boutons** : `.eti` en `--texte-doux` sur la nuit, `--gris` sur blanc/crème (12 px
  minimum sur téléphone) ; `.mot-cle` prend la couleur du titre (les `<span class="mot-cle">` restent dans les
  pages : une ligne de `site.css` suffit à les recolorer) ; le mot qui défile est blanc (nuit sur fond clair),
  seul son cadre à coins reste orange ; « Suite : » en `--texte-doux` ; `.fort` en gras de la couleur du texte.
  Restent orange : les boutons, le marqueur (un mot par page), les petits repères (coches, renvois ¹, flèches,
  soulignés des liens, pastilles numérotées, traits des chiffres) et les scènes dessinées.
- **Rythme des fonds** : la nuit ne garde que le héros / chapeau de page, le bloc final « Essai », « Suite » et
  le pied. Les autres sections alternent `.blanc` et `.creme` (accueil : présentoir blanc → chiffres crème →
  ce que ça change blanc → tout est compris crème → ça marche avec blanc ; page 2 : étapes crème → chiffres
  blanc ; page 3 : une bande par module, blanc/crème en alternance ; page 4 : essai blanc → qui crème → questions
  blanc ; calcul : blanc). Les scènes illustrées, les visuels des étapes (panneau nuit posé à 10 px du bord de la
  carte), le disque GPS et le panneau des résultats gardent leur fond sombre dans leur propre bloc.
- **Un seul bouton orange plein à l'écran, en-tête compris** : sur ordinateur, `.entete.essai-cache .menu > .btn-o`
  passe en contour (même signal que le bouton de la barre du téléphone, § 12). Copié dans `doc.css`.
- **Accueil, téléphone et tablette (< 960 px)** : `.hero-texte{display:contents}` — l'image monte sous
  « Pensée pour les… », plus grande, collée au bord droit de l'écran ; elle entre en entier dans le premier écran
  de 390 × 844. L'ordre du HTML ne change pas. Le bouton d'essai du héros passe sous l'image : pendant ce temps,
  celui de la barre est affiché.
- **Scène « Vérification en caisse »** : « Code valide ✓ » (texte à 12 unités) à partir de 1024 px ; en dessous,
  la pastille ne montre qu'une grande coche (`.sc-code-texte` / `.sc-code-coche`).
- **Contrôle du 28/09 (soir) — retouches sans changer un texte** : un filet gris clair (`--ligne-claire`) entre
  deux sections claires qui se suivent (`.blanc + .creme`, `.creme + .blanc` : crème et blanc ne diffèrent que de
  1,05:1) ; le marqueur passe SOUS les lettres (`bottom:-.06em; height:.2em`, son haut affleure la ligne de base) ;
  chapô de page en `text-wrap:pretty` ; sans JavaScript, le bouton du menu est en contour sur ordinateur ; page 4 :
  « Nom du commerce » et « Ville » côte à côte sur ordinateur (`.champs-duo`), haut de la bande resserré —
  « Continuer » dans le premier écran de 1440 × 900 ; page 2 : haut des étapes resserré, pastilles 1-2-3 en disque
  blanc bordé d'orange texte (plus d'aplat orange qui ressemble à un bouton) ; page 3 : 1re bande resserrée,
  « Données de démonstration. » sous la capture de l'offre ; accueil : sur ordinateur, l'image du héros descend
  jusqu'au bas de la section (le bras sort par le bord) ; sur écran peu haut, sa largeur suit la hauteur de
  l'écran ; calcul : plus d'air sous le panneau sombre ; 16 px minimum jusqu'à 919 px (tablette comprise).
