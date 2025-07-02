// projectOverlay.js
if ('ontouchstart' in window) {
    document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function() {
        // Verwijder 'clicked' van alle kaarten
        document.querySelectorAll('.project-card').forEach(c => c.classList.remove('clicked'));
        // Voeg 'clicked' toe aan de geklikte kaart
        this.classList.add('clicked');
        });

        // Optioneel: klik op de overlay zelf sluit hem weer
        card.querySelector('.overlay').addEventListener('click', function(e) {
        e.stopPropagation();
        card.classList.remove('clicked');
        });
    });
    });
}