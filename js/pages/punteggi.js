const urlParams = new URLSearchParams(window.location.search);
const numGiocatori = parseInt(urlParams.get('giocatori')) || 2;

const board = document.getElementById('board');

for (let i = 1; i <= numGiocatori; i++) {
    const div = document.createElement('div');
    div.className = 'segnapunto';
    div.innerHTML = `
    <div class="controls">
        <button onclick="cambia(${i}, -1)">−</button>
        <div class="punteggio" id="punti${i}">0</div>
        <button onclick="cambia(${i}, 1)">+</button>
    </div>
    <div class="giocatore">Giocatore ${i}</div>
    `;
    board.appendChild(div);
}

function cambia(id, delta) {
    const el = document.getElementById('punti' + id);
    let val = parseInt(el.textContent);
    val = Math.max(0, Math.min(20, val + delta));
    el.textContent = val;
}