// Carica mazzi da localStorage, mostra ordinati per nome
function caricaMazzi() {
const container = document.getElementById('listaMazzi');
container.innerHTML = '';
const keys = Object.keys(localStorage)
    .filter(k => k.startsWith('mazzo_'))
    .sort();

if (keys.length === 0) {
    container.textContent = 'Nessun mazzo salvato.';
    return;
}

keys.forEach(key => {
    const nomeMazzo = key.slice(6); // togli 'mazzo_'
    let mazzo;
    try {
    mazzo = JSON.parse(localStorage.getItem(key));
    } catch {
    mazzo = null;
    }
    if (!mazzo) return;

    // Ottieni carte nel mazzo con dati da database e ordina per COSTO crescente
    // Per avere info carte serve fetch cards.json sincronizzato? Facciamo asincrono:
    fetch('cards.json')
    .then(res => res.json())
    .then(cardsDatabase => {
        // Converte mazzo {nomeCarta: qty} in array con info
        const carteConInfo = [];
        for (const nomeCarta in mazzo) {
        const cartaInfo = cardsDatabase.find(c => c["NOME CARTA"] === nomeCarta);
        if (!cartaInfo) continue;
        carteConInfo.push({ nomeCarta, qty: mazzo[nomeCarta], costo: cartaInfo.COSTO || 0 });
        }
        carteConInfo.sort((a,b) => a.costo - b.costo);

        // Crea markup
        const divMazzo = document.createElement('div');
        divMazzo.className = 'mazzo-item';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'mazzo-info';

        const titolo = document.createElement('strong');
        titolo.textContent = nomeMazzo;
        infoDiv.appendChild(titolo);

        const cardsText = carteConInfo.map(c => `${c.nomeCarta} (${c.qty})`).join(', ');
        const cardsDiv = document.createElement('div');
        cardsDiv.className = 'mazzo-cards';
        cardsDiv.textContent = cardsText || '(Mazzo vuoto)';
        infoDiv.appendChild(cardsDiv);

        divMazzo.appendChild(infoDiv);

        // Buttons container
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'mazzo-buttons';

        // Carica
        const btnCarica = document.createElement('button');
        btnCarica.textContent = 'Carica';
        btnCarica.onclick = () => {
        alert(`Caricato mazzo "${nomeMazzo}"`); 
        // qui metti la funzione che ti serve per caricare il mazzo nell'app
        };
        buttonsDiv.appendChild(btnCarica);

        // Modifica
        const btnModifica = document.createElement('button');
        btnModifica.textContent = 'Modifica';
        btnModifica.onclick = () => {
        location.href = `modifica_mazzo.html?mazzo=${encodeURIComponent(nomeMazzo)}`;
        };
        buttonsDiv.appendChild(btnModifica);

        // Elimina
        const btnElimina = document.createElement('button');
        btnElimina.textContent = 'Elimina';
        btnElimina.onclick = () => {
        if (confirm(`Eliminare il mazzo "${nomeMazzo}"?`)) {
            localStorage.removeItem(key);
            caricaMazzi();
        }
        };
        buttonsDiv.appendChild(btnElimina);

        divMazzo.appendChild(buttonsDiv);
        container.appendChild(divMazzo);
    });
});
}

// Aggiungi nuovo mazzo (prompt per nome, crea vuoto)
document.getElementById('aggiungiMazzoBtn').onclick = () => {
let nome = prompt('Inserisci il nome del nuovo mazzo:');
if (!nome) return;
nome = nome.trim();
if (nome === '') {
    alert('Nome mazzo non valido');
    return;
}
const key = 'mazzo_' + nome;
if (localStorage.getItem(key)) {
    alert('Un mazzo con questo nome esiste già');
    return;
}
localStorage.setItem(key, JSON.stringify({}));
caricaMazzi();
};

// Carica mazzi a pagina pronta
window.onload = caricaMazzi;
