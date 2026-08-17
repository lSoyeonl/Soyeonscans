const $=(q,p=document)=>p.querySelector(q);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const safeUrl=u=>{
  const value=String(u??'').trim();
  if(!value) return '#';
  try{
    const url=new URL(value, location.href);
    return ['http:','https:'].includes(url.protocol) ? esc(value) : '#';
  }catch{return '#';}
};

async function loadData(){
  const params=new URLSearchParams(location.search);
  if(params.get('preview')==='1'){
    try{
      const draft=JSON.parse(localStorage.getItem('soyeonScansMangaDraftV1')||'null');
      if(Array.isArray(draft) && draft.length) return draft;
    }catch{}
  }
  const res=await fetch('data/manga.json?v=1.2.0',{cache:'no-store'});
  return await res.json();
}

function statusClass(status=''){
  const s=String(status).toLowerCase();
  if(s.includes('продолж')) return 'ongoing';
  if(s.includes('перерыв')) return 'hiatus';
  if(s.includes('заверш')) return 'completed';
  return 'unknown';
}

function chapterRow(ch, index){
  const number=ch.number ?? (index+1);
  const links=Array.isArray(ch.links)?ch.links:[];
  const linkHtml=links.length ? links.map(l=>{
    const href=safeUrl(l.url);
    return `<div class="reader-link">
      <a href="${href}" target="_blank" rel="noopener noreferrer">${esc(l.name||'Читать')}</a>
      ${l.note?`<span class="reader-note">${esc(l.note)}</span>`:''}
    </div>`;
  }).join('') : '<span class="no-reader">Ссылки на читалки пока не добавлены.</span>';
  return `<article class="chapter-row">
    <div class="chapter-number"><span>Глава</span><strong>${esc(number)}</strong></div>
    <div class="chapter-info">
      ${ch.title?`<strong class="chapter-title">${esc(ch.title)}</strong>`:''}
      ${ch.date?`<span class="chapter-date">${esc(ch.date)}</span>`:''}
    </div>
    <div class="chapter-links">${linkHtml}</div>
  </article>`;
}

async function init(){
  const data=await loadData();
  const id=new URLSearchParams(location.search).get('id');
  const m=data.find(x=>x.id===id) || data[0];
  const root=$('#manga-root');
  if(!m){ root.innerHTML='<div class="empty">Произведения пока не добавлены.</div>'; return; }

  document.title=`${m.title} — Soyeon Scans`;
  const tabs=data.map(x=>`<a class="project-tab ${x.id===m.id?'active':''}" href="manga.html?id=${encodeURIComponent(x.id)}">${esc(x.title)}</a>`).join('');
  const chapters=Array.isArray(m.chapters)?m.chapters:[];
  const chapterRows=chapters.length ? chapters.map(chapterRow).join('') : '<div class="empty chapters-empty">Главы пока не добавлены.</div>';
  const status=m.status||'Не указан';

  root.innerHTML=`
    <div class="manga-topline">
      <a class="back" href="index.html">← На главную</a>
      <span class="project-count">Проектов: ${data.length}</span>
    </div>
    <nav class="project-tabs" aria-label="Проекты Soyeon Scans">${tabs}</nav>

    <section class="manga-profile">
      <aside class="manga-sidebar">
        <img class="manga-cover" src="${esc(m.cover)}" alt="${esc(m.title)}">
        <div class="info-card">
          <div class="info-row"><span>Автор</span><strong>${esc(m.author||'Не указан')}</strong></div>
          <div class="info-row"><span>Статус проекта</span><strong class="project-status ${statusClass(status)}">${esc(status)}</strong></div>
          ${m.originalTitle?`<div class="info-row"><span>Оригинальное название</span><strong>${esc(m.originalTitle)}</strong></div>`:''}
          <div class="info-row"><span>Перевод</span><strong>Soyeon Scans</strong></div>
        </div>
      </aside>

      <div class="manga-content">
        <div class="eyebrow">Soyeon Scans</div>
        <h1>${esc(m.title)}</h1>
        <div class="tags">${(m.genre||[]).map(g=>`<span class="tag">${esc(g)}</span>`).join('')}</div>
        <section class="description-card">
          <h2>Описание</h2>
          <p class="desc">${esc(m.description||'Описание проекта пока не добавлено.')}</p>
        </section>
      </div>
    </section>

    <section class="chapter-section" id="releases">
      <div class="chapter-heading">
        <div><span class="eyebrow">Релизы</span><h2>Главы</h2></div>
        <span class="chapter-total">Всего: ${chapters.length}</span>
      </div>
      <div class="chapter-list">${chapterRows}</div>
    </section>`;
}
init();
