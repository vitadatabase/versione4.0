
let numero = 2;
const min = 2;
const max = 8;

function modificaGiocatori(delta) {
    numero = Math.min(max, Math.max(min, numero + delta));
    document.getElementById('numeroGiocatori').textContent = numero;
}

function iniziaPartita() {
    window.location.href = `punteggi.html?giocatori=${numero}`;
}

