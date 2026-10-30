/* ─────────────────────────────────────────────────────────────
   PERIFY — site.js, le script commun de toutes les pages (refonte A, 30/10/2026)
   Chargé en defer sur chaque page (<script src="site.js" defer>).
   JavaScript simple, sans dépendance, sans rien d'externe.

   1. Mouvement réduit : window.PerifySite.mouvementReduit (lu par essai.js, eventail.js)
   2. Menu téléphone : le <details class="nav-tel"> s'ouvre sans script ; ici, il se
      referme avec Échap (le focus revient sur « Menu »), un clic dehors, un lien du menu,
      ou en passant en grand écran
   3. Compteur ([data-compte]) : window.PerifyCompteur, pour calcul.js
   4. Adresse e-mail assemblée (#lienMail, [data-mail]) + window.PerifyMail

   Refonte A (30/10/2026) : plus d'apparitions au défilement, de marqueur, de mot qui
   défile, de bordure lumineuse ni de bande qui tourne ; le bouton d'essai de la barre
   est écrit dans le HTML (en contour : il ne fait jamais un second bouton orange plein).

   Règle d'or : rien ne dépend de ce fichier pour être visible. Chaque partie est isolée
   (try/catch) : une erreur dans l'une ne casse pas les autres. Mode d'emploi : _GABARIT.md.
   ───────────────────────────────────────────────────────────── */
(function(){
  'use strict';

  var racine = document.documentElement;
  racine.classList.add('js', 'site-pret');

  var mouvementReduit = false;
  try { mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  window.PerifySite = { mouvementReduit: mouvementReduit };

  function tous(selecteur, depuis){ return [].slice.call((depuis || document).querySelectorAll(selecteur)); }
  function isoler(nom, fn){
    try { fn(); }
    catch (e) { if (window.console) console.error('[site.js] ' + nom + ' :', e); }
  }

  /* ── 2. Menu téléphone ───────────────────────────────────
     <details class="nav-tel"><summary>Menu</summary><nav class="nav-tel-panneau">…</nav></details>
     Sans script, il s'ouvre et se ferme au toucher de « Menu » (natif). */
  isoler('menu', function(){
    var menu = document.querySelector('.entete .nav-tel');
    if (!menu) return;
    var bouton = menu.querySelector('summary');

    function fermer(rendreFocus){
      if (!menu.open) return;
      menu.open = false;
      if (rendreFocus && bouton) { try { bouton.focus({ preventScroll: true }); } catch (e) { bouton.focus(); } }
    }

    document.addEventListener('keydown', function(ev){
      if ((ev.key === 'Escape' || ev.key === 'Esc') && menu.open) { ev.preventDefault(); fermer(true); }
    });

    document.addEventListener('click', function(ev){
      if (!menu.open || menu.contains(ev.target)) return;
      var actif = document.activeElement;
      fermer(!actif || actif === document.body || menu.contains(actif));
    });

    // Un lien du menu (même une ancre de la page courante) referme le panneau.
    menu.addEventListener('click', function(ev){
      var lien = ev.target.closest ? ev.target.closest('a') : null;
      if (lien) fermer(false);
    });

    // Le focus quitte le menu au clavier (Tab) : on referme sans le reprendre.
    menu.addEventListener('focusout', function(ev){
      if (menu.open && ev.relatedTarget && !menu.contains(ev.relatedTarget)) fermer(false);
    });

    // En passant en grand écran (le menu redevient une ligne), on ferme le panneau.
    try {
      var large = window.matchMedia('(min-width: 60.0625rem)');
      var auChangement = function(e){ if (e.matches) fermer(false); };
      if (large.addEventListener) large.addEventListener('change', auChangement); else large.addListener(auChangement);
    } catch (e) {}
  });

  /* ── 3. Compteur (pour calcul.js) ─────────────────────────
     HTML : <b data-compte="92" data-suffixe="&nbsp;%">92&nbsp;%</b>
       data-compte     la valeur finale (point ou virgule : « 0.15 » ou « 0,15 »)
       data-suffixe    ce qui suit le nombre (« &nbsp;% », « &nbsp;s », « &nbsp;€ »…)
       data-prefixe    ce qui le précède (rare)
       data-decimales  nombre de décimales affichées (0 par défaut)
     L'élément ne contient QUE le texte du nombre (aucune balise dedans) : site.js
     le remplace par <span class="lecteur">valeur finale</span> (lue par les lecteurs
     d'écran, toujours juste) + <span class="compte-vu" aria-hidden="true">qui roule</span>.
     Rien ne roule tout seul (refonte A, 30/10/2026) : la page affiche la valeur écrite
     dans le HTML ; seul calcul.js fait rouler ses résultats quand on tape (0,6 s).

     API pour les autres scripts (calcul.js…) :
       PerifyCompteur.animer(el, valeur [, options])
         roule de la valeur affichée vers « valeur » ; valeur non finie (null, NaN,
         Infinity) → « — » tout de suite. options : { duree: ms (1600), depuis: nombre,
         decimales, suffixe, prefixe } (sinon lus sur les data-* de l'élément).
       PerifyCompteur.ecrire(el, valeur [, options])   écrit sans animer
       PerifyCompteur.format(valeur, decimales)       « 1 234,50 » (espace fine, virgule)
     Mouvement réduit : la valeur finale est écrite directement, jamais d'animation. */
  var PerifyCompteur = (function(){
    var etats = [];          // { el, lu, vu, valeur, raf } — liste simple, peu d'éléments
    var formateurs = {};

    function format(v, decimales){
      var d = Math.max(0, Math.min(6, parseInt(decimales, 10) || 0));
      if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;          // jamais « -0 »
      try {
        var f = formateurs[d] || (formateurs[d] = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }));
        return f.format(v);
      } catch (e) {
        var morceaux = Math.abs(v).toFixed(d).split('.');
        morceaux[0] = morceaux[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return (v < 0 ? '-' : '') + morceaux.join(',');
      }
    }

    function lireNombre(texte){
      if (texte === null || texte === undefined || texte === '') return null;
      var n = parseFloat(String(texte).replace(/[\s  ]/g, '').replace(',', '.'));
      return isFinite(n) ? n : null;
    }

    function options(el, o){
      o = o || {};
      var attr = function(nom){ var v = el.getAttribute(nom); return v === null ? '' : v; };
      return {
        decimales: o.decimales !== undefined ? o.decimales : (parseInt(attr('data-decimales'), 10) || 0),
        suffixe: o.suffixe !== undefined ? o.suffixe : attr('data-suffixe'),
        prefixe: o.prefixe !== undefined ? o.prefixe : attr('data-prefixe')
      };
    }

    function texte(v, o){
      if (typeof v !== 'number' || !isFinite(v)) return '—';
      return o.prefixe + format(v, o.decimales) + o.suffixe;
    }

    function preparer(el){
      for (var i = 0; i < etats.length; i++) if (etats[i].el === el) return etats[i];
      // on garde les espaces insécables (&nbsp;) : seuls les blancs ordinaires sont resserrés
      var final = (el.textContent || '').replace(/[ \t\r\n]+/g, ' ').trim();
      var lu = document.createElement('span');
      lu.className = 'lecteur';
      lu.textContent = final;
      var vu = document.createElement('span');
      vu.className = 'compte-vu';
      vu.setAttribute('aria-hidden', 'true');
      vu.textContent = final;
      el.textContent = '';
      el.appendChild(lu);
      el.appendChild(vu);
      var valeur = lireNombre(el.getAttribute('data-compte'));
      if (valeur === null) valeur = lireNombre(final.replace(/[^\d,.\-]/g, ''));
      var etat = { el: el, lu: lu, vu: vu, valeur: valeur, raf: 0 };
      etats.push(etat);
      return etat;
    }

    function arreter(etat){
      if (etat.raf) { (window.cancelAnimationFrame || clearTimeout)(etat.raf); etat.raf = 0; }
    }

    function ecrire(el, valeur, opts){
      var etat = preparer(el), o = options(el, opts);
      arreter(etat);
      var fin = (typeof valeur === 'number' && isFinite(valeur)) ? valeur : null;
      etat.lu.textContent = texte(fin, o);
      etat.vu.textContent = texte(fin, o);
      etat.vu.style.minWidth = '';
      etat.valeur = fin;
    }

    function animer(el, valeur, opts){
      opts = opts || {};
      var etat = preparer(el), o = options(el, opts);
      var fin = (typeof valeur === 'number' && isFinite(valeur)) ? valeur : null;
      var depuis = (typeof opts.depuis === 'number' && isFinite(opts.depuis)) ? opts.depuis : etat.valeur;
      var duree = typeof opts.duree === 'number' ? opts.duree : 1600;
      var raf = window.requestAnimationFrame || function(f){ return setTimeout(function(){ f(Date.now()); }, 16); };

      if (fin === null || depuis === null || mouvementReduit || duree <= 0 || depuis === fin) { ecrire(el, fin, o); return; }

      arreter(etat);
      etat.lu.textContent = texte(fin, o);                 // le lecteur d'écran lit toujours la valeur juste
      // largeur réservée : la plus grande des deux (début, fin) — rien ne bouge autour
      etat.vu.style.minWidth = '';
      etat.vu.textContent = texte(fin, o);
      var l1 = etat.vu.getBoundingClientRect().width;
      etat.vu.textContent = texte(depuis, o);
      var l0 = etat.vu.getBoundingClientRect().width;
      etat.vu.style.minWidth = Math.ceil(Math.max(l0, l1)) + 'px';

      var t0 = null;
      function image(t){
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / duree);
        var e = 1 - Math.pow(1 - p, 3);                     // ease-out
        if (p < 1) {
          etat.valeur = depuis + (fin - depuis) * e;
          etat.vu.textContent = texte(etat.valeur, o);
          etat.raf = raf(image);
        } else {
          etat.raf = 0;
          etat.valeur = fin;
          etat.vu.textContent = texte(fin, o);
          etat.vu.style.minWidth = '';
        }
      }
      etat.raf = raf(image);
    }

    return { animer: animer, ecrire: ecrire, format: format, _preparer: preparer, _texte: function(el, v){ return texte(v, options(el)); } };
  })();
  window.PerifyCompteur = PerifyCompteur;

  /* ── 4. Adresse e-mail assemblée (jamais en clair dans le HTML) ──
     <a id="lienMail" href="#">Écrire un e-mail</a>                 → mailto, sujet par défaut
     <a data-mail="Perify — aide" href="#">…</a>                    → mailto avec ce sujet
     <a data-mail data-mail-texte href="#">…</a>                    → affiche aussi l'adresse
     API : PerifyMail.adresse() ; PerifyMail.lien(sujet, corps) → « mailto:…?subject=…&body=… » */
  var PerifyMail = {
    adresse: function(){ return ['contact', 'perify.app'].join('@'); },
    lien: function(sujet, corps){
      var p = [];
      if (sujet) p.push('subject=' + encodeURIComponent(sujet));
      if (corps) p.push('body=' + encodeURIComponent(corps));
      return 'mailto:' + PerifyMail.adresse() + (p.length ? '?' + p.join('&') : '');
    }
  };
  window.PerifyMail = PerifyMail;

  isoler('e-mail', function(){
    tous('#lienMail, [data-mail]').forEach(function(a){
      var sujet = a.getAttribute('data-mail') || 'Perify — demande de renseignements';
      a.setAttribute('href', PerifyMail.lien(sujet));
      if (a.hasAttribute('data-mail-texte')) a.textContent = PerifyMail.adresse();
    });
  });

})();
