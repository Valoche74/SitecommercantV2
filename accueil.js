/* ─────────────────────────────────────────────────────────────
   PERIFY — accueil.js, le script de la page d'accueil (26/09/2026, V2 le 27/09)
   Chargé en defer après site.js. JavaScript simple, sans dépendance.

   Les effets de l'accueil viennent presque tous du socle (site.css /
   site.js : marqueur, mot qui défile, bordure lumineuse, bande des
   métiers, apparitions, compteurs, pause hors écran) ; l'éventail des
   présentoirs a son propre fichier (eventail.js). Ce fichier ne fait
   qu'une chose :

   REJOUER LES SCÈNES AU SURVOL — chaque bloc de « Tout est compris »
   porte une petite scène dessinée qui s'anime une fois quand le bloc
   apparaît (classe .vu, posée par site.js ; règles dans accueil.css).
   Quand la souris arrive sur un bloc, on rejoue sa scène : on pose
   .rejoue (retour instantané au départ), on laisse le navigateur le
   prendre en compte, puis on la retire (le mouvement repart).
   - souris seulement (pas au toucher : sur téléphone, le doigt qui fait
     défiler la page passerait sur les blocs) ;
   - jamais pendant que la scène joue déjà (durée : data-duree du bloc),
     pour qu'un passage rapide de la souris ne la fasse pas hoqueter ;
   - rien en mouvement réduit (les scènes y sont figées dans leur état final).

   (La pause hors écran de la bande et du bouton lumineux, qui était ici
   le 26/09, est désormais faite par le socle pour toutes les pages.)

   Rien n'est jamais caché : sans ce fichier, les scènes s'animent à
   l'apparition et c'est tout.
   ───────────────────────────────────────────────────────────── */
(function(){
  'use strict';

  try {
    var reduit = false;
    if (window.PerifySite && typeof window.PerifySite.mouvementReduit === 'boolean') reduit = window.PerifySite.mouvementReduit;
    else { try { reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {} }
    if (reduit) return;

    var souris = false;
    try { souris = window.matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) {}
    if (!souris) return;

    var blocs = [].slice.call(document.querySelectorAll('.bento-bloc'));
    if (!blocs.length) return;

    blocs.forEach(function(bloc){
      var duree = parseInt(bloc.getAttribute('data-duree'), 10) || 1600;
      var depuis = 0;            // moment où la scène a (re)commencé à jouer

      // La première animation part quand site.js pose .vu : on note ce moment, pour qu'un
      // survol pendant cette première animation ne la relance pas au milieu.
      if ('MutationObserver' in window) {
        var mo = new MutationObserver(function(){
          if (bloc.classList.contains('vu')) { depuis = Date.now(); mo.disconnect(); }
        });
        mo.observe(bloc, { attributes: true, attributeFilter: ['class'] });
      }

      bloc.addEventListener('pointerenter', function(ev){
        if (ev.pointerType && ev.pointerType !== 'mouse') return;
        if (!bloc.classList.contains('vu')) return;          // pas encore apparu : l'apparition jouera
        var maintenant = Date.now();
        if (maintenant - depuis < duree) return;             // elle joue encore
        depuis = maintenant;
        bloc.classList.add('rejoue');
        void bloc.offsetWidth;                               // le navigateur prend l'état de départ
        bloc.classList.remove('rejoue');
      });
    });
  } catch (e) {
    if (window.console) console.error('[accueil.js] scènes :', e);
  }
})();
