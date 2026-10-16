document.querySelector('h1').addEventListener('click', function () {
  document.getElementById('bg-audio').play()
    .catch(err => console.log("Lecture bloquée :", err));
}, { once: true });
