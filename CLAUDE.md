# site vitrine — perify.app, le site public (consignes pour toute session Claude)

Le site public de **Perify**, pour les commerçants prospects. Il tient en **4 pages** reliées par le menu
(« comme TheGiftsClub »), plus le calculateur et deux pages de texte :

| page | fichier | adresse |
|---|---|---|
| 1 — Accueil | `index.html` (+ `accueil.css`, `eventail.css`, `eventail.js`) | `/` |
| 2 — Comment ça marche | `comment-ca-marche.html` (+ `comment.css`) | `/comment-ca-marche` |
| 3 — Ce que vous pilotez | `ce-que-vous-pilotez.html` (+ `pilotez.css`) | `/ce-que-vous-pilotez` |
| 4 — Essai gratuit (+ « Qui est derrière », questions) | `essai-gratuit.html` (+ `essai.css`, `essai.js`) | `/essai-gratuit` |
| Faites le calcul (hors menu) | `calculateur.html` (+ `calculateur.css`, `calcul.js`) | `/calculateur` |
| Aide, mentions légales | `aide.html`, `mentions-legales.html` (rien d'autre que `site.css`) | `/aide`, `/mentions-legales` |

HTML / CSS / JS simple, sans framework ni build. Hébergé sur Vercel (`cleanUrls` : liens internes sans
`.html`), déploiement à chaque push sur `main`. Le propriétaire, Valentin CARRILLO (deux r), n'est pas
développeur : écris-lui en français simple. Les `.md` ne sont pas publiés (`.vercelignore`), mais le dépôt
GitHub est **public** : rien d'interne dans les commentaires HTML.

## Refonte A (30/10/2026, direction choisie par Valentin : « clair, au plus près de TheGiftsClub »)
Validée sur la maquette `/maquette-a` (retirée depuis : l'accueil l'a remplacée ; étude, comparatif et prototype :
`EN-COURS/IMAGE/livraisons/2026-10-30-refonte-perify/`). Elle **remplace** les règles « V3 » (alternance blanc /
crème, nuit en haut de page) et « accueil simplifié » d'avant.
- **Un seul fond clair** pour toutes les pages (`#F8F9FE`) ; la **nuit `#1B1F3B`** ne sert qu'à la **barre du haut**
  et au **pied**. Au plus **une bande teintée** par page (`#F0F2FC`, classe `.teinte`) : les jeux (accueil), « En
  chiffres » (page 2), « Qui est derrière » (page 4). Les captures sont posées sur une **plaque teintée** (`.cadre-visuel`),
  le bloc « Essai » de fin de page est une plaque teintée centrée, le formulaire et le calculateur sont des **cartes blanches**.
- **Plus jamais** : crème `#FFF8F0` en fond, halo, grain, mot surligné (marqueur), mot-clé coloré, étiquette en capitales
  espacées au-dessus des titres, mot qui défile, bande des métiers qui tourne, bordure lumineuse, apparitions au
  défilement, compteurs qui roulent tout seuls, entrée animée des morceaux de carte. Seules indications au-dessus d'un
  titre : le **nom de la page** en petit (`.page-nom`, casse normale) et les pastilles « Nouveau », « Sur iPhone »,
  « En option » (`.pastille`, casse normale).
- **Orange `#FF6B2C` = le bouton principal, UN par écran**, texte nuit (5,7:1). Le bouton de la barre du haut est
  **toujours en contour** (orange sur la nuit) : il ne fait jamais un second bouton plein (plus de `.essai-cache`).
  Les autres boutons sont `.btn-second` (contour nuit). Orange texte `#C2410C` : erreurs et anneau de focus seulement.
- **Polices** : Plus Jakarta Sans 800 (titres, chiffres) + Inter (texte), servies par `polices/`. Titres à peine
  resserrés (`-0.012em`, compensé entre les mots) : jamais de mots collés.
- **L'accueil** = la maquette A : héros centré (titre, phrase, bouton, une ligne) → la vraie carte Wallet et quatre
  morceaux de la carte autour (`img/carte-*.webp`) → « Ça marche avec » (noms en texte) → **les présentoirs (éventail)
  AVANT la vidéo** (demande de Valentin) → vidéo → parcours (4 dessins `img/scenes/`) → jeux + « Faites le calcul »
  (bande teintée) → ce que vous pilotez → l'essai avec les photos du présentoir et « Une seule personne… » → questions.
  Ordinateur 1440 × 900 : le premier écran montre titre, phrase, bouton ET le téléphone avec ses morceaux (téléphone de
  272 px, morceaux placés par rapport à ses bords). Téléphone : la roue et le cadeau se posent au pied du téléphone
  (sur la zone du QR), la barre de tampons dessous ; rien ne recouvre les deux cartes ; l'invitation à l'avis est retirée.
- Les dessins `img/scenes/*.svg` viennent de la session Design (`IMAGE/livraisons/2026-10-29-parcours-illustre/`,
  générateur `sources/fabrique.mjs`) : on corrige le générateur puis on relivre, jamais les SVG à la main. Les trois jeux
  sont au même niveau, sans badge (faits sur mesure ; au 29/10 seule la roue existe dans le produit).

## Le socle commun
- **`site.css`, LA feuille commune** de toutes les pages : polices (`@font-face`), jetons, en-tête + menu téléphone,
  boutons, sections (`.section`, `.teinte`, `.filet`, `.page-tete`), plaque des visuels, liste cochée, pastilles,
  bloc « Essai » de fin de page, lien « Suite », questions, champs, pied, et les **pages de texte** (aide, mentions :
  `<body class="page-texte">`, leurs classes d'origine `.mono`, `.chapeau`, `.bloc`, `.actions`). `doc.css` n'existe
  plus. Chaque page ajoute sa feuille (tableau ci-dessus) ; `eventail.css` est l'éventail des présentoirs.
- **`site.js`** : le menu téléphone (un `<details>` qui s'ouvre sans script ; le script le referme avec Échap, un clic
  dehors, un lien), `window.PerifySite.mouvementReduit`, `window.PerifyCompteur` (pour `calcul.js`), l'e-mail assemblé
  (`#lienMail`, `[data-mail]`, `window.PerifyMail`). `accueil.js` et `parcours.css` n'existent plus.
- L'en-tête et le pied sont **identiques sur les sept pages** (seul `aria-current` change) : une retouche se reporte
  partout. HTML prêt à copier et mode d'emploi : **`_GABARIT.md`**.

## Ce qui ne se discute pas
- **Aucun chiffre inventé** (pas de « +30 % de fidélité », pas de « 1 000 commerces »), **aucun prix**
  (les tarifs se donnent de vive voix), aucun commerce nommé sans son accord, aucun faux avis, aucun
  témoignage, aucun compte à rebours. Seuls nombres permis : ceux du cahier, et (01/10, demande de Valentin)
  les quatre études américaines de « Comment ça marche » (sources 4 à 7), chacune vérifiée à sa source. La ligne « En service
  aujourd'hui dans une boulangerie à Cruseilles et un restaurant à Annecy » est **supprimée** (décision
  du 26/09) : ne pas la remettre.
- **Les textes sont validés par Valentin** : on peut resserrer une phrase, pas changer le sens ni le ton
  (chaleureux, direct, artisanal, vouvoiement du commerçant, « je » pour Valentin, jamais « nous »). La refonte A les a
  gardés **mot pour mot** (seule la phrase du héros est raccourcie, accord de Valentin) ; tout texte ajouté ou retiré
  lui est listé. **`mentions-legales.html`** : son contenu (`<main>`) ne change pas d'un mot sans lui ; deux commentaires
  HTML seulement (`grep -c "<!--"` → 2).
- **Le formulaire d'essai** (page 4, `essai.js`, 3 étapes) envoie la demande à `https://api.perify.app/exec`
  (JSON, `action: "demande_essai"`) ; si la réponse n'est pas `{status:"ok"}`, après 12 s ou sans réseau,
  il affiche le téléphone et un bouton qui ouvre la messagerie avec le message prérempli (`mailto:`
  assemblé en JavaScript). Rien n'est perdu en silence. L'adresse e-mail n'est jamais écrite en clair
  dans le HTML (`#lienMail`, `[data-mail]`, `PerifyMail`). Garder les identifiants des champs
  (`nom`, `commerce`, `ville`, `tel`, `email`, `message`, + `metier`, `creneau`, piège `site_web`) et les classes
  lues par `essai.js` (`.etape-form`, `.progression…`, `.etape-titre`, `.champ`, `.par-etapes`, `.entre`).
  Aucun autre service tiers sans accord.
- **Couleurs** : nuit `#1B1F3B`, orange `#FF6B2C` (boutons), orange clair `#FF8A4C` (survol, focus sur la nuit),
  orange texte `#C2410C` (erreurs, focus sur le clair), fond `#F8F9FE`, bande `#F0F2FC`, cartes `#FDFDFF`. **Plus de
  jaune** (retiré le 24/09), **plus de crème** en fond (30/10) : toute couleur par défaut d'un composant modèle (jaune,
  violet, bleu, cyan) est remplacée. Couleurs en hexadécimal (pas d'OKLCH : un vieux téléphone n'afficherait rien).
- **Vraies images seulement** (`img/` : visuels Photoshop de Valentin en WebP, captures des vraies pages,
  éléments de la vraie carte) ; jamais de maquette de téléphone dessinée en HTML/CSS, jamais de police à
  empattements « style IA ». Sources hors dépôt (`IMAGE/ressources/valentin-24-09/`,
  `IMAGE/ressources-valentin/`), préparées avec `sharp` hors du dépôt.
- **QR** : celui d'un **présentoir** pouvait rester net (décision de Valentin, 26/09) — **01/10 : flouté sur
  les 8 images** (site ca1118b) parce que ces QR menaient à baps.perify.app et falman.perify.app (un visiteur créait
  une vraie carte chez eux) ; le flou « rendait trop mal » → **remplacé le soir même par un QR NET vers perify.app**
  (site 0fd912a, qr-site-perify.png posé au même angle). Règle : sur le site, un QR de présentoir mène à perify.app ou à
  un commerce de démo, jamais à un vrai commerce. Décoder toute image de présentoir avant de pousser. Le QR ou le numéro d'une
  **carte client** (pass Wallet) se floute TOUJOURS — y compris dans `img/parcours.webp`, où le QR du pass
  (téléphone du haut) est flouté (26/09) — et celui du présentoir aussi depuis le 01/10. Le visuel du héros
  (`img/carte-wallet.webp`, tiré de `carte-wallet-2026-10-30.webp`) porte le QR de perify.app.
- Les captures d'écran avec des chiffres portent « Données de démonstration. » (accueil : « Captures de la vraie
  carte, données de démonstration. », aussi sous les trois étapes de la page 2 depuis le 30/10).
- Les badges Apple / Google ne servent jamais de décoration ; dans « Ça marche avec », les noms sont écrits
  en texte, **aucun logo de marque tierce** (les logos Instagram, Facebook, Tripadvisor de `img/logos/` ne sont plus
  affichés depuis le 30/10).
- Aucun script externe (ni CDN, ni GSAP, ni React), aucune ressource externe. **Polices (07/10/2026, audit
  légal point 10)** : servies par perify.app (`polices/`, mêmes fichiers que Google Fonts : Inter v20,
  Plus Jakarta Sans v12, latin + latin-ext, licence SIL OFL dans `polices/OFL-*.txt`), déclarées en tête de
  `site.css` ; ne jamais remettre de lien vers fonts.googleapis.com ou fonts.gstatic.com (l'adresse IP du
  visiteur partait chez Google). Cache d'un an « immutable » sur `/polices/` et `/video/` (vercel.json) : un fichier
  n'est jamais remplacé sous le même nom, une nouvelle version prend un nouveau nom.
  **Exception (01/10, demande de Valentin)** : Microsoft Clarity, chargé par `consentement.js` SEULEMENT si
  `CLARITY_ID` est rempli ET après « Accepter » (bandeau CNIL : « Refuser » aussi simple qu'« Accepter », choix
  gardé 6 mois, « Gérer les cookies » ajouté au bout de la liste `.pied-liens` du pied de chaque page). Aucune donnée
  du formulaire n'y va. Les effets des composants modèles (`IMAGE/ressources/composants-tsx/`) sont refaits à la main.
- Lisibilité : contraste ≥ 4,5:1, 16 px minimum sur téléphone (champs 16 px ; seule exception, les petits renvois
  numérotés vers les sources, 12 px avec une cible de 48 px), cibles ≥ 48 px, `:focus-visible`, un seul `<h1>` par
  page, aucun défilement horizontal à 320, 375, 768, 1024 et 1440 px, `prefers-reduced-motion` respecté (aucune
  animation, valeurs finales). Rien ne reste invisible si le JavaScript ne tourne pas. Pas d'emoji en guise d'icône.
- **Grilles** : toujours `minmax(0, 1fr)`, jamais une colonne `auto` ou `1fr` seule (Safari iPhone fait zoomer toute la
  page, invisible au Chrome simulé — JOURNAL-BUGS, 29/10) ; `overflow-x: clip` (et non hidden) sur `html` ET `body`.
- Commentaires en **français**. Fins de ligne : LF partout (y compris aide et mentions).

## Vérifier
- `node _outils/tests/lancer-tous.mjs --seulement "des pages" > fichier 2>&1` (depuis `EN-COURS`), puis lire le **code
  de sortie** et le fichier — jamais `| tail` (le tube rend toujours 0). Il vérifie la syntaxe des scripts en ligne des
  pages ET des `.js` du site (`site.js`, `eventail.js`, `calcul.js`, `essai.js`, `consentement.js` ; `accueil.js`
  seulement s'il existe encore), les `.catch` fautifs, et `verif-ressources-externes.mjs` : aucune ressource chargée
  depuis un autre site, aucune adresse de Google Fonts, chaque page charge `site.css` (où sont les `@font-face`),
  fichiers et licences présents dans `polices/` (⚠️ tant qu'un fichier de `polices/` n'est pas dans git : Vercel publie
  ce qui est dans git).
- Captures pleine page de **chaque** page (7 pages + étape 2 et réussite de l'essai, 1440 et 390 px) :
  `node _outils/captures-vitrine.mjs` → `IMAGE/apercus/vitrine-4-pages/final/`. Capture téléphone réelle d'une page :
  `node _outils/apercu-mobile.mjs <page> <sortie.png>`.
- Le regard final (captures ordinateur + téléphone) se fait sur la machine de Valentin, et sur un vrai iPhone (Safari).
  Une PR doit rester petite et décrire ce qu'il faut regarder.

## Ce qu'une session cloud ne peut pas faire (le dire, ne pas contourner)
- Pousser sur `main` : **tout passe par une PR**. Voir un rendu, ni les autres dépôts, ni la mémoire du
  projet. Les ressources images arrivent par Valentin, pas par génération.
