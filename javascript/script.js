// Date de fin de construction (à définir)
const endDate = new Date("2024-04-30");

function updateCountdown() {
    const now = new Date();
    const timeLeft = endDate - now;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerHTML = `${days} jours ${hours} heures ${minutes} minutes ${seconds} secondes`;
}

// Mettre à jour le compte à rebours chaque seconde
setInterval(updateCountdown, 1000);
