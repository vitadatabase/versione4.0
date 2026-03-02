// home

// index
let tutteLeCarte = [], cartaAttiva = null, mazzo = {};

document.getElementById('toggleSidebar').onclick = () =>
  document.getElementById('sidebar').classList.toggle('open');

document.getElementById('mazzoBtn').onclick = () => {
  aggiornaMazzo();
  document.getElementById('mazzoPopup').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
};

document.getElementById('salvaMazzo').onclick = () => {
  const nome = document.getElementById('nomeMazzo').value.trim();
  if (!nome) return alert('Dai un nome al mazzo!');
  localStorage.setItem('mazzo_' + nome, JSON.stringify(mazzo));
  alert('Mazzo salvato come "' + nome + '"');
};

fetch('cards.json')
  .then(r => r.json())
  .then(data => { tutteLeCarte = data; mostraCarte(data); });

function filtraCarte() {
  const testo = document.getElementById('search').value.toLowerCase();
  const set = document.getElementById('filtroSet').value.toLowerCase();
  const pietra = document.getElementById('filtroPietra').value.toLowerCase();
  const rarita = document.getElementById('filtroRarita').value.toLowerCase();
  const classi = document.getElementById('filtroClassificazione').value.toLowerCase();
  const tipo = document.getElementById('filtroTipo').value.toLowerCase();
  const costo = document.getElementById('filtroCosto').value;
  const sortBy = document.getElementById('sortBy').value;

  let filtrate = tutteLeCarte.filter(c =>
    (!testo || (c["NOME CARTA"]||'').toLowerCase().includes(testo)) &&
    (!set || (c.SET||'').toLowerCase().includes(set)) &&
    (!pietra || (c.PIETRA||'').toLowerCase().includes(pietra)) &&
    (!rarita || (c["RARITA'"]||'').toLowerCase().includes(rarita)) &&
    (!classi || (c.CLASSIFICAZIONE||'').toLowerCase().includes(classi)) &&
    (!tipo || (c.TIPO||'').toLowerCase().includes(tipo)) &&
    (!costo || (c.COSTO+'') === costo)
  );

  if (sortBy) filtrate.sort((a,b) => {
    if (sortBy==='nome') return a["NOME CARTA"].localeCompare(b["NOME CARTA"]);
    if (sortBy==='costo') return (a.COSTO||0) - (b.COSTO||0);
    if (sortBy==='rarita') return (a["RARITA'"]||'').localeCompare(b["RARITA'"]);
  });

  mostraCarte(filtrate);
}

function mostraCarte(carte) {
  const c = document.getElementById('cards');
  c.innerHTML = '';
  carte.forEach(carta => {
    const div = document.createElement('div'); div.className='card-wrapper';
    const img = document.createElement('img');
    img.src = `img/${carta["N."]}.jpg`;
    img.alt = carta["NOME CARTA"];
    img.className = 'card-img';
    if ((carta["RARITA'"]||'').toUpperCase()==='PROMO') {
      img.style.boxShadow='0 0 15px 5px gold';
      img.style.border='2px solid gold';
    }
    img.onclick = () => apriPopup(carta);
    const btn = document.createElement('button');
    btn.textContent = '+';
    btn.onclick = () => aggiungiAlMazzo(carta["NOME CARTA"]);
    div.appendChild(img);
    div.appendChild(btn);
    c.appendChild(div);
  });
}

function aggiungiAlMazzo(nome) {
  const totale = Object.values(mazzo).reduce((a,b)=>a+b,0);
  if (totale>=60) return alert('Mazzo pieno!');
  const carta = tutteLeCarte.find(c=>c["NOME CARTA"]===nome);
  const max = (carta["RARITA'"].toUpperCase()==='PROMO') ? 1 : 4;
  if ((mazzo[nome]||0)>=max) return alert(`Max ${max} copie di questa carta!`);
  mazzo[nome] = (mazzo[nome]||0) +1;
  aggiornaMazzo();
  mostraMessaggio();
}

function aggiornaMazzo() {
  const ul = document.getElementById('mazzo');
  ul.innerHTML='';
  let tot=0;
  for(const n in mazzo) {
    tot+=mazzo[n];
    const li=document.createElement('li');
    li.textContent=`${n} x${mazzo[n]}`;
    const btn=document.createElement('button');
    btn.textContent='Rimuovi';
    btn.onclick= ()=>{mazzo[n]>1?mazzo[n]--:delete mazzo[n]; aggiornaMazzo();}
    li.appendChild(btn);
    ul.appendChild(li);
  }
  document.getElementById('contatoreCarte').textContent=`Totale carte: ${tot} / 60`;
}

function mostraMessaggio() {
  const m = document.getElementById('messaggioAggiunta');
  m.style.opacity='1'; setTimeout(()=>m.style.opacity='0',2000);
}

function apriPopup(carta) {
  cartaAttiva = carta;
  const cont = document.getElementById('popup-content');
  cont.innerHTML = `
    <img src="img/${carta["N."]}.jpg" alt="">
    <br>
    <button onclick="mostraDettagli()">📄 Dettagli testuali</button>
    <button onclick="aggiungiAlMazzo('${carta["NOME CARTA"]}')">➕ Aggiungi al mazzo</button>
  `;
  document.getElementById('popup').style.display='block';
  document.getElementById('overlay').style.display='block';
}

function mostraDettagli() {
  if (!cartaAttiva) return;
  const cont = document.getElementById('popup-content');
  const dettagli = Object.entries(cartaAttiva)
    .filter(([_, v]) => v)
    .map(([k, v]) => `<strong>${k}:</strong> ${v}`)
    .join('<br>');
  cont.innerHTML = `
    <div style="font-family: Georgia, serif; font-size: 16px; line-height: 1.5;">
      ${dettagli}
    </div>
    <br>
    <button onclick="apriPopup(cartaAttiva)">🖼️ Torna immagine</button>
    <button onclick="aggiungiAlMazzo('${cartaAttiva["NOME CARTA"]}')">➕ Aggiungi al mazzo</button>
  `;
}

function closePopup() {
  document.getElementById('popup').style.display='none';
  document.getElementById('overlay').style.display='none';
}

function closeMazzo() {
  document.getElementById('mazzoPopup').style.display='none';
  document.getElementById('overlay').style.display='none';
}
// mazzi
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


// modifica-mazzo

    const urlParams = new URLSearchParams(window.location.search);
    const nomeMazzo = urlParams.get('mazzo');
    document.getElementById('titolo').textContent = `Modifica mazzo: ${nomeMazzo}`;

    let cardsDatabase = [];
    let mazzo = JSON.parse(localStorage.getItem(`mazzo_${nomeMazzo}`)) || {};

    fetch('cards.json')
      .then(res => res.json())
      .then(data => {
        cardsDatabase = data;
        aggiornaFiltri();
        mostraCarte();
      });

    function aggiornaFiltri() {
      const pietraSet = new Set();
      const costoSet = new Set();

      for (const nome in mazzo) {
        const carta = cardsDatabase.find(c => c['NOME CARTA'] === nome);
        if (!carta) continue;
        pietraSet.add(carta['PIETRA']);
        costoSet.add(carta['COSTO']);
      }

      for (let p of [...pietraSet].sort()) {
        const op = document.createElement('option');
        op.value = p;
        op.textContent = p;
        document.getElementById('filtroPietra').appendChild(op);
      }

      for (let c of [...costoSet].sort((a,b)=>a-b)) {
        const op = document.createElement('option');
        op.value = c;
        op.textContent = c;
        document.getElementById('filtroCosto').appendChild(op);
      }
    }

    document.getElementById('filtroTipo').onchange = mostraCarte;
    document.getElementById('filtroPietra').onchange = mostraCarte;
    document.getElementById('filtroCosto').onchange = mostraCarte;

    function mostraCarte() {
      const tipo = document.getElementById('filtroTipo').value;
      const pietra = document.getElementById('filtroPietra').value;
      const costo = document.getElementById('filtroCosto').value;

      const container = document.getElementById('contenitoreCarte');
      container.innerHTML = '';

      let totaleCarte = 0;

      const carteOrdinate = Object.keys(mazzo)
        .map(nome => {
          const carta = cardsDatabase.find(c => c['NOME CARTA'] === nome);
          return carta ? { carta, nome } : null;
        })
        .filter(e => e !== null)
        .sort((a, b) => a.carta['COSTO'] - b.carta['COSTO']);

      for (const { carta, nome } of carteOrdinate) {
        if (tipo && carta['TIPO'] !== tipo) continue;
        if (pietra && carta['PIETRA'] !== pietra) continue;
        if (costo && carta['COSTO'].toString() !== costo) continue;

        const numero = carta['N.'];
        const quantita = mazzo[nome];
        totaleCarte += quantita;

        for (let i = 0; i < quantita; i++) {
          const img = document.createElement('img');
          img.src = `img/${numero}.jpg`;
          img.alt = nome;
          img.onclick = () => rimuoviCarta(nome);
          container.appendChild(img);
        }
      }

      document.getElementById('totaleCarte').textContent = `Carte totali: ${totaleCarte} / 60`;
    }

    function rimuoviCarta(nome) {
      if (mazzo[nome] > 1) {
        mazzo[nome]--;
      } else {
        delete mazzo[nome];
      }
      localStorage.setItem(`mazzo_${nomeMazzo}`, JSON.stringify(mazzo));
      mostraCarte();
    }

    function apriPopupAggiunta() {
      document.getElementById('overlay').style.display = 'block';
      document.getElementById('popup').style.display = 'block';
    }

    function chiudiPopup() {
      document.getElementById('overlay').style.display = 'none';
      document.getElementById('popup').style.display = 'none';
      document.getElementById('inputRicerca').value = '';
      document.getElementById('risultatiRicerca').innerHTML = '';
    }

    document.getElementById('inputRicerca').oninput = () => {
      const val = document.getElementById('inputRicerca').value.toLowerCase();
      const risultati = cardsDatabase.filter(c => c['NOME CARTA'].toLowerCase().includes(val));
      const div = document.getElementById('risultatiRicerca');
      div.innerHTML = '';
      risultati.forEach(carta => {
        const btn = document.createElement('button');
        btn.textContent = `${carta['NOME CARTA']} (${carta['COSTO']})`;
        btn.onclick = () => aggiungiCarta(carta['NOME CARTA']);
        div.appendChild(btn);
      });
    };

    function aggiungiCarta(nome) {
      const quantitaTotale = Object.values(mazzo).reduce((a, b) => a + b, 0);
      if (mazzo[nome] >= 4) {
        alert('Puoi avere al massimo 4 copie di una carta.');
        return;
      }
      if (quantitaTotale >= 60) {
        alert('Il mazzo ha già 60 carte.');
        return;
      }
      mazzo[nome] = (mazzo[nome] || 0) + 1;
      localStorage.setItem(`mazzo_${nomeMazzo}`, JSON.stringify(mazzo));
      mostraCarte();
    }

// nuova-partita

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

// punteggi

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