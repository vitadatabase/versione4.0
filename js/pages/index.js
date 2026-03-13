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