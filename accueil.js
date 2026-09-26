/* ─────────────────────────────────────────────────────────────
   PERIFY — accueil.js, le script de la page d'accueil (26/09/2026)
   Chargé en defer après site.js. JavaScript simple, sans dépendance.

   Les effets de l'accueil viennent presque tous du socle (site.css /
   site.js : marqueur, mot qui défile, bordure lumineuse, bande des
   métiers, apparitions) ; l'éventail des présentoirs a son propre fichier
   (eventail.js). Ce fichier ne fait qu'une chose :

   ÉCONOMIE — ce qui tourne en boucle (la bande des métiers, le reflet de
   la bordure lumineuse) s'arrête quand il sort de l'écran et repart quand
   il y revient (classe .hors-ecran, règle dans accueil.css). Le reflet
   redessine le bouton à chaque image : inutile de le faire hors de la vue,
   surtout sur un téléphone.

   Rien n'est jamais caché : sans ce fichier, tout tourne comme avant.
   Mouvement réduit : rien ne bouge déjà, il n'y a rien à suspendre.
   ───────────────────────────────────────────────────────────── */
(function(){
  'use strict';

  try {
    var reduit = window.PerifySite ? !!window.PerifySite.mouvementReduit : false;
    if (!window.PerifySite) {
      try { reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    }
    if (reduit || !('IntersectionObserver' in window)) return;

    var boucles = [].slice.call(document.querySelectorAll('.bande, .btn-lumiere'));
    if (!boucles.length) return;

    var io = new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){
        // une marge de 120 px : l'animation reprend un peu avant d'entrer à l'écran
        if (e.isIntersecting) e.target.classList.remove('hors-ecran');
        else e.target.classList.add('hors-ecran');
      });
    }, { rootMargin: '120px 0px 120px 0px', threshold: 0 });

    boucles.forEach(function(el){ io.observe(el); });
  } catch (e) {
    if (window.console) console.error('[accueil.js] économie :', e);
  }
})();
