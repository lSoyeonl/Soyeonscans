const $=(q,p=document)=>p.querySelector(q);
const $$=(q,p=document)=>[...p.querySelectorAll(q)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
let data=[];
let active=0;

async function load(){
  data=await window.SoyeonContent.loadCatalog();
  if(!Array.isArray(data)) data=[];
}
const slug=s=>String(s||'project').toLowerCase().trim().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/gi,'-').replace(/^-+|-+$/g,'');
function blankProject(){return {id:`project-${Date.now()}`,title:'Новый проект',originalTitle:'',author:'',genre:['Маньхуа'],status:'Продолжается',description:'',cover:'',updated:'',latestChapter:'',chapters:[]}}
function normalizeProject(m){m.genre=Array.isArray(m.genre)?m.genre:[];m.chapters=Array.isArray(m.chapters)?m.chapters:[];m.chapters.forEach(ch=>ch.links=Array.isArray(ch.links)?ch.links:[]);return m}

function drawList(){
  $('#projectList').innerHTML=data.map((m,i)=>`<button class="admin-project-item ${i===active?'active':''}" data-i="${i}"><strong>${esc(m.title||'Без названия')}</strong><span>${esc(m.status||'Статус не указан')}</span></button>`).join('');
  $$('.admin-project-item').forEach(b=>b.onclick=()=>{syncForm();active=Number(b.dataset.i);render();});
}
function editorHtml(m){
  return `<div class="admin-editor-head"><div><span class="eyebrow">Карточка проекта</span><h2>${esc(m.title||'Новый проект')}</h2></div><button id="deleteProject" class="admin-btn danger small">Удалить проект</button></div>
  <div class="form-grid">
    <label><span>Название</span><input data-field="title" value="${esc(m.title)}"></label>
    <label><span>ID / slug</span><input data-field="id" value="${esc(m.id)}"></label>
    <label><span>Оригинальное название</span><input data-field="originalTitle" value="${esc(m.originalTitle)}"></label>
    <label><span>Автор</span><input data-field="author" value="${esc(m.author)}" placeholder="Имя автора"></label>
    <label><span>Статус проекта</span><select data-field="status">
      <option value="Продолжается" ${m.status==='Продолжается'?'selected':''}>Продолжается</option>
      <option value="Перерыв" ${m.status==='Перерыв'?'selected':''}>Перерыв</option>
      <option value="Завершено" ${m.status==='Завершено'?'selected':''}>Завершено</option>
      <option value="Не указан" ${!['Продолжается','Перерыв','Завершено'].includes(m.status)?'selected':''}>Не указан</option>
    </select></label>
    <label><span>Жанры через запятую</span><input data-field="genreText" value="${esc((m.genre||[]).join(', '))}"></label>
    <label class="wide"><span>Путь к обложке</span><input data-field="cover" value="${esc(m.cover)}" placeholder="assets/covers/file.png"></label>
    <label class="wide"><span>Описание</span><textarea data-field="description" rows="7">${esc(m.description)}</textarea></label>
  </div>

  <div class="admin-section-head"><div><span class="eyebrow">Релизы</span><h3>Главы</h3></div><button id="addChapter" class="admin-btn small">+ Добавить главу</button></div>
  <div id="chapterEditor" class="chapter-editor">${(m.chapters||[]).map((ch,ci)=>chapterEditorHtml(ch,ci)).join('') || '<div class="admin-empty">Глав пока нет. Нажмите «+ Добавить главу».</div>'}</div>`;
}
function chapterEditorHtml(ch,ci){
  return `<article class="admin-chapter" data-ci="${ci}">
    <div class="admin-chapter-head"><strong>Глава ${esc(ch.number||ci+1)}</strong><button class="icon-danger delete-chapter" type="button">Удалить</button></div>
    <div class="form-grid three">
      <label><span>Номер</span><input data-ch-field="number" value="${esc(ch.number)}"></label>
      <label><span>Название главы</span><input data-ch-field="title" value="${esc(ch.title)}"></label>
      <label><span>Дата</span><input data-ch-field="date" value="${esc(ch.date)}" placeholder="17.08.2026"></label>
    </div>
    <div class="reader-editor-head"><strong>Дополнительные читалки</strong><button class="admin-btn small add-reader" type="button">+ Читалка</button></div>
    <div class="reader-editor">${(ch.links||[]).map((l,li)=>readerHtml(l,li)).join('') || '<div class="admin-empty mini">Ссылок пока нет.</div>'}</div>
  </article>`;
}
function readerHtml(l,li){return `<div class="reader-edit-row" data-li="${li}">
  <label><span>Название</span><input data-link-field="name" value="${esc(l.name)}" placeholder="MangaLib"></label>
  <label><span>Ссылка</span><input data-link-field="url" value="${esc(l.url)}" placeholder="https://..."></label>
  <label><span>Примечание</span><input data-link-field="note" value="${esc(l.note)}" placeholder="Например: зеркало / нужна регистрация"></label>
  <button class="icon-danger delete-reader" type="button">×</button>
</div>`}

function render(){
  if(!data.length){data=[blankProject()];active=0;}
  active=Math.min(active,data.length-1);
  drawList();
  const m=normalizeProject(data[active]);
  $('#editor').innerHTML=editorHtml(m);
  bindEditor();
}
function syncForm(){
  const ed=$('#editor'); if(!ed||!data[active]) return;
  const m=data[active];
  $$('[data-field]',ed).forEach(el=>{
    const f=el.dataset.field;
    if(f==='genreText') m.genre=el.value.split(',').map(s=>s.trim()).filter(Boolean);
    else m[f]=el.value;
  });
  $$('.admin-chapter',ed).forEach((box,ci)=>{
    const ch=m.chapters[ci]||(m.chapters[ci]={links:[]});
    $$('[data-ch-field]',box).forEach(el=>ch[el.dataset.chField]=el.value);
    ch.links=[];
    $$('.reader-edit-row',box).forEach(row=>{
      const link={};
      $$('[data-link-field]',row).forEach(el=>link[el.dataset.linkField]=el.value);
      ch.links.push(link);
    });
  });
  if(!m.id || m.id.startsWith('project-')) m.id=slug(m.title)||m.id;
}
function bindEditor(){
  $('#deleteProject').onclick=()=>{if(confirm('Удалить этот проект? Изменение вступит в силу после сохранения.')){data.splice(active,1);active=Math.max(0,active-1);render();}};
  $('#addChapter').onclick=()=>{syncForm();const m=data[active];m.chapters.push({number:String(m.chapters.length+1),title:'',date:'',links:[]});render();};
  $$('.delete-chapter').forEach(btn=>btn.onclick=()=>{syncForm();const ci=Number(btn.closest('.admin-chapter').dataset.ci);data[active].chapters.splice(ci,1);render();});
  $$('.add-reader').forEach(btn=>btn.onclick=()=>{syncForm();const ci=Number(btn.closest('.admin-chapter').dataset.ci);data[active].chapters[ci].links.push({name:'',url:'',note:''});render();});
  $$('.delete-reader').forEach(btn=>btn.onclick=()=>{syncForm();const box=btn.closest('.admin-chapter');const ci=Number(box.dataset.ci);const li=Number(btn.closest('.reader-edit-row').dataset.li);data[active].chapters[ci].links.splice(li,1);render();});
}
function state(message, type='ok'){
  const el=$('#saveState');
  el.textContent=message;
  el.className=`save-state ${type}`;
}
async function saveToSupabase(){
  syncForm();
  state('Сохраняем…');
  const btn=$('#saveToSupabase');
  btn.disabled=true;
  try{
    await window.SoyeonContent.saveCatalog(data);
    state('Сохранено. Изменения опубликованы.');
    drawList();
  }catch(err){
    console.error(err);
    state(err?.message||'Ошибка сохранения.','error');
  }finally{btn.disabled=false;}
}
async function reloadFromSupabase(){
  if(!confirm('Отменить несохранённые изменения и заново загрузить данные сайта?')) return;
  state('Загружаем…');
  try{await load();active=0;render();state('Данные загружены заново.');}
  catch(err){state(err?.message||'Ошибка загрузки.','error');}
}

async function boot(){
  const user=await window.SoyeonContent.requireAdmin({redirect:true});
  if(!user) return;
  $('#authChecking')?.remove();
  $('#adminMain').hidden=false;
  document.body.classList.add('auth-ready');
  $('#adminLogout').onclick=async()=>{await window.soyeonSupabase.auth.signOut();location.replace('index.html');};
  $('#addProject').onclick=()=>{syncForm();data.push(blankProject());active=data.length-1;render();};
  $('#saveToSupabase').onclick=saveToSupabase;
  $('#previewProject').onclick=()=>{syncForm();sessionStorage.setItem('soyeonScansPreviewV13',JSON.stringify(data));window.open(`manga.html?id=${encodeURIComponent(data[active].id)}&preview=1`,'_blank');};
  $('#reloadFromSupabase').onclick=reloadFromSupabase;
  try{await load();render();}
  catch(err){state(err?.message||'Не удалось загрузить данные.','error');}
}
boot();
