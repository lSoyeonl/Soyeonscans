const $=(q,p=document)=>p.querySelector(q);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

async function init(){
  const res=await fetch('data/manga.json');
  const data=await res.json();
  const id=new URLSearchParams(location.search).get('id');
  const m=data.find(x=>x.id===id) || data[0];
  const root=$('#manga-root');
  if(!m){ root.innerHTML='<div class="empty">Произведения пока не добавлены.</div>'; return; }

  document.title=`${m.title} — Soyeon Scans`;
  const tabs = data.map(x=>`<a class="project-tab ${x.id===m.id?'active':''}" href="manga.html?id=${encodeURIComponent(x.id)}">${esc(x.title)}</a>`).join('');
  const chapterRows = m.chapters?.length ? m.chapters.map(ch=>`
    <div class="chapter-row">
      <strong>Глава ${esc(ch.number)}</strong>
      <span class="chapter-date">${esc(ch.date)}</span>
      <div class="chapter-links">${(ch.links||[]).map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.name)}</a>`).join('')}</div>
    </div>`).join('') : '<div class="empty chapters-empty">Главы пока не добавлены.</div>';

  root.innerHTML=`
    <a class="back" href="index.html">← На главную</a>
    <nav class="project-tabs" aria-label="Проекты Soyeon Scans">${tabs}</nav>
    <section class="manga-head">
      <img src="${esc(m.cover)}" alt="${esc(m.title)}">
      <div>
        <div class="eyebrow">Soyeon Scans</div>
        <h1>${esc(m.title)}</h1>
        ${m.originalTitle ? `<div class="original">${esc(m.originalTitle)}</div>` : ''}
        <div class="tags">${(m.genre||[]).map(g=>`<span class="tag">${esc(g)}</span>`).join('')}</div>
        <p class="desc">${esc(m.description)}</p>
        <div class="facts"><span>Статус: ${esc(m.status)}</span></div>
      </div>
    </section>
    <section class="chapter-section"><h2>Главы</h2>${chapterRows}</section>`;
}
init();
