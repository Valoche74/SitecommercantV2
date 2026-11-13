/* bandes.js — les bandes qui défilent de l'accueil (bandes.css les fait tourner sans ce script).
   Ce script ajoute deux choses :
   - la pause quand la bande sort de l'écran (.hors-ecran), pour ne rien animer d'invisible ;
   - la pause au toucher ou au clic (.en-pause), un second geste relance : tout ce qui bouge doit pouvoir s'arrêter. */
(function(){
  'use strict';
  var bandes = [].slice.call(document.querySelectorAll('[data-bande]'));
  if(!bandes.length){ return; }
  bandes.forEach(function(bande){
    bande.addEventListener('click', function(){ bande.classList.toggle('en-pause'); });
  });
  if('IntersectionObserver' in window){
    var veille = new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){ e.target.classList.toggle('hors-ecran', !e.isIntersecting); });
    });
    bandes.forEach(function(bande){ veille.observe(bande); });
  }
})();
