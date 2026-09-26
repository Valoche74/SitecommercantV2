/* ─────────────────────────────────────────────────────────────
   PERIFY — essai.js, le formulaire de la page 4 « Essai gratuit » (26/09/2026)
   Cahier : IMAGE/design-kit/REFONTE-4-PAGES.md, § 7 (page) et § 9 (serveur).
   Chargé en defer APRÈS site.js (window.PerifyMail, window.PerifySite).
   JavaScript simple, sans dépendance.

   1. Trois étapes : « Votre commerce », « Vous », « Quand vous rappeler ».
      « Continuer » vérifie les champs requis de l'étape (message sous le champ,
      aria-invalid, focus sur le premier champ fautif), puis le focus va au titre
      de l'étape suivante. « Retour » revient sans rien vérifier.
      L'indicateur « Étape 1 sur 3 » est annoncé (aria-live sur ce libellé seul).
   2. L'envoi : POST https://api.perify.app/exec en JSON
        { action:"demande_essai", commerce, metier, ville, nom, tel, email,
          creneau, message, site_web, t }
      t = millisecondes écoulées depuis l'ouverture de la page (piège à robots
      côté serveur, avec le champ caché site_web).
      Réponse { status:"ok" } → écran de réussite (focus dessus).
      Toute autre réponse, plus de 12 s, ou pas de réseau → écran d'échec : le
      téléphone, et « Envoyer par e-mail » qui ouvre la messagerie avec toute la
      demande préremplie. Rien n'est jamais perdu en silence.

   Sans ce fichier : les trois étapes restent visibles l'une sous l'autre, et une
   phrase remplace le bouton d'envoi (essai.css, .envoi-sans-js).
   ───────────────────────────────────────────────────────────── */
(function(){
  'use strict';

  var ADRESSE_API = 'https://api.perify.app/exec';
  var DELAI_MAX_MS = 12000;

  // L'heure d'ouverture de secours (performance.now() part déjà de l'ouverture de la page).
  var ouverture = Date.now();
  function tempsDepuisOuverture(){
    try {
      if (window.performance && typeof window.performance.now === 'function') return Math.round(window.performance.now());
    } catch (e) {}
    return Date.now() - ouverture;
  }

  var form = document.getElementById('formulaire');
  if (!form) return;

  var reussite = document.getElementById('essai-reussite');
  var echec = document.getElementById('essai-echec');
  var lienMailEchec = document.getElementById('essai-mail');
  var retourEchec = document.getElementById('essai-retour');
  var progression = form.querySelector('.progression');
  var libelle = form.querySelector('.progression-libelle');
  var segments = [].slice.call(form.querySelectorAll('.progression-barre > span'));
  var etapes = [].slice.call(form.querySelectorAll('.etape-form'));
  var boutonEnvoi = form.querySelector('button[type="submit"]');
  var texteEnvoi = boutonEnvoi ? boutonEnvoi.textContent : '';
  var derniere = etapes.length - 1;
  var courante = 0;
  var envoiEnCours = false;
  var reduit = !!(window.PerifySite && window.PerifySite.mouvementReduit);
  if (!window.PerifySite) {
    try { reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  }
  if (etapes.length < 1) return;

  /* ── Lire les champs ─────────────────────────────────── */
  function element(nom){ return form.querySelector('[name="' + nom + '"]'); }

  // Une ligne : espaces resserrés, bouts coupés.
  function valeur(nom){
    var el = element(nom);
    return el ? String(el.value || '').replace(/\s+/g, ' ').trim() : '';
  }
  // Le message garde ses retours à la ligne.
  function valeurMessage(){
    var el = element('message');
    return el ? String(el.value || '').replace(/\r\n?/g, '\n').trim() : '';
  }
  function valeurRadio(nom){
    var coche = form.querySelector('input[name="' + nom + '"]:checked');
    return coche ? coche.value : '';
  }

  function lireDemande(){
    var piege = element('site_web');
    return {
      action: 'demande_essai',
      commerce: valeur('commerce'),
      metier: valeurRadio('metier'),
      ville: valeur('ville'),
      nom: valeur('nom'),
      tel: valeur('tel'),
      email: valeur('email'),
      creneau: valeurRadio('creneau'),
      message: valeurMessage(),
      site_web: piege ? String(piege.value || '') : '',
      t: tempsDepuisOuverture()
    };
  }

  /* ── Vérifier ────────────────────────────────────────────
     Les mêmes règles que le serveur (§ 9) : commerce, ville, nom, tel requis ;
     téléphone de 6 à 20 caractères parmi chiffres, espaces, + . - ( ) ;
     e-mail facultatif, mais s'il est écrit il doit ressembler à une adresse. */
  var FORME_TEL = /^[0-9 +.\-()]{6,20}$/;
  var FORME_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var REGLES = {
    commerce: function(v){ return v ? '' : 'Indiquez le nom de votre commerce.'; },
    ville: function(v){ return v ? '' : 'Indiquez votre ville.'; },
    nom: function(v){ return v ? '' : 'Indiquez votre nom.'; },
    tel: function(v){
      if (!v) return 'Indiquez votre numéro de téléphone.';
      var chiffres = v.replace(/[^0-9]/g, '').length;
      return (FORME_TEL.test(v) && chiffres >= 6) ? '' : 'Ce numéro de téléphone ne semble pas valide.';
    },
    email: function(v){
      if (!v) return '';
      return FORME_EMAIL.test(v) ? '' : 'Cette adresse e-mail ne semble pas valide.';
    }
  };

  function montrerErreur(el, message){
    var err = document.getElementById(el.id + '-erreur');
    if (message) {
      el.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = message; err.hidden = false; }
    } else {
      el.removeAttribute('aria-invalid');
      if (err) { err.textContent = ''; err.hidden = true; }
    }
  }

  // Vérifie les champs d'une étape ; rend le premier champ fautif (ou null).
  function verifierEtape(i){
    var premier = null;
    [].slice.call(etapes[i].querySelectorAll('input[name], textarea[name]')).forEach(function(el){
      var regle = REGLES[el.name];
      if (!regle || el.type === 'radio') return;
      var message = regle(valeur(el.name));
      montrerErreur(el, message);
      if (message && !premier) premier = el;
    });
    return premier;
  }

  // Pendant la frappe, une erreur déjà affichée s'efface dès que le champ est bon
  // (on n'en fait jamais apparaître de nouvelle avant « Continuer »).
  form.addEventListener('input', function(ev){
    var el = ev.target;
    if (!el || !el.name || !REGLES[el.name] || el.getAttribute('aria-invalid') !== 'true') return;
    if (!REGLES[el.name](valeur(el.name))) montrerErreur(el, '');
  });

  /* ── Focus et défilement ─────────────────────────────── */
  function hauteurEntete(){
    var e = document.querySelector('.entete');
    return e ? e.getBoundingClientRect().height : 0;
  }
  // Donne le focus sans saut brusque, puis amène le repère (par défaut l'élément lui-même)
  // sous l'en-tête s'il est hors de vue : l'indicateur d'étape au-dessus d'un titre d'étape,
  // le bloc entier (étiquette comprise) d'un champ fautif.
  function focaliser(el, repere){
    if (!el) return;
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    var cible = repere || (el.closest && el.closest('.champ')) || el;
    var r = cible.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < hauteurEntete() + 8 || r.top > h * 0.72) {
      try { cible.scrollIntoView({ block: 'start', behavior: reduit ? 'auto' : 'smooth' }); }
      catch (e) { cible.scrollIntoView(true); }
    }
  }
  function rejouer(el, classe){
    if (reduit || !el) return;
    el.classList.remove(classe);
    void el.offsetWidth;          // relance l'animation
    el.classList.add(classe);
  }

  /* ── Les étapes ──────────────────────────────────────── */
  function aller(i, avecFocus){
    courante = Math.max(0, Math.min(derniere, i));
    etapes.forEach(function(e, k){ e.hidden = k !== courante; });
    segments.forEach(function(s, k){
      if (k <= courante) s.classList.add('fait'); else s.classList.remove('fait');
    });
    if (libelle) libelle.textContent = 'Étape ' + (courante + 1) + ' sur ' + etapes.length;
    if (avecFocus) {
      rejouer(etapes[courante], 'entre');
      focaliser(etapes[courante].querySelector('.etape-titre'), progression && !progression.hidden ? progression : null);
    }
  }

  function continuer(){
    var fautif = verifierEtape(courante);
    if (fautif) { focaliser(fautif); return; }
    if (courante < derniere) aller(courante + 1, true);
  }

  function revenir(){
    if (courante > 0) aller(courante - 1, true);
  }

  /* ── L'envoi ─────────────────────────────────────────── */
  // Pendant l'envoi : le bouton le dit, « Retour » ne répond plus (le focus reste où il est).
  function etatEnvoi(actif){
    var retours = [].slice.call(form.querySelectorAll('[data-precedent]'));
    if (actif) {
      form.setAttribute('aria-busy', 'true');
      if (boutonEnvoi) { boutonEnvoi.setAttribute('aria-disabled', 'true'); boutonEnvoi.textContent = 'Envoi en cours…'; }
      retours.forEach(function(b){ b.setAttribute('aria-disabled', 'true'); });
    } else {
      form.removeAttribute('aria-busy');
      if (boutonEnvoi) { boutonEnvoi.removeAttribute('aria-disabled'); boutonEnvoi.textContent = texteEnvoi; }
      retours.forEach(function(b){ b.removeAttribute('aria-disabled'); });
    }
  }

  // Le repli : la messagerie du visiteur, avec la demande entière (le mailto de
  // l'ancien formulaire, métier et créneau en plus). L'adresse est assemblée ici,
  // jamais écrite en clair dans le HTML.
  function lienMail(sujet, corps){
    if (window.PerifyMail && typeof window.PerifyMail.lien === 'function') return window.PerifyMail.lien(sujet, corps);
    return 'mailto:' + ['contact', 'perify.app'].join('@') +
      '?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(corps);
  }
  // Au-delà de 2 048 caractères, Chrome et Edge sous Windows n'ouvrent pas la messagerie :
  // on vise 1 900 pour garder de la marge.
  var LIEN_MAIL_MAX = 1900;

  // Les n premiers caractères du message, sans jamais couper un émoji en deux
  // (une moitié seule ferait échouer encodeURIComponent).
  function debutDuMessage(texte, n){
    var bout = texte.slice(0, n);
    var dernier = bout.charCodeAt(bout.length - 1);
    if (dernier >= 0xD800 && dernier <= 0xDBFF) bout = bout.slice(0, -1);
    return bout.replace(/\s+$/, '');
  }

  function mailDeLaDemande(d){
    var sujet = 'Perify — ' + (d.commerce || 'demande') + ' (' + (d.ville || '') + ')';
    var coordonnees =
      'Nom : ' + d.nom + '\r\n' +
      'Commerce : ' + d.commerce + '\r\n' +
      'Métier : ' + d.metier + '\r\n' +
      'Ville : ' + d.ville + '\r\n' +
      'Téléphone : ' + d.tel + '\r\n' +
      'E-mail : ' + d.email + '\r\n' +
      'Quand rappeler : ' + d.creneau + '\r\n\r\n';
    var message = d.message ? d.message.replace(/\n/g, '\r\n') : '';
    var lien = lienMail(sujet, coordonnees + (message || '(pas de message)'));
    if (lien.length <= LIEN_MAIL_MAX || !message) return lien;
    // Trop long (un message chargé d'accents ou d'émojis s'allonge beaucoup une fois encodé) :
    // on raccourcit le message seul, les coordonnées restent entières. On cherche, par moitiés
    // successives, le plus long début de message qui tient.
    var bas = 0, haut = message.length, meilleur = lienMail(sujet, coordonnees + '…');
    while (bas <= haut) {
      var n = Math.floor((bas + haut) / 2);
      var essai = lienMail(sujet, coordonnees + debutDuMessage(message, n) + '…');
      if (essai.length <= LIEN_MAIL_MAX) { meilleur = essai; bas = n + 1; }
      else haut = n - 1;
    }
    return meilleur;
  }

  function montrerResultat(panneau){
    form.hidden = true;
    if (reussite) reussite.hidden = panneau !== reussite;
    if (echec) echec.hidden = panneau !== echec;
    if (panneau) {
      // Le défilement se calcule AVANT l'animation : pendant « resultat-entre » le panneau est
      // encore 12 px plus bas, et il finirait collé sous l'en-tête. La classe d'un affichage
      // précédent (échec, Retour, nouvel envoi) est retirée d'abord, pour la même raison.
      panneau.classList.remove('entre');
      focaliser(panneau);
      rejouer(panneau, 'entre');
    }
  }

  function afficherReussite(){ montrerResultat(reussite); }

  function afficherEchec(d){
    // Le lien ne doit jamais empêcher l'écran d'échec de s'afficher (le téléphone y est aussi).
    try { if (lienMailEchec) lienMailEchec.setAttribute('href', mailDeLaDemande(d || lireDemande())); }
    catch (e) { if (lienMailEchec) lienMailEchec.setAttribute('href', lienMail('Perify — demande d\'essai gratuit', '')); }
    montrerResultat(echec);
  }

  // Depuis l'écran d'échec : retour à la dernière étape, tout ce qui a été tapé est encore là.
  if (retourEchec) retourEchec.addEventListener('click', function(){
    if (echec) echec.hidden = true;
    form.hidden = false;
    aller(derniere, true);
  });

  function envoyer(){
    var demande = lireDemande();
    var fini = false;
    var ctrl = null;
    var minuterie = 0;
    envoiEnCours = true;
    etatEnvoi(true);

    function terminer(ok){
      if (fini) return;
      fini = true;
      clearTimeout(minuterie);
      envoiEnCours = false;
      etatEnvoi(false);
      if (ok) afficherReussite(); else afficherEchec(demande);
    }

    try { if (typeof window.AbortController === 'function') ctrl = new window.AbortController(); } catch (e) { ctrl = null; }
    // Plus de 12 s : on coupe la requête et on passe au repli.
    minuterie = setTimeout(function(){
      try { if (ctrl) ctrl.abort(); } catch (e) {}
      terminer(false);
    }, DELAI_MAX_MS);

    if (typeof window.fetch !== 'function') { terminer(false); return; }
    var options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(demande),
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store'
    };
    if (ctrl) options.signal = ctrl.signal;
    try {
      window.fetch(ADRESSE_API, options)
        .then(function(reponse){ return reponse.json(); })
        .then(function(donnees){ terminer(!!donnees && donnees.status === 'ok'); })
        .catch(function(){ terminer(false); });
    } catch (e) {
      terminer(false);
    }
  }

  /* ── Mise en route ───────────────────────────────────── */
  try {
    form.noValidate = true;                    // nos messages, pas ceux du navigateur
    form.classList.add('par-etapes');          // essai.css : une étape à la fois, bouton d'envoi visible
    if (progression) progression.hidden = false;
    [].slice.call(form.querySelectorAll('.etape-actions[hidden], [data-precedent][hidden]')).forEach(function(el){ el.hidden = false; });
    aller(0, false);
    // Le HTML livre le bouton d'envoi désactivé (sans ce script, Entrée ne doit rien envoyer) :
    // on ne l'active qu'une fois tout en place.
    if (boutonEnvoi) boutonEnvoi.disabled = false;
  } catch (e) {
    // Si la mise en route échoue, on remet tout comme sans script : rien ne reste caché,
    // et le bouton d'envoi reste désactivé.
    form.classList.remove('par-etapes');
    etapes.forEach(function(el){ el.hidden = false; });
    if (boutonEnvoi) boutonEnvoi.disabled = true;
    if (window.console) console.error('[essai.js] mise en route :', e);
    return;
  }

  form.addEventListener('click', function(ev){
    var bouton = ev.target && ev.target.closest ? ev.target.closest('button') : null;
    if (!bouton || envoiEnCours) return;
    if (bouton.hasAttribute('data-suivant')) { ev.preventDefault(); continuer(); }
    else if (bouton.hasAttribute('data-precedent')) { ev.preventDefault(); revenir(); }
  });

  // Entrée dans un champ des étapes 1 et 2 : « Continuer », pas un envoi.
  form.addEventListener('keydown', function(ev){
    if (ev.key !== 'Enter' || courante >= derniere) return;
    var el = ev.target;
    if (!el || el.tagName !== 'INPUT') return;
    ev.preventDefault();
    if (!envoiEnCours) continuer();
  });

  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    if (envoiEnCours) return;
    try {
      if (courante < derniere) { continuer(); return; }
      // Tout revérifier : une étape précédente fautive rouvre cette étape, focus sur le champ.
      for (var k = 0; k < etapes.length; k++) {
        var fautif = verifierEtape(k);
        if (fautif) {
          if (k !== courante) aller(k, false);
          focaliser(fautif);
          return;
        }
      }
      envoyer();
    } catch (e) {
      // Une erreur imprévue ne doit jamais avaler la demande : on passe au repli.
      if (window.console) console.error('[essai.js] envoi :', e);
      envoiEnCours = false;
      etatEnvoi(false);
      afficherEchec();
    }
  });
})();
