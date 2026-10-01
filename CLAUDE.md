# site vitrine — perify.app, le site public (consignes pour toute session Claude)

Le site public de **Perify**, pour les commerçants prospects. Depuis le 26/09 il tient en **4 pages**
reliées par le menu (« comme TheGiftsClub ») :

| page | fichier | adresse |
|---|---|---|
| 1 — Accueil | `index.html` (+ `accueil.css`, `accueil.js`) | `/` |
| 2 — Comment ça marche | `comment-ca-marche.html` (+ `comment.css`) | `/comment-ca-marche` |
| 3 — Ce que vous pilotez | `ce-que-vous-pilotez.html` (+ `pilotez.css`) | `/ce-que-vous-pilotez` |
| 4 — Essai gratuit (+ « Qui est derrière », FAQ) | `essai-gratuit.html` (+ `essai.css`, `essai.js`) | `/essai-gratuit` |
| Faites le calcul (28/09, hors menu) | `calculateur.html` (+ `calculateur.css`, `calcul.js`) | `/calculateur` |

**V3 (28/09, décisions de Valentin)** : « Faites le calcul » a quitté la page 2 pour sa propre page, reliée
discrètement (carte de l'accueil + ligne du pied de page de toutes les pages, **pas** dans le menu du haut).
**L'orange est réservé aux boutons** (plus d'étiquette, de mot-clé, de mot qui défile ni de « Suite : » en
orange ; seul le marqueur d'un mot par page reste). **Rythme des fonds** : la nuit ne garde que le haut de page
(héros / chapeau), le bloc final « Essai » et le pied ; les autres sections alternent **blanc** et **crème**
(textes nuit) ; les scènes illustrées, les visuels des étapes, le disque GPS et le panneau des résultats
gardent leur fond sombre dans leur propre bloc. Sur ordinateur, le bouton du menu passe en contour quand un autre bouton orange
plein est à l'écran. Détail : `_GABARIT.md` § 13.

Plus `aide.html` et `mentions-legales.html` (feuille `doc.css`), et `img/`. HTML / CSS / JS simple, sans
framework ni build. Hébergé sur Vercel (`cleanUrls` : liens internes sans `.html`), déploiement à chaque
push sur `main`. Le propriétaire, Valentin CARRILLO (deux r), n'est pas développeur : écris-lui en
français simple.

**Le socle commun** : `site.css` (jetons, en-tête + menu téléphone, boutons, bordure lumineuse,
marqueur, mot qui défile, compteur, bande des métiers, apparitions, sections, bloc « Essai » final, lien
« Suite », FAQ, champs, pied de page) et `site.js` (apparitions, menu téléphone, marqueur, compteur qui
roule, mot qui défile, e-mail assemblé). Mode d'emploi et HTML prêt à copier : **`_GABARIT.md`**.
L'en-tête, le menu et le pied sont **recopiés dans `doc.css`** (aide, mentions) : une retouche dans
`site.css` s'y reporte. Les `.md` ne sont pas publiés (`.vercelignore`). Le cahier de la refonte :
`EN-COURS/IMAGE/design-kit/REFONTE-4-PAGES.md` (seule source des textes).

## Ce qui ne se discute pas
- **Aucun chiffre inventé** (pas de « +30 % de fidélité », pas de « 1 000 commerces »), **aucun prix**
  (les tarifs se donnent de vive voix), aucun commerce nommé sans son accord, aucun faux avis, aucun
  témoignage, aucun compte à rebours. Seuls nombres permis : ceux du cahier, et (01/10, demande de Valentin)
  les quatre études américaines de « Comment ça marche » (sources 4 à 7), chacune vérifiée à sa source. La ligne « En service
  aujourd'hui dans une boulangerie à Cruseilles et un restaurant à Annecy » est **supprimée** (décision
  du 26/09) : ne pas la remettre.
- **Les textes sont validés par Valentin** : on peut resserrer une phrase, pas changer le sens ni le ton
  (chaleureux, direct, artisanal, vouvoiement du commerçant, « je » pour Valentin, jamais « nous »).
- **Le formulaire d'essai** (page 4, `essai.js`, 3 étapes) envoie la demande à `https://api.perify.app/exec`
  (JSON, `action: "demande_essai"`) ; si la réponse n'est pas `{status:"ok"}`, après 12 s ou sans réseau,
  il affiche le téléphone et un bouton qui ouvre la messagerie avec le message prérempli (`mailto:`
  assemblé en JavaScript). Rien n'est perdu en silence. L'adresse e-mail n'est jamais écrite en clair
  dans le HTML (`#lienMail`, `[data-mail]`, `PerifyMail`). Garder les identifiants des champs
  (`nom`, `commerce`, `ville`, `tel`, `email`, `message`, + `metier`, `creneau`, piège `site_web`).
  Aucun autre service tiers sans accord.
- **Direction B** : nuit `#1B1F3B`, orange `#FF6B2C`, orange foncé `#E85A1B`, **orange clair `#FF8A4C`
  en accent** sur nuit, orange texte `#C2410C` sur blanc, blocs blancs. **Plus de jaune** (retiré le 24/09) :
  toute couleur par défaut d'un composant modèle (jaune, violet, bleu, cyan) est remplacée. Plus Jakarta
  Sans 700/800 + Inter, rien d'autre. Boutons orange : texte nuit (5,7:1).
- **Vraies images seulement** (`img/` : visuels Photoshop de Valentin en WebP, captures des vraies pages,
  éléments de la vraie carte) ; jamais de maquette de téléphone dessinée en HTML/CSS, jamais de police à
  empattements « style IA ». Sources hors dépôt (`IMAGE/ressources/valentin-24-09/`,
  `IMAGE/ressources-valentin/`), préparées avec `sharp` hors du dépôt.
- **QR** : celui d'un **présentoir** pouvait rester net (décision de Valentin, 26/09) — **01/10 : flouté sur
  les 8 images** (site ca1118b) parce que ces QR menaient à baps.perify.app et falman.perify.app (un visiteur créait
  une vraie carte chez eux). Un QR de démo (commerce « Perify · démo ») ou du site pourra rester net ; jamais celui
  d'un vrai commerce. Décoder toute image de présentoir avant de pousser. Le QR ou le numéro d'une
  **carte client** (pass Wallet) se floute TOUJOURS — y compris dans `img/parcours.webp`, où le QR du pass
  (téléphone du haut) est flouté (26/09) — et celui du présentoir aussi depuis le 01/10.
- Les captures d'écran avec des chiffres portent « Données de démonstration. ».
- Les badges Apple / Google ne servent jamais de décoration ; dans « Ça marche avec », les noms sont écrits
  en texte, aucun logo de marque tierce.
- **Un seul bouton orange plein à l'écran**, en-tête compris (téléphone : le bouton de la barre s'efface ;
  ordinateur : celui du menu passe en contour — site.js pose `.essai-cache` sur l'en-tête).
- Aucun script externe (ni CDN, ni GSAP, ni React) : seules ressources externes, les polices Google.
  **Exception (01/10, demande de Valentin)** : Microsoft Clarity, chargé par `consentement.js` SEULEMENT si
  `CLARITY_ID` est rempli ET après « Accepter » (bandeau CNIL : « Refuser » aussi simple qu'« Accepter », choix
  gardé 6 mois, « Gérer les cookies » au pied de chaque page). Aucune donnée du formulaire n'y va.
  Les effets des composants modèles (`IMAGE/ressources/composants-tsx/`) sont refaits à la main.
- Lisibilité : contraste ≥ 4,5:1, 16 px minimum sur téléphone (champs 16 px), cibles ≥ 48 px,
  `:focus-visible`, un seul `<h1>` par page, quatre largeurs (375, 768, 1024, 1440) sans défilement
  horizontal, `prefers-reduced-motion` respecté (aucune animation, valeurs finales). Rien ne reste
  invisible si le JavaScript ne tourne pas. Pas d'emoji en guise d'icône.
- Commentaires en **français**. Fins de ligne : garder celles du fichier (aide et mentions en CRLF).

## Vérifier
- `node _outils/tests/lancer-tous.mjs --seulement "des pages"` (depuis `EN-COURS`) : syntaxe des scripts
  en ligne des pages ET des `.js` du site (`site.js`, `accueil.js`, `eventail.js`, `calcul.js`, `essai.js`), plus les
  `.catch` fautifs. Capture téléphone réelle : `node _outils/apercu-mobile.mjs <page> <sortie.png>`.
- Le regard final (captures ordinateur + téléphone) se fait sur la machine de Valentin. Une PR doit rester
  petite et décrire ce qu'il faut regarder.

## Ce qu'une session cloud ne peut pas faire (le dire, ne pas contourner)
- Pousser sur `main` : **tout passe par une PR**. Voir un rendu, ni les autres dépôts, ni la mémoire du
  projet. Les ressources images arrivent par Valentin, pas par génération.
