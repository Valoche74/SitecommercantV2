/* ─────────────────────────────────────────────────────────────
   PERIFY — calcul.js, « Faites le calcul » (page 2, 26/09/2026)
   Chargé en defer APRÈS site.js : il se sert de window.PerifyCompteur
   (le compteur qui roule) quand il est là, et s'en passe sinon.

   Trois résultats, avec les chiffres du commerçant :
     Un tampon vous coûte     = prix de revient ÷ tampons
     Une visite vous rapporte = panier moyen × marge
     Une visite de plus paie  = (panier × marge) ÷ (revient ÷ tampons), arrondi à l'unité
   Exemple de départ : 9 € · 60 % · 1,50 € · 10 → 0,15 € · 5,40 € · 36 tampons.

   Garde-fous : champ vide, zéro, négatif ou illisible → « — » (jamais NaN,
   jamais Infinity) ; la marge est bornée à 100 % ; format français (0,15 €) ;
   un coût de tampon trop petit pour s'écrire en 6 décimales → « — » (jamais un faux zéro).
   Un calcul, pas une promesse : rien n'est inventé, rien n'est envoyé.

   1. Le moteur, sans page : window.PerifyCalcul. Il est aussi chargé par
      l'essai (scratchpad/essai-calcul.mjs), où « document » n'existe pas.
   2. La page : les champs, les compteurs, la phrase de conclusion.
   ───────────────────────────────────────────────────────────── */
(function(racine){
  'use strict';

  /* ── 1. Le moteur ─────────────────────────────────────── */

  var MARGE_MAX = 100;
  var NBSP = ' ';

  // « 9 », « 1,50 », « 1.5 », « 9 € », « 60 % », « 1 000 » → nombre ; vide ou illisible → null.
  // Une virgule finale (« 1, » pendant la frappe) compte comme « 1 ».
  function lireNombre(texte){
    if (texte === null || texte === undefined) return null;
    if (typeof texte === 'number') return isFinite(texte) ? texte : null;
    var s = String(texte).replace(/[\s  ]+/g, '').replace(/^[€%]+|[€%]+$/g, '');
    if (!/^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/.test(s)) return null;
    var n = Number(s.replace(',', '.'));
    return isFinite(n) ? n : null;
  }

  // Strictement positif, sinon null : vide, zéro, négatif ou illisible → « — ».
  function positif(texte){
    var n = lireNombre(texte);
    return (n !== null && n > 0) ? n : null;
  }

  function fini(v){ return (typeof v === 'number' && isFinite(v)) ? v : null; }

  // Arrondi DÉCIMAL juste : on arrondit l'écriture décimale du nombre (12 chiffres
  // significatifs), pas son approximation binaire. Ainsi 5,4 ÷ 0,15 donne 36 et non
  // 36,000000000000007, et 2,675 s'arrondit à 2,68 (et non 2,67). La demi-unité monte.
  function arrondir(x, decimales){
    if (typeof x !== 'number' || !isFinite(x)) return null;
    var d = decimales || 0;
    var e = Number(x.toPrecision(12)).toExponential().split('e');
    var r = Math.round(Number(e[0] + 'e' + (Number(e[1]) + d)));
    return fini(r / Math.pow(10, d));
  }

  // Décimales du coût d'un tampon : 2 d'habitude ; jusqu'à 6 (le plafond de format()) si le
  // coût est si petit qu'il s'afficherait « 0,00 € ». Un coût réel n'est jamais montré comme
  // nul : s'il vaut encore 0 à 6 décimales, calculer() rend « — » (voir plus bas).
  var DECIMALES_MAX = 6;
  function decimalesCout(v){
    var d = 2;
    while (d < DECIMALES_MAX && v > 0 && arrondir(v, d) === 0) d++;
    return d;
  }

  /* Le calcul. entrees = { panier, marge, revient, tampons } : les textes des champs (ou des nombres).
     Rend les valeurs à afficher, déjà arrondies (null = « — ») :
       { tampon, decimalesTampon, visite, paie, margeBornee } */
  function calculer(entrees){
    entrees = entrees || {};
    var panier = positif(entrees.panier);
    var marge = positif(entrees.marge);
    var margeBornee = false;
    if (marge !== null && marge > MARGE_MAX) { marge = MARGE_MAX; margeBornee = true; }   // marge bornée à 0-100
    var revient = positif(entrees.revient);
    var tampons = positif(entrees.tampons);

    // Un tampon vous coûte = prix de revient ÷ tampons
    var tampon = (revient !== null && tampons !== null) ? fini(revient / tampons) : null;
    // Une visite vous rapporte = panier × marge (la marge est en %)
    var visite = (panier !== null && marge !== null) ? fini(panier * marge / 100) : null;
    // Une visite de plus paie = (panier × marge) ÷ (revient ÷ tampons), arrondi à l'unité.
    // Écrit en UNE division, (panier × marge × tampons) ÷ (100 × revient) : la même quantité,
    // calculée sur les valeurs exactes (pas sur les résultats arrondis), avec moins d'arrondis binaires.
    var paie = (tampon !== null && visite !== null) ? fini((panier * marge * tampons) / (100 * revient)) : null;

    var dT = tampon === null ? 2 : decimalesCout(tampon);
    var tamponAffiche = tampon === null ? null : arrondir(tampon, dT);
    // Coût positif qui s'arrondit encore à 0 à 6 décimales (saisie irréaliste, ex. 0,0000001 €) :
    // « — » plutôt qu'un « 0,000000 € » faux, et « — » aussi pour la visite de plus, qui en découle.
    if (tamponAffiche === 0) { tamponAffiche = null; paie = null; dT = 2; }
    return {
      tampon: tamponAffiche,
      decimalesTampon: dT,
      visite: visite === null ? null : arrondir(visite, 2),
      paie: paie === null ? null : arrondir(paie, 0),
      margeBornee: margeBornee
    };
  }

  // 1234.5 → « 1 234,50 » (espace fine insécable, virgule) : le même format que PerifyCompteur.
  var formateurs = {};
  function format(v, decimales){
    var d = Math.max(0, Math.min(6, parseInt(decimales, 10) || 0));
    if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;          // jamais « -0 »
    try {
      var f = formateurs[d] || (formateurs[d] = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }));
      return f.format(v);
    } catch (e) {
      var m = Math.abs(v).toFixed(d).split('.');
      m[0] = m[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return (v < 0 ? '-' : '') + m.join(',');
    }
  }

  // L'unité après « Une visite de plus paie » : 0 et 1 au singulier, comme en français.
  function unite(paie){ return (paie !== null && paie < 2) ? 'tampon' : 'tampons'; }

  // Les textes affichés (pour l'essai, et pour la page quand PerifyCompteur manque).
  function textes(r){
    var paie = r.paie === null ? '—' : format(r.paie, 0);
    return {
      tampon: r.tampon === null ? '—' : format(r.tampon, r.decimalesTampon) + NBSP + '€',
      visite: r.visite === null ? '—' : format(r.visite, 2) + NBSP + '€',
      paie: paie,
      unite: r.paie === null ? '' : unite(r.paie),
      // le bout calculé de la phrase « …cette visite paie 36 tampons. »
      conclusion: r.paie === null ? '' : paie + NBSP + unite(r.paie)
    };
  }

  racine.PerifyCalcul = {
    lireNombre: lireNombre, calculer: calculer, arrondir: arrondir, format: format, textes: textes, MARGE_MAX: MARGE_MAX
  };

  if (typeof document === 'undefined') return;   // hors navigateur (essai) : le moteur suffit

  /* ── 2. La page ───────────────────────────────────────── */
  function demarrer(){
    var formulaire = document.getElementById('calcul-formulaire');
    if (!formulaire) return;
    var champs = {
      panier: document.getElementById('calcul-panier'),
      marge: document.getElementById('calcul-marge'),
      revient: document.getElementById('calcul-revient'),
      tampons: document.getElementById('calcul-tampons')
    };
    if (!champs.panier || !champs.marge || !champs.revient || !champs.tampons) return;
    var sorties = {
      tampon: document.getElementById('res-tampon'),
      visite: document.getElementById('res-visite'),
      paie: document.getElementById('res-paie')
    };
    var uniteEl = document.getElementById('res-paie-unite');
    var phrase = document.getElementById('calcul-conclusion');
    var phraseNombre = document.getElementById('calcul-conclusion-nombre');

    function lireChamps(){
      return { panier: champs.panier.value, marge: champs.marge.value, revient: champs.revient.value, tampons: champs.tampons.value };
    }

    // Écrit (ou fait rouler, 0,6 s) un résultat ; valeur null → « — ».
    function afficher(el, valeur, decimales, texte, rouler){
      if (!el) return;
      var C = window.PerifyCompteur;
      if (C && typeof C.animer === 'function' && typeof C.ecrire === 'function') {
        if (rouler) C.animer(el, valeur, { duree: 600, decimales: decimales });
        else C.ecrire(el, valeur, { decimales: decimales });
        return;
      }
      el.textContent = texte;             // sans site.js : le texte, sans animation
    }

    // La phrase de conclusion. Résultat incomplet : elle se tait (sa place reste réservée).
    function majPhrase(r, t){
      if (!phrase || !phraseNombre) return;
      if (r.paie === null) { phrase.classList.add('vide'); return; }
      phraseNombre.textContent = t.conclusion;
      phrase.classList.remove('vide');
    }

    var minuteur = 0;
    function mettreAJour(rouler){
      var r = calculer(lireChamps());
      var t = textes(r);
      // le compteur de site.js relit data-decimales (roulement à l'entrée dans l'écran) : on le tient à jour
      if (sorties.tampon) sorties.tampon.setAttribute('data-decimales', String(r.decimalesTampon));
      afficher(sorties.tampon, r.tampon, r.decimalesTampon, t.tampon, rouler);
      afficher(sorties.visite, r.visite, 2, t.visite, rouler);
      afficher(sorties.paie, r.paie, 0, t.paie, rouler);
      if (uniteEl) {
        uniteEl.textContent = t.unite || 'tampons';
        uniteEl.hidden = (r.paie === null);
      }
      // La phrase est lue par les lecteurs d'écran (aria-live) : on attend la fin de la frappe
      // pour ne pas l'annoncer à chaque chiffre tapé.
      clearTimeout(minuteur);
      if (rouler) minuteur = setTimeout(function(){ majPhrase(r, t); }, 450);
      else majPhrase(r, t);
    }

    // Un champ illisible ou négatif est signalé pendant la frappe (bordure du socle +
    // aria-invalid) ; un champ vide ou à zéro, seulement quand on le quitte (on ne crie pas
    // sur « 0, » pendant qu'on tape « 0,50 »).
    function signaler(champ, enQuittant){
      var n = lireNombre(champ.value);
      var vide = champ.value.replace(/[\s  ]+/g, '') === '';
      var faux = enQuittant ? (n === null || n <= 0) : (!vide && (n === null || n < 0));
      if (n !== null && n > 0) champ.removeAttribute('aria-invalid');
      else if (faux) champ.setAttribute('aria-invalid', 'true');
    }

    // La marge au-delà de 100 % est bornée : le calcul prend 100, et le champ l'affiche en le quittant.
    function bornerMarge(){
      var n = lireNombre(champs.marge.value);
      if (n !== null && n > MARGE_MAX) champs.marge.value = String(MARGE_MAX);
    }

    function estChamp(el){ return !!el && el.tagName === 'INPUT'; }

    // Pas d'envoi : la touche Entrée ne recharge jamais la page.
    formulaire.addEventListener('submit', function(ev){ ev.preventDefault(); mettreAJour(true); });
    formulaire.addEventListener('input', function(ev){
      if (estChamp(ev.target)) signaler(ev.target, false);
      mettreAJour(true);
    });
    formulaire.addEventListener('change', function(ev){
      if (ev.target === champs.marge) bornerMarge();
      if (estChamp(ev.target)) signaler(ev.target, true);
      mettreAJour(true);
    });

    // Au départ : si le navigateur a gardé d'autres valeurs (retour arrière), on les affiche
    // tout de suite ; sinon on laisse site.js faire rouler l'exemple à l'entrée dans l'écran.
    var r0 = calculer(lireChamps());
    function ecrit(el){ return el ? lireNombre(el.getAttribute('data-compte')) : null; }
    if (r0.tampon !== ecrit(sorties.tampon) || r0.visite !== ecrit(sorties.visite) || r0.paie !== ecrit(sorties.paie)) {
      mettreAJour(false);
    }
    Object.keys(champs).forEach(function(cle){ signaler(champs[cle], false); });
  }

  try { demarrer(); }
  catch (e) { if (window.console) console.error('[calcul.js]', e); }
})(typeof window !== 'undefined' ? window : this);
