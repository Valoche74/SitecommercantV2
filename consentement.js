/* ─────────────────────────────────────────────────────────────
   PERIFY — consentement.js : bandeau de consentement + mesure d'audience
   Microsoft Clarity (01/10/2026). Chargé en defer sur TOUTES les pages,
   juste après site.js : <script src="consentement.js" defer></script>

   TANT QUE CLARITY_ID EST VIDE : ce fichier ne fait RIEN — aucun bandeau,
   aucun lien « Gérer les cookies », aucune requête vers clarity.ms, rien
   d'écrit dans le navigateur.

   Quand Valentin y colle l'identifiant de son projet Clarity :
   - un bandeau sobre en bas d'écran : « Refuser » et « Accepter », même taille,
     même style (CNIL : refuser aussi simple qu'accepter), et « En savoir plus »
     vers /mentions-legales#cookies ;
   - Clarity n'est chargé QU'APRÈS « Accepter » (aucune requête vers clarity.ms
     avant), avec le signal de consentement de Microsoft (consentv2) : mesure
     d'audience accordée, stockage publicitaire refusé (l'accord ne porte que
     sur la mesure) ;
   - le choix est gardé dans le navigateur (localStorage, avec sa date) et
     redemandé au bout de 6 mois (recommandation de la CNIL) ;
   - le lien « Gérer les cookies », ajouté au pied de chaque page, rouvre le
     bandeau : retirer son accord efface les cookies de Clarity
     (clarity('consent', false)) et arrête la mesure.
   - essai.js appelle PerifyConsentement.evenement('demande_essai_envoyee')
     quand la demande d'essai a réussi : un simple nom d'événement, aucune
     donnée du formulaire (le bloc du formulaire porte data-clarity-mask).

   APERÇU pour les captures : ajouter ?apercu-consentement=1 à l'adresse.
   Le bandeau et le lien s'affichent, mais Clarity n'est JAMAIS chargé et rien
   n'est enregistré (les boutons ferment seulement le bandeau).

   Sources (vérifiées le 01/10/2026) : learn.microsoft.com/clarity —
   « clarity-consent-api-v2 », « clarity-api », « clarity-cookies »,
   « clarity-masking » ; code d'insertion : paquet officiel @microsoft/clarity
   (src/utils.js). CNIL : refuser aussi simple qu'accepter, retrait aussi
   simple que l'accord, choix conservé 6 mois.
   ───────────────────────────────────────────────────────────── */
(function(){
  'use strict';

  /* ── À REMPLIR PAR VALENTIN ──────────────────────────────
     L'identifiant du projet Clarity. D'après la documentation de Microsoft, il se lit
     dans l'adresse du projet ouvert sur clarity.microsoft.com :
     https://clarity.microsoft.com/projects/view/<identifiant>/ — c'est aussi ce qui
     suit « clarity.ms/tag/ » dans le code de suivi proposé par Clarity.
     Forme attendue : lettres et chiffres seulement (sinon, rien ne se charge). */
  var CLARITY_ID = '';

  var CLE = 'perify-consentement';            // localStorage : {"choix":"accepte"|"refuse","date":"…","v":1}
  var VERSION = 1;                            // à augmenter si l'usage change : le choix est redemandé
  var DUREE_MOIS = 6;                         // CNIL : conserver le choix (accord ou refus) 6 mois
  var EVENEMENT_OK = /^[a-z0-9_]{1,40}$/;     // noms d'événements Clarity permis

  var apercu = false;
  try { apercu = /(?:^|[?&])apercu-consentement=1(?:&|$)/.test(window.location.search); } catch (e) {}
  var idValide = /^[a-z0-9]{6,20}$/i.test(CLARITY_ID);
  if (!idValide && !apercu) {
    // Rien à faire : on expose seulement l'API, sans effet, pour essai.js.
    window.PerifyConsentement = { evenement: function(){}, ouvrir: function(){}, actif: false };
    return;
  }

  var clarityCharge = false;
  var bandeau = null;
  var retourFocus = null;

  /* ── Le choix gardé (localStorage, toujours sous try/catch) ── */
  function lireChoix(){
    var brut = null;
    try { brut = window.localStorage.getItem(CLE); } catch (e) { return null; }
    if (!brut) return null;
    var c = null;
    try { c = JSON.parse(brut); } catch (e) { c = null; }
    if (!c || (c.choix !== 'accepte' && c.choix !== 'refuse') || c.v !== VERSION) { oublierChoix(); return null; }
    var d = new Date(c.date);
    if (isNaN(d.getTime())) { oublierChoix(); return null; }
    // Relecture du 01/10 : une date dans le futur (horloge du téléphone mal réglée au moment du choix,
    // ou valeur retouchée) ferait durer le choix bien plus de 6 mois. Plus d'un jour d'avance : on redemande.
    if (d.getTime() > Date.now() + 864e5) { oublierChoix(); return null; }
    var fin = new Date(d.getTime());
    fin.setMonth(fin.getMonth() + DUREE_MOIS);
    if (Date.now() >= fin.getTime()) { oublierChoix(); return null; }   // 6 mois passés : on redemande
    return { choix: c.choix, date: d };
  }
  function ecrireChoix(choix){
    try { window.localStorage.setItem(CLE, JSON.stringify({ choix: choix, date: new Date().toISOString(), v: VERSION })); } catch (e) {}
  }
  function oublierChoix(){
    try { window.localStorage.removeItem(CLE); } catch (e) {}
  }

  /* ── Clarity : chargé seulement après « Accepter » ───────────
     Code d'insertion de Microsoft (paquet officiel @microsoft/clarity, src/utils.js).
     Le signal consentv2 est mis dans la file d'attente AVANT que le script n'arrive :
     Clarity le lit avant de poser le moindre cookie. */
  function chargerClarity(){
    if (clarityCharge || apercu || !idValide) return;
    clarityCharge = true;
    try {
      (function(c, l, a, r, i, t, y){
        if (l.getElementById('clarity-script')) return;
        c[a] = c[a] || function(){ (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; t.id = 'clarity-script';
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', CLARITY_ID);
      window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    } catch (e) { if (window.console) console.error('[consentement.js] Clarity :', e); }
  }

  // Retrait de l'accord : Clarity efface ses cookies et ne mesure plus rien
  // (« clarity('consent', false) », documentation Microsoft). Par prudence, on
  // efface aussi nous-mêmes ses deux cookies de premier niveau.
  function retirerClarity(){
    try { if (clarityCharge && typeof window.clarity === 'function') window.clarity('consent', false); } catch (e) {}
    try {
      var hote = window.location.hostname || '';
      var morceaux = hote.split('.');
      var base = morceaux.length > 2 ? morceaux.slice(-2).join('.') : hote;
      var domaines = ['', '; domain=' + hote, '; domain=.' + base];
      ['_clck', '_clsk'].forEach(function(nom){
        domaines.forEach(function(d){ document.cookie = nom + '=; Max-Age=0; path=/' + d; });
      });
    } catch (e) {}
  }

  /* ── Le bandeau ──────────────────────────────────────────
     TEXTES À FAIRE VALIDER PAR VALENTIN (01/10). */
  var TEXTES = {
    titre: 'Mesure d’audience',
    corps: 'Avec votre accord, j’utilise Microsoft Clarity pour voir comment le site est parcouru (clics, défilement, enregistrement de la visite) et l’améliorer. Ce que vous tapez dans le formulaire reste masqué. Vous pouvez changer d’avis à tout moment avec « Gérer les cookies », en bas de page.',
    refuser: 'Refuser',
    accepter: 'Accepter',
    plus: 'En savoir plus',
    lien: 'Gérer les cookies',
    actuelAccepte: 'Votre choix actuel : accepté le ',
    actuelRefuse: 'Votre choix actuel : refusé le ',
    apercu: 'Aperçu : aucun choix n’est enregistré, Clarity n’est pas chargé.'
  };

  // Le style du bandeau vit ici (une seule source pour les pages du site ET les pages de texte,
  // qui n'ont pas la même feuille). Direction B : nuit, orange clair en accent, Inter / Plus Jakarta Sans.
  // Les deux boutons sont IDENTIQUES (contour clair) : aucun n'est mis en avant, et aucun n'est un
  // bouton orange plein (le seul bouton orange plein de l'écran reste celui de l'essai).
  // Plan 45 : au-dessus de tout le contenu (sections : 1, cartes de l'éventail : enfermées dans leur
  // section), mais SOUS l'en-tête (50). Relecture du 01/10 : à 70, sur un téléphone de 320 px, le bandeau
  // recouvrait 3 des 4 liens du menu ouvert ; le menu ouvert passe maintenant devant, et le bandeau
  // réapparaît quand on le referme.
  var CSS = [
    '.consentement{position:fixed;z-index:45;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));',
    '  max-width:760px;margin:0 auto;box-sizing:border-box;padding:20px 22px;border-radius:18px;',
    '  background:#232849;color:#F4F5FB;border:1px solid rgba(255,138,76,.32);box-shadow:0 24px 60px -18px rgba(0,0,0,.75);',
    '  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:15.5px;line-height:1.55;',
    '  animation:consentement-entre .3s cubic-bezier(.16,1,.3,1)}',
    '.consentement *{box-sizing:border-box}',
    '.consentement-titre{margin:0 0 6px;font-family:"Plus Jakarta Sans",Inter,-apple-system,sans-serif;font-weight:800;font-size:17px;line-height:1.3;color:#FFFFFF;letter-spacing:-.01em}',
    '.consentement-texte{margin:0;color:#C4C8DE}',
    '.consentement-etat{margin:8px 0 0;color:#F4F5FB;font-weight:600}',
    '.consentement-actions{display:flex;flex-wrap:wrap;align-items:center;gap:10px 12px;margin-top:16px}',
    '.consentement-btn{flex:0 0 auto;min-width:132px;min-height:48px;margin:0;padding:11px 24px;border-radius:999px;cursor:pointer;',
    '  background:transparent;color:#FFFFFF;border:1.5px solid rgba(255,255,255,.5);font:700 16px/1.2 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
    '  transition:border-color .2s,background .2s}',
    '.consentement-btn:hover{border-color:#FF8A4C;background:rgba(255,138,76,.12)}',
    '.consentement-plus{display:inline-flex;align-items:center;min-height:48px;padding:0 4px;color:#F4F5FB;font-weight:600;',
    '  text-decoration:underline;text-decoration-color:rgba(255,138,76,.6);text-decoration-thickness:2px;text-underline-offset:.22em}',
    '.consentement-plus:hover{text-decoration-color:#FF8A4C}',
    '.consentement :focus-visible{outline:2px solid #FF8A4C;outline-offset:3px}',
    '.consentement-apercu{margin:12px 0 0;font-size:13px;color:#C4C8DE;opacity:.85}',
    '@keyframes consentement-entre{from{opacity:0;transform:translateY(12px)}}',
    // téléphone et tablette : 16 px minimum, les deux boutons côte à côte, de même largeur
    '@media(max-width:919.98px){.consentement{font-size:16px}}',
    '@media(max-width:559.98px){.consentement{padding:18px 18px 16px}.consentement-btn{flex:1 1 0;min-width:0;padding:11px 12px}',
    '  .consentement-plus{flex:1 0 100%;justify-content:center}}',
    '@media(prefers-reduced-motion:reduce){.consentement{animation:none}.consentement-btn{transition:none}}',
    // Le pied de page avec son 8e lien (« Gérer les cookies ») ne tient sur une ligne qu'à partir de
    // 1100 px (mesuré le 01/10, accueil et pages de texte). En dessous, les liens passent à la ligne :
    // comme le socle le fait sous 960 px pour 7 liens, on retire les points « · » (aucun ne reste seul
    // en bout de ligne) et l'espace sépare les liens.
    '@media(max-width:1119.98px){.pied-liens.avec-cookies{column-gap:20px}.pied-liens.avec-cookies span[aria-hidden]{display:none}}'
  ].join('\n');

  function poserStyle(){
    if (document.getElementById('consentement-style')) return;
    var s = document.createElement('style');
    s.id = 'consentement-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function dateFr(d){
    try { return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear(); }
  }

  function element(balise, classe, texte){
    var el = document.createElement(balise);
    if (classe) el.className = classe;
    if (texte) el.textContent = texte;
    return el;
  }

  function ouvrirBandeau(avecFocus){
    if (bandeau) { if (avecFocus) focusPremier(); return; }
    poserStyle();
    var actuel = lireChoix();

    bandeau = element('section', 'consentement');
    bandeau.setAttribute('aria-labelledby', 'consentement-titre');

    var titre = element('p', 'consentement-titre', TEXTES.titre);
    titre.id = 'consentement-titre';
    bandeau.appendChild(titre);
    bandeau.appendChild(element('p', 'consentement-texte', TEXTES.corps));
    if (actuel && !apercu) {
      bandeau.appendChild(element('p', 'consentement-etat',
        (actuel.choix === 'accepte' ? TEXTES.actuelAccepte : TEXTES.actuelRefuse) + dateFr(actuel.date) + '.'));
    }

    var actions = element('div', 'consentement-actions');
    var refuser = element('button', 'consentement-btn', TEXTES.refuser);
    refuser.type = 'button';
    refuser.setAttribute('data-choix', 'refuse');
    var accepter = element('button', 'consentement-btn', TEXTES.accepter);
    accepter.type = 'button';
    accepter.setAttribute('data-choix', 'accepte');
    var plus = element('a', 'consentement-plus', TEXTES.plus);
    plus.href = '/mentions-legales#cookies';
    actions.appendChild(refuser);
    actions.appendChild(accepter);
    actions.appendChild(plus);
    bandeau.appendChild(actions);
    if (apercu) bandeau.appendChild(element('p', 'consentement-apercu', TEXTES.apercu));

    actions.addEventListener('click', function(ev){
      var b = ev.target && ev.target.closest ? ev.target.closest('[data-choix]') : null;
      if (b) choisir(b.getAttribute('data-choix'));
    });

    // En tête du <body> : au clavier, on le rencontre en premier ; à l'écran, il est en bas.
    document.body.insertBefore(bandeau, document.body.firstChild);
    if (avecFocus) focusPremier();
  }

  function focusPremier(){
    var b = bandeau && bandeau.querySelector('.consentement-btn');
    if (b) { try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }
  }

  function fermerBandeau(){
    if (!bandeau) return;
    if (bandeau.parentNode) bandeau.parentNode.removeChild(bandeau);
    bandeau = null;
    if (retourFocus) { try { retourFocus.focus({ preventScroll: true }); } catch (e) { retourFocus.focus(); } retourFocus = null; }
  }

  function choisir(choix){
    if (apercu) { fermerBandeau(); return; }          // aperçu : rien d'enregistré, rien de chargé
    if (choix === 'accepte') { ecrireChoix('accepte'); chargerClarity(); }
    else { ecrireChoix('refuse'); retirerClarity(); }
    fermerBandeau();
  }

  /* ── Le lien « Gérer les cookies », au bout du pied de page ── */
  function poserLienPied(){
    var nav = document.querySelector('.pied-liens');
    if (!nav || nav.querySelector('.pied-cookies')) return;
    var point = element('span', '', '·');
    point.setAttribute('aria-hidden', 'true');
    var lien = element('a', 'pied-cookies', TEXTES.lien);
    lien.href = '/mentions-legales#cookies';          // sans effet du script : la page qui explique
    lien.setAttribute('role', 'button');
    lien.addEventListener('click', function(ev){ ev.preventDefault(); retourFocus = lien; ouvrirBandeau(true); });
    lien.addEventListener('keydown', function(ev){
      if (ev.key === ' ' || ev.key === 'Spacebar') { ev.preventDefault(); retourFocus = lien; ouvrirBandeau(true); }
    });
    poserStyle();
    nav.classList.add('avec-cookies');
    nav.appendChild(point);
    nav.appendChild(lien);
  }

  /* ── API pour les autres scripts (essai.js) ───────────────── */
  window.PerifyConsentement = {
    actif: true,
    // Un événement Clarity (nom seul, jamais de donnée) — uniquement si le visiteur a accepté.
    evenement: function(nom){
      try {
        if (!clarityCharge || !EVENEMENT_OK.test(String(nom)) || typeof window.clarity !== 'function') return;
        window.clarity('event', String(nom));
      } catch (e) {}
    },
    ouvrir: function(){ ouvrirBandeau(true); }
  };

  /* ── Mise en route ───────────────────────────────────────── */
  function demarrer(){
    try {
      poserLienPied();
      if (apercu) { ouvrirBandeau(false); return; }
      var actuel = lireChoix();
      if (!actuel) ouvrirBandeau(false);
      else if (actuel.choix === 'accepte') chargerClarity();
    } catch (e) { if (window.console) console.error('[consentement.js]', e); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
