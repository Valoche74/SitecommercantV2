/* bandes.js — les bandes qui défilent de l'accueil (bandes.css les fait tourner sans ce script).
   Ce script ajoute trois choses (tout ce qui bouge doit pouvoir s'arrêter, à la souris, au doigt et au clavier) :
   - la pause quand la bande sort de l'écran (.hors-ecran), pour ne rien animer d'invisible ;
   - la pause au toucher ou au clic (.en-pause), un second geste relance ;
   - le bouton [data-bandes-arret], pour le clavier : caché par l'attribut hidden tant que ce script ne tourne pas,
     invisible tant qu'il n'a pas le focus (bandes.css). Il arrête les deux bandes, puis les relance ; son texte dit
     ce qu'il va faire (le second texte est dans data-relancer). */
(function(){
  'use strict';
  var bandes = [].slice.call(document.querySelectorAll('[data-bande]'));
  if(!bandes.length){ return; }
  var arret = document.querySelector('[data-bandes-arret]');
  var texteArreter = arret ? arret.textContent : '';
  var texteRelancer = arret ? (arret.getAttribute('data-relancer') || texteArreter) : '';

  function toutesArretees(){
    return bandes.every(function(b){ return b.classList.contains('en-pause'); });
  }
  function majArret(){
    if(arret){ arret.textContent = toutesArretees() ? texteRelancer : texteArreter; }
  }

  bandes.forEach(function(bande){
    bande.addEventListener('click', function(){ bande.classList.toggle('en-pause'); majArret(); });
  });
  if(arret){
    arret.addEventListener('click', function(){
      var arreter = !toutesArretees();
      bandes.forEach(function(b){ b.classList.toggle('en-pause', arreter); });
      majArret();
    });
    arret.hidden = false;
  }
  if('IntersectionObserver' in window){
    var veille = new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){ e.target.classList.toggle('hors-ecran', !e.isIntersecting); });
    });
    bandes.forEach(function(bande){ veille.observe(bande); });
  }
})();
