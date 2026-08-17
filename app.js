const $ = (q, p=document) => p.querySelector(q);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

async function loadManga(){
  const res = await fetch('data/manga.json?v=1.2.0',{cache:'no-store'});
  return await res.json();
}

function homeCard(m){
  const chapter = m.latestChapter && m.latestChapter !== '—' ? `Глава ${esc(m.latestChapter)}` : 'Открыть страницу';
  return `
    <a class="card" href="manga.html?id=${encodeURIComponent(m.id)}">
      <div class="cover-wrap">
        <img src="${esc(m.cover)}" alt="${esc(m.title)}">
        <span class="badge">${esc(m.genre?.[0] || 'Маньхуа')}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${esc(m.title)}</h3>
        <div class="card-meta">Soyeon Scans</div>
        <div class="card-chapter">${chapter}</div>
      </div>
    </a>`;
}

async function renderHome(){
  const grid = $('#manga-grid');
  if(!grid) return;
  const data = await loadManga();
  const search = $('#search');
  const draw = items => {
    grid.innerHTML = items.length ? items.map(homeCard).join('') : '<div class="empty">Ничего не найдено.</div>';
  };
  draw(data);
  search?.addEventListener('input', e=>{
    const q = e.target.value.trim().toLowerCase();
    draw(data.filter(m => (m.title+' '+(m.originalTitle||'')+' '+(m.genre||[]).join(' ')).toLowerCase().includes(q)));
  });
}

function spawnPetal(container){
  if(!container) return;
  const petal = document.createElement('div');
  petal.className = 'petal';
  const left = Math.random() * 100;
  const size = 16 + Math.random() * 18;
  const duration = 10 + Math.random() * 10;
  const delay = Math.random() * 2;
  const drift = -120 + Math.random() * 240;
  petal.style.left = `${left}vw`;
  petal.style.width = `${size}px`;
  petal.style.height = `${size}px`;
  petal.style.setProperty('--drift', `${drift}px`);
  petal.style.animationDuration = `${duration}s, ${2.4 + Math.random() * 2.4}s`;
  petal.style.animationDelay = `${delay}s, 0s`;
  petal.style.opacity = String(0.65 + Math.random() * 0.3);
  petal.addEventListener('click', () => { petal.classList.add('vanish'); setTimeout(() => petal.remove(), 540); setTimeout(() => spawnPetal(container), 120); });
  petal.addEventListener('animationend', e => { if(e.animationName === 'petal-fall'){ petal.remove(); spawnPetal(container); } });
  container.appendChild(petal);
}
function initPetals(){
  const layer = $('#petal-layer');
  if(!layer) return;
  const amount = window.innerWidth < 900 ? 10 : 18;
  for(let i=0;i<amount;i++) setTimeout(() => spawnPetal(layer), i * 260);
}
renderHome();
initPetals();
