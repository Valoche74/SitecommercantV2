/* ─────────────────────────────────────────────────────────────
   PERIFY — eventail.js, l'ÉVENTAIL DES PRÉSENTOIRS (effet 6, 26/09/2026)
   Cahier IMAGE/design-kit/REFONTE-4-PAGES.md, § 3 (effet 6).
   Modèle de Valentin : « card fan carousel » — refait à la main : aucun
   GSAP, aucun React, rien d'externe. Chargé en defer, après site.js.

   Ce que fait ce fichier, pour chaque [data-eventail] (balisage : eventail.css) :
   - les cartes en arc, dans l'ordre du cercle : rotations -12°, -4°, 4°, 12° et
     décalages verticaux (les cartes extérieures plus bas) ; la carte active (celle
     de -4°) passe au centre, devant, droite, un peu levée ;
   - l'entrée : quand la section arrive à l'écran, les cartes montent du bas
     et s'ouvrent en éventail avec un rebond (en cascade) ;
   - le survol (souris) : l'éventail s'écarte, la carte survolée se soulève ;
     un clic sur une carte du fond l'amène devant ;
   - flèches ‹ › et points : pagination circulaire (après la dernière, la
     première) ; la carte qui fait le tour sort d'un côté et revient de l'autre ;
   - clavier : flèches gauche/droite quand le bloc (ou un de ses boutons) a le focus ;
   - téléphone : glisser du doigt (pointer events, seuil 40 px) ;
   - lecteur d'écran : « Présentoir 2 sur 4 » dans .eventail-etat (aria-live),
     écrit à chaque changement (pas au chargement : rien ne parle tout seul).
   Mouvement réduit (window.PerifySite.mouvementReduit) : pas d'entrée animée, pas
   d'écartement au survol, changements instantanés.

   Règle d'or : rien n'est caché si ce fichier ne tourne pas. Il pose lui-même
   .eventail-pret ; sans cette classe, eventail.css montre les cartes côte à côte.
   ───────────────────────────────────────────────────────────── */
(function(){
  'use strict';

  var ANGLE = 12;            // rotation des cartes extérieures (les intérieures : un tiers, soit 4°)
  var ECART_SURVOL = 1.18;   // l'éventail s'écarte de 18 % au survol…
  var ANGLE_SURVOL = 1.2;    // …et s'ouvre de 20 % (12° → 14,4°)
  var POUSSEE = 0.55;        // une carte du fond jamais à moins de 55 % de l'écart du centre
  var SEUIL_GLISSE = 40;     // px : un glissé plus court ne change pas de carte
  var SEUIL_APPUI = 8;       // px : en dessous, c'est un appui (pas un glissé)

  function mouvementReduit(){
    if (window.PerifySite && typeof window.PerifySite.mouvementReduit === 'boolean') return window.PerifySite.mouvementReduit;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  function nombre(v){ return (Math.round(v * 10) / 10).toFixed(1); }

  function monter(bloc){
    var scene = bloc.querySelector('.eventail-cartes');
    var cartes = scene ? [].slice.call(scene.querySelectorAll('.eventail-carte')) : [];
    var n = cartes.length;
    if (n < 2) return;       // une seule carte : rien à animer, elle reste posée

    var boutonPrec = bloc.querySelector('.eventail-prec');
    var boutonSuiv = bloc.querySelector('.eventail-suiv');
    var zonePoints = bloc.querySelector('.eventail-points');
    var etat = bloc.querySelector('.eventail-etat');
    var reduit = mouvementReduit();

    var actif = 0;           // la carte devant (0 = la première du HTML)
    var ouvert = false;      // éventail écarté (souris sur une carte)
    var survolee = -1;       // la carte sous la souris
    var entre = false;       // l'entrée a eu lieu (avant : cartes repliées, invisibles)
    var minuteurEntree = 0;
    var minuteurs = [];      // les retours des cartes qui font le tour du cercle

    // La case de chaque carte dans l'arc (0 = tout à gauche). La carte active occupe la
    // case du milieu (4 cartes : la 2e, celle de -4°) ; les autres suivent l'ordre du cercle.
    var milieu = Math.floor((n - 1) / 2);
    function caseDe(i, a){ return ((i - a + milieu) % n + n) % n; }
    // position dans l'arc, de -1 (gauche) à 1 (droite) : 4 cartes → -1, -1/3, 1/3, 1
    function rang(k){ return (k - (n - 1) / 2) / ((n - 1) / 2); }

    /* ── Mesures : tout se règle sur la largeur réelle d'une carte et de la scène ── */
    function mesurer(){
      var l = cartes[0].offsetWidth || 200;
      var h = cartes[0].offsetHeight || l * 1.5;
      var largeur = scene.clientWidth || l * 3;
      var rad = ANGLE * ANGLE_SURVOL * Math.PI / 180;
      // demi-largeur d'une carte tournée (coins compris), pour que l'arc tienne dans la scène
      var demi = l / 2 * Math.cos(rad) + h / 2 * Math.sin(rad);
      var ecart = Math.min(l * 0.95, (largeur / 2 - demi - 12) / ECART_SURVOL);
      // Téléphone : la place manque. L'éventail se resserre, mais pas au point de cacher les
      // cartes du fond : elles dépassent un peu et sont rognées au bord de l'écran.
      ecart = Math.max(ecart, l * 0.42);
      return { l: l, h: h, ecart: ecart, arc: l * 0.10, lever: l * 0.06 };
    }

    // La pose d'une carte : décalage, rotation, échelle, plan (z-index).
    // La carte active passe au CENTRE de la scène (x = 0) ; les cartes du fond gardent leur
    // place dans l'arc (bords à ±12°, silhouette symétrique), sauf une carte intérieure trop
    // proche du centre (4 cartes : celle de 4°), poussée vers l'extérieur pour rester visible.
    function poseDe(i, m){
      var t = rang(caseDe(i, actif));
      var o = ouvert ? ECART_SURVOL : 1;
      var tx = (Math.abs(t) < POUSSEE && t !== 0) ? (t < 0 ? -POUSSEE : POUSSEE) : t;
      var p = {
        x: tx * m.ecart * o,
        y: t * t * m.arc,                               // arc : les cartes extérieures plus bas
        r: t * ANGLE * (ouvert ? ANGLE_SURVOL : 1),
        s: 0.94,
        z: 20 - Math.round(Math.abs(t) * 10)            // les cartes intérieures devant les extérieures
      };
      if (i === actif) {                                // au centre, devant, droite
        p.x = 0; p.y = -m.lever; p.r = 0; p.s = 1.04; p.z = 40;
      } else if (i === survolee) {                      // la carte survolée se soulève
        p.y -= m.lever; p.s += 0.02;
      }
      return p;
    }
    function transformDe(p){
      return 'translate3d(' + nombre(p.x) + 'px,' + nombre(p.y) + 'px,0) rotate(' + p.r.toFixed(2) + 'deg) scale(' + p.s.toFixed(3) + ')';
    }

    function poser(c, i, m){
      var p = poseDe(i, m);
      c.classList.remove('eventail-sortie', 'eventail-sans-transition');
      c.style.zIndex = p.z;
      c.style.transform = transformDe(p);
      c.style.opacity = '';
    }
    function disposer(){
      var m = mesurer();
      cartes.forEach(function(c, i){ poser(c, i, m); });
    }

    /* ── Points de pagination (créés ici ; le conteneur est aria-hidden) ── */
    var points = [];
    if (zonePoints) {
      zonePoints.textContent = '';
      cartes.forEach(function(){
        var p = document.createElement('span');
        p.className = 'eventail-point';
        zonePoints.appendChild(p);
        points.push(p);
      });
    }

    function marquer(annoncer){
      cartes.forEach(function(c, i){
        c.classList.toggle('est-active', i === actif);
        if (i === actif) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current');
      });
      points.forEach(function(p, i){ p.classList.toggle('est-actif', i === actif); });
      if (annoncer && etat) etat.textContent = 'Présentoir ' + (actif + 1) + ' sur ' + n;
    }

    /* ── Changer de carte (circulaire) ────────────────────── */
    function annulerTours(){
      minuteurs.forEach(clearTimeout);
      minuteurs = [];
    }
    function finEntree(){
      if (minuteurEntree) { clearTimeout(minuteurEntree); minuteurEntree = 0; }
      bloc.classList.remove('eventail-entree');
      cartes.forEach(function(c){ c.style.transitionDelay = ''; });
    }

    // sens : +1 = vers la droite de l'arc (suivant), -1 = vers la gauche (précédent)
    function aller(cible, sens){
      cible = ((cible % n) + n) % n;
      if (cible === actif) return;
      var avant = actif;
      annulerTours();
      finEntree();
      actif = cible;
      survolee = -1;
      marquer(true);
      if (!entre) return;                               // pas encore entré : l'entrée posera tout
      var m = mesurer();
      cartes.forEach(function(c, i){
        var k0 = caseDe(i, avant), k1 = caseDe(i, actif);
        // Suivant : toutes les cartes glissent d'une case vers la gauche ; celle qui « passe
        // le bord » (sa case augmente) fait le tour : elle sort à gauche et revient à droite.
        var tour = !reduit && ((sens > 0 && k1 > k0) || (sens < 0 && k1 < k0));
        if (!tour) { poser(c, i, m); return; }
        var cote = sens > 0 ? -1 : 1;                   // le côté par où elle sort
        var loin = m.ecart * ECART_SURVOL + m.l * 0.9;
        c.classList.remove('eventail-sans-transition');
        c.classList.add('eventail-sortie');
        c.style.zIndex = 1;
        c.style.transform = 'translate3d(' + nombre(cote * loin) + 'px,' + nombre(m.arc) + 'px,0) rotate(' + (cote * 24) + 'deg) scale(.7)';
        c.style.opacity = '0';
        minuteurs.push(setTimeout(function(){
          // de l'autre côté, sans transition, puis retour à sa case avec le ressort
          c.classList.remove('eventail-sortie');
          c.classList.add('eventail-sans-transition');
          c.style.transform = 'translate3d(' + nombre(-cote * loin) + 'px,' + nombre(m.arc) + 'px,0) rotate(' + (-cote * 24) + 'deg) scale(.7)';
          void c.offsetWidth;                           // le navigateur prend la position de départ
          poser(c, i, mesurer());
        }, 290));
      });
    }
    function suivant(){ aller(actif + 1, 1); }
    function precedent(){ aller(actif - 1, -1); }
    // une carte du fond touchée : elle vient devant (par le chemin qu'on voit : à sa droite → suivant)
    function amener(i){ aller(i, caseDe(i, actif) > milieu ? 1 : -1); }

    /* ── Entrée : montée du bas, éventail qui s'ouvre avec un rebond ── */
    function preparerEntree(){
      var m = mesurer();
      bloc.classList.add('eventail-attente');
      cartes.forEach(function(c){
        c.style.zIndex = '';
        c.style.transform = 'translate3d(0,' + nombre(m.h * 0.35) + 'px,0) scale(.5)';
      });
    }
    function entrer(){
      if (entre) return;
      entre = true;
      if (reduit) { bloc.classList.remove('eventail-attente'); disposer(); return; }
      void scene.offsetWidth;                           // la position repliée est bien prise
      bloc.classList.remove('eventail-attente');
      bloc.classList.add('eventail-entree');
      cartes.forEach(function(c, i){
        c.style.transitionDelay = (0.12 + caseDe(i, actif) * 0.07).toFixed(2) + 's';
      });
      disposer();
      minuteurEntree = setTimeout(finEntree, 1150 + 120 + n * 70 + 80);
    }
    function aLEcran(){
      var r = scene.getBoundingClientRect();
      var hv = window.innerHeight || document.documentElement.clientHeight;
      return r.bottom > 0 && r.top < hv * 0.9 && r.width > 0;
    }

    /* ── Mise en route ────────────────────────────────────── */
    bloc.classList.add('eventail-pret');
    if (reduit) bloc.classList.add('eventail-reduit');
    cartes.forEach(function(c){
      var img = c.querySelector('img');
      if (img) img.setAttribute('draggable', 'false');
    });
    marquer(false);

    if (reduit || !('IntersectionObserver' in window)) {
      entre = true;
      disposer();
    } else {
      preparerEntree();
      var io = new IntersectionObserver(function(entrees){
        entrees.forEach(function(e){ if (e.isIntersecting) { io.disconnect(); entrer(); } });
      }, { threshold: 0.2 });
      io.observe(scene);
      // Filet (comme site.js) : si l'observateur rate une arrivée directe au milieu de la
      // page, on vérifie à la main au chargement et au défilement.
      var verifier = function(){
        if (entre) { window.removeEventListener('scroll', verifier); return; }
        if (aLEcran()) { io.disconnect(); window.removeEventListener('scroll', verifier); entrer(); }
      };
      window.addEventListener('load', verifier);
      window.addEventListener('scroll', verifier, { passive: true });
      setTimeout(verifier, 800);
    }

    /* ── Boutons et clavier ───────────────────────────────── */
    if (boutonPrec) boutonPrec.addEventListener('click', precedent);
    if (boutonSuiv) boutonSuiv.addEventListener('click', suivant);
    bloc.addEventListener('keydown', function(ev){
      if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
      if (ev.key === 'ArrowRight' || ev.key === 'Right') { ev.preventDefault(); suivant(); }
      else if (ev.key === 'ArrowLeft' || ev.key === 'Left') { ev.preventDefault(); precedent(); }
    });

    /* ── Doigt et souris : glisser (≥ 40 px) ou toucher une carte du fond ── */
    function carteSous(cible){
      var li = cible && cible.closest ? cible.closest('.eventail-carte') : null;
      return li ? cartes.indexOf(li) : -1;
    }
    var geste = null;
    scene.addEventListener('pointerdown', function(ev){
      if (ev.isPrimary === false || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
      geste = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, carte: carteSous(ev.target) };
      if (ev.pointerType === 'mouse') { try { scene.setPointerCapture(ev.pointerId); } catch (e) {} }
    });
    scene.addEventListener('pointerup', function(ev){
      if (!geste || ev.pointerId !== geste.id) return;
      var dx = ev.clientX - geste.x, dy = ev.clientY - geste.y, g = geste;
      geste = null;
      if (Math.abs(dx) >= SEUIL_GLISSE && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) suivant(); else precedent();          // doigt vers la gauche : la carte suivante
      } else if (Math.abs(dx) < SEUIL_APPUI && Math.abs(dy) < SEUIL_APPUI && g.carte > -1 && g.carte !== actif) {
        amener(g.carte);
      }
    });
    scene.addEventListener('pointercancel', function(){ geste = null; });  // le navigateur fait défiler la page

    /* ── Survol à la souris : l'éventail s'écarte, la carte survolée se soulève ── */
    if (!reduit) {
      scene.addEventListener('pointerover', function(ev){
        if (ev.pointerType !== 'mouse' || !entre || bloc.classList.contains('eventail-entree')) return;
        var i = carteSous(ev.target);
        if (i < 0) return;
        if (ouvert && i === survolee) return;
        ouvert = true;
        survolee = i === actif ? -1 : i;
        disposer();
      });
      scene.addEventListener('pointerleave', function(ev){
        if (ev.pointerType !== 'mouse' || !ouvert) return;
        ouvert = false;
        survolee = -1;
        if (entre) disposer();
      });
    }

    /* ── Redimensionnement : on recalcule l'arc ─────────────── */
    var prevu = false;
    function recalculer(){
      if (prevu) return;
      prevu = true;
      (window.requestAnimationFrame || setTimeout)(function(){
        prevu = false;
        if (entre) disposer(); else preparerEntree();
      });
    }
    window.addEventListener('resize', recalculer);
    if ('ResizeObserver' in window) { try { new ResizeObserver(recalculer).observe(scene); } catch (e) {} }
  }

  [].slice.call(document.querySelectorAll('[data-eventail]')).forEach(function(bloc){
    try { monter(bloc); }
    catch (e) {
      // En cas de pépin : on retire la scène, les cartes restent côte à côte (rien de caché).
      bloc.classList.remove('eventail-pret', 'eventail-attente', 'eventail-entree');
      [].slice.call(bloc.querySelectorAll('.eventail-carte')).forEach(function(c){ c.removeAttribute('style'); });
      if (window.console) console.error('[eventail.js]', e);
    }
  });
})();
