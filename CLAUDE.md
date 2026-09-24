# site vitrine — perify.app, la front page (consignes pour toute session Claude)

Le site public de **Perify** : `index.html` (la page d'accueil pour les commerçants prospects),
`aide.html`, `mentions-legales.html`, `doc.css` (feuille des pages de texte), `img/`. HTML / CSS / JS
simple, sans framework ni build. Hébergé sur Vercel (`cleanUrls`), déploiement à chaque push sur
`main`. Le propriétaire, Valentin CARRILLO, n'est pas développeur : écris-lui en français simple.

## Ce qui ne se discute pas
- **Aucun chiffre inventé** (pas de « +30 % de fidélité », pas de « 1 000 commerces »), **aucun prix**
  (les tarifs se donnent de vive voix), aucun commerce nommé sans son accord, aucun faux avis, aucun
  compte à rebours. La ligne de confiance actuelle : « une boulangerie à Cruseilles et un restaurant
  à Annecy », sans les nommer.
- **Les textes de la page sont validés par Valentin** : on peut resserrer une phrase, pas changer le
  sens ni le ton (chaleureux, direct, artisanal, vouvoiement du commerçant).
- **Le formulaire « Être rappelé »** ouvre la messagerie du visiteur avec le message prérempli
  (`mailto:` assemblé en JavaScript, adresse jamais écrite en clair). Garder les identifiants des
  champs ; ne pas brancher de service tiers sans accord.
- **Les badges Apple / Google** sont les fichiers officiels (`img/`), jamais redessinés.
- **Direction B en ligne depuis le 24/09** : nuit `#1B1F3B`, orange `#FF6B2C`, jaune `#FFC53D`, Plus Jakarta Sans 800
  + Inter, la même identité que la carte et l'espace commerçant. Les images sont de **vraies images** (`img/` : visuels
  Photoshop de Valentin recadrés en WebP, photos du présentoir, éléments de la vraie carte) ; jamais de maquette
  dessinée en HTML à la place d'une image, jamais de police à empattements « style IA ». Les sources sont hors dépôt
  (`IMAGE/ressources/valentin-24-09/`, `IMAGE/ressources-valentin/`). Un QR ou un numéro de carte réel ne se publie
  jamais : flouter. Les captures d'écrans avec des chiffres portent « Données de démonstration ». Les boutons orange ont
  le texte en nuit (lisibilité 5,7:1). Les badges Apple/Google ne servent pas de décoration.
- Lisibilité : contraste ≥ 4,5:1, 16 px minimum sur téléphone, boutons ≥ 48 px, quatre largeurs
  (375, 768, 1024, 1440), `prefers-reduced-motion` respecté, pas d'emoji en guise d'icône.
- Commentaires en **français**.

## Vérifier
- Pas d'essai automatique ici : la vérification (captures ordinateur + téléphone) se fait sur la
  machine de Valentin. Une PR doit rester petite et décrire ce qu'il faut regarder.

## Ce qu'une session cloud ne peut pas faire (le dire, ne pas contourner)
- Pousser sur `main` : **tout passe par une PR**. Voir un rendu, ni les autres dépôts, ni la mémoire du
  projet. Les ressources images arrivent par Valentin, pas par génération.
