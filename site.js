/* ─────────────────────────────────────────────────────────────
   PERIFY — site.js, le SOCLE COMMUN des quatre pages (26/09/2026)
   Chargé en defer sur chaque page (<script src="site.js" defer>).
   JavaScript simple, sans dépendance, sans rien d'externe.

   1. Apparitions au défilement (.rev → .vu), filet de sécurité compris
   2. Marqueur (.marque → .trace quand son titre apparaît)
   3. Menu téléphone (aria-expanded, Échap, clic dehors, retour du focus)
   4. Compteur qui roule ([data-compte]) + window.PerifyCompteur
   5. Mot qui défile ([data-defile])
   6. Adresse e-mail assemblée (#lienMail, [data-mail]) + window.PerifyMail

   Règle d'or : rien ne reste invisible si ce fichier ne tourne pas.
   Le HTML porte toujours la valeur finale (compteur), le premier mot
   (mot qui défile), la barre du marqueur ; ce fichier ne fait qu'animer.
   Chaque partie est isolée (try/catch) : une erreur dans l'une ne casse
   pas les autres. Mode d'emploi complet : _GABARIT.md.
   ───────────────────────────────────────────────────────────── */
(function(){
  'use strict';

  var racine = document.documentElement;
  // .js (normalement déjà posé par la ligne du <head>) et .site-pret : le filet CSS se retire.
  racine.classList.add('js', 'site-pret');

  var mouvementReduit = false;
  try { mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  window.PerifySite = { mouvementReduit: mouvementReduit };

  function tous(selecteur, depuis){ return [].slice.call((depuis || document).querySelectorAll(selecteur)); }
  function isoler(nom, fn){
    try { fn(); }
    catch (e) { if (window.console) console.error('[site.js] ' + nom + ' :', e); }
  }

  /* ── Surveillance « quand c'est à l'écran » ─────────────────
     Un IntersectionObserver par usage + un filet commun : au chargement, au
     défilement, au redimensionnement et après un lien #ancre, on vérifie à la
     main tout ce qui attend encore (l'observateur rate parfois une arrivée
     directe au milieu de la page). */
  var enAttente = [];   // { el, action, fait }

  function dansEcran(el, marge){
    var r = el.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    return r.bottom > -40 && r.top < h * (marge || 0.98) && (r.width > 0 || r.height > 0);
  }

  function surveiller(elements, action, options){
    options = options || {};
    var suivis = elements.map(function(el){ return { el: el, action: action, fait: false }; });
    suivis.forEach(function(s){ enAttente.push(s); });
    if (!('IntersectionObserver' in window)) { suivis.forEach(declencher); return; }
    var io = new IntersectionObserver(function(entrees){
      var rang = 0;
      entrees.forEach(function(e){
        if (!e.isIntersecting) return;
        var s = trouver(e.target, action);
        io.unobserve(e.target);
        if (!s || s.fait) return;
        var delai = options.cascade ? Math.min(rang * 70, 280) : 0;
        rang++;
        if (delai) setTimeout(function(){ declencher(s); }, delai); else declencher(s);
      });
    }, { rootMargin: options.rootMargin || '0px 0px -8% 0px', threshold: options.seuil || 0.08 });
    suivis.forEach(function(s){ io.observe(s.el); });
  }

  function trouver(el, action){
    for (var i = 0; i < enAttente.length; i++) if (enAttente[i].el === el && enAttente[i].action === action) return enAttente[i];
    return null;
  }

  function declencher(s){
    if (s.fait) return;
    s.fait = true;
    try { s.action(s.el); } catch (e) { if (window.console) console.error('[site.js]', e); }
  }

  function verifier(){
    enAttente = enAttente.filter(function(s){
      if (s.fait) return false;
      if (dansEcran(s.el)) { declencher(s); return false; }
      return true;
    });
  }
  var verifPrevue = false;
  function planifierVerif(){
    if (verifPrevue) return;
    verifPrevue = true;
    (window.requestAnimationFrame || setTimeout)(function(){ verifPrevue = false; verifier(); });
  }
  window.addEventListener('load', verifier);
  window.addEventListener('scroll', planifierVerif, { passive: true });
  window.addEventListener('resize', planifierVerif);
  window.addEventListener('hashchange', function(){ setTimeout(verifier, 500); });

  /* ── 1 + 2. Apparitions et marqueur ─────────────────────── */
  function tracerMarques(el){
    if (el.classList.contains('marque')) el.classList.add('trace');
    tous('.marque', el).forEach(function(m){ m.classList.add('trace'); });
  }
  function montrer(el){
    el.classList.add('vu');
    tracerMarques(el);
  }

  isoler('apparitions', function(){
    var cibles = tous('.rev');
    // Un marqueur hors de tout .rev se déclenche seul, quand il arrive à l'écran.
    tous('.marque').forEach(function(m){ if (!m.closest || !m.closest('.rev')) cibles.push(m); });
    if (mouvementReduit) { cibles.forEach(montrer); return; }
    surveiller(cibles, montrer, { cascade: true });
  });

  /* ── 3. Menu téléphone ───────────────────────────────────
     <button class="menu-bouton" aria-expanded="false" aria-controls="menu-principal">
     ouvre/ferme <nav id="menu-principal" class="menu"> sous l'en-tête (< 920 px).
     Échap ferme et rend le focus au bouton ; un clic dehors ferme (et rend le focus
     au bouton si le focus était dans le menu) ; un lien cliqué ferme ; passer en
     grand écran ferme. */
  isoler('menu', function(){
    var entete = document.querySelector('.entete');
    var bouton = entete && entete.querySelector('.menu-bouton');
    var menu = bouton && document.getElementById(bouton.getAttribute('aria-controls'));
    if (!menu) return;

    function estOuvert(){ return entete.classList.contains('ouvert'); }
    function ouvrir(){
      entete.classList.add('ouvert');
      bouton.setAttribute('aria-expanded', 'true');
    }
    function fermer(rendreFocus){
      if (!estOuvert()) return;
      entete.classList.remove('ouvert');
      bouton.setAttribute('aria-expanded', 'false');
      if (rendreFocus) { try { bouton.focus({ preventScroll: true }); } catch (e) { bouton.focus(); } }
    }

    bouton.addEventListener('click', function(){ if (estOuvert()) fermer(false); else ouvrir(); });

    document.addEventListener('keydown', function(ev){
      if ((ev.key === 'Escape' || ev.key === 'Esc') && estOuvert()) { ev.preventDefault(); fermer(true); }
    });

    document.addEventListener('click', function(ev){
      if (!estOuvert() || entete.contains(ev.target)) return;
      var actif = document.activeElement;
      fermer(!actif || actif === document.body || menu.contains(actif));
    });

    // Un lien du menu (même une ancre de la page courante) referme le panneau.
    menu.addEventListener('click', function(ev){
      var lien = ev.target.closest ? ev.target.closest('a') : null;
      if (lien) fermer(false);
    });

    // Le focus quitte l'en-tête au clavier (Tab) : on referme sans le reprendre.
    entete.addEventListener('focusout', function(ev){
      if (estOuvert() && ev.relatedTarget && !entete.contains(ev.relatedTarget)) fermer(false);
    });

    // En passant en grand écran, le menu redevient une ligne : on ferme le panneau.
    try {
      var large = window.matchMedia('(min-width: 920px)');
      var auChangement = function(e){ if (e.matches) fermer(false); };
      if (large.addEventListener) large.addEventListener('change', auChangement); else large.addListener(auChangement);
    } catch (e) {}
  });

  /* ── 4. Compteur qui roule ──────────────────────────────
     HTML : <b data-compte="92" data-suffixe="&nbsp;%">92&nbsp;%</b>
       data-compte     la valeur finale (point ou virgule : « 0.15 » ou « 0,15 »)
       data-suffixe    ce qui suit le nombre (« &nbsp;% », « &nbsp;s », « &nbsp;€ »…)
       data-prefixe    ce qui le précède (rare)
       data-decimales  nombre de décimales affichées (0 par défaut)
     L'élément ne contient QUE le texte du nombre (aucune balise dedans) : site.js
     le remplace par <span class="lecteur">valeur finale</span> (lue par les lecteurs
     d'écran, toujours juste) + <span class="compte-vu" aria-hidden="true">qui roule</span>.
     À l'entrée dans l'écran, le nombre monte de 0 à sa valeur en 1,6 s (ease-out).

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

  isoler('compteurs', function(){
    var compteurs = tous('[data-compte]');
    if (!compteurs.length) return;
    var aRouler = [];
    compteurs.forEach(function(el){
      var etat = PerifyCompteur._preparer(el);
      if (mouvementReduit || etat.valeur === null) return;      // la valeur finale reste affichée
      // Il part de 0 seulement maintenant que le JS tourne (le HTML porte la valeur finale).
      etat.vu.textContent = PerifyCompteur._texte(el, 0);
      aRouler.push(el);
    });
    surveiller(aRouler, function(el){
      var etat = PerifyCompteur._preparer(el);
      var fin = etat.valeur;
      etat.valeur = 0;
      PerifyCompteur.animer(el, fin, { depuis: 0 });
    }, { seuil: 0.35, rootMargin: '0px' });
  });

  /* ── 5. Mot qui défile ───────────────────────────────────
     HTML :
       <span class="defile" data-defile>
         <span class="lecteur">boulangeries, restaurants, snacks…</span>
         <span class="defile-mots" aria-hidden="true"><span>boulangeries</span><span>restaurants</span>…</span>
       </span>
     Sans JS (ou mouvement réduit) : le premier mot, immobile, dans son cadre.
     Avec JS : toutes les 3,2 s le mot suivant monte (ressort, 1,1 s) et le cadre
     prend sa largeur (0,5 s). Une copie du premier mot en fin de liste permet de
     boucler sans saut. Aucun aria-live (ça parlerait toutes les 3 s). */
  isoler('mot qui défile', function(){
    tous('[data-defile]').forEach(function(bloc){
      var mots = bloc.querySelector('.defile-mots');
      if (!mots) return;
      var sources = [].slice.call(mots.children);
      var n = sources.length;
      if (n < 1) return;

      var i = 0;
      function ajusterCadre(){
        var l = sources[i % n].getBoundingClientRect().width;
        if (l) bloc.style.setProperty('--cadre', l.toFixed(1) + 'px');
      }
      ajusterCadre();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajusterCadre);
      window.addEventListener('resize', ajusterCadre);
      window.addEventListener('load', ajusterCadre);
      // La feuille Google Fonts arrive en différé (preload puis onload) : fonts.ready et « load »
      // peuvent passer AVANT Plus Jakarta Sans, et le cadre garderait la largeur de la police de
      // secours (13 à 16 px de trop). La liste des mots change de largeur quand la vraie police
      // arrive : on le surveille, et on écoute aussi la fin de chaque chargement de police.
      if ('ResizeObserver' in window) { try { new ResizeObserver(ajusterCadre).observe(mots); } catch (e) {} }
      if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', ajusterCadre);
      if (mouvementReduit || n < 2) return;

      var fenetre = document.createElement('span');
      fenetre.className = 'defile-fenetre';
      fenetre.setAttribute('aria-hidden', 'true');
      var liste = document.createElement('span');
      liste.className = 'defile-liste';
      sources.concat([sources[0]]).forEach(function(src){
        var s = document.createElement('span');
        s.textContent = src.textContent;
        liste.appendChild(s);
      });
      fenetre.appendChild(liste);
      bloc.appendChild(fenetre);
      bloc.classList.add('defile-actif');

      function avancer(){
        if (document.hidden) { setTimeout(avancer, 3200); return; }
        i++;
        liste.style.transform = 'translateY(' + (-100 * i / (n + 1)).toFixed(4) + '%)';
        ajusterCadre();
        if (i === n) {
          // arrivé sur la copie du premier mot : on revient au vrai premier, sans transition
          setTimeout(function(){
            liste.classList.add('sans-transition');
            i = 0;
            liste.style.transform = 'translateY(0)';
            void liste.offsetHeight;
            liste.classList.remove('sans-transition');
          }, 1200);
        }
        setTimeout(avancer, 3200);
      }
      setTimeout(avancer, 3200);
    });
  });

  /* ── 6. Adresse e-mail assemblée (jamais en clair dans le HTML) ──
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

  // Filet de départ : l'observateur montre d'abord le haut de page (en cascade) ; ce qui
  // lui aurait échappé et qui est déjà à l'écran s'affiche au plus tard 0,6 s après.
  setTimeout(verifier, 600);
})();
