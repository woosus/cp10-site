// Data
const partnersData = [
  { name:'Evolution', slug:'evolution', desc:'라이브 카지노 분야 글로벌 표준 리더' },
  { name:'Pragmatic Play', slug:'pragmatic-play', desc:'슬롯/라이브 딜러/빙고까지 멀티 콘텐츠' },
];
for(let i=3;i<=28;i++){ const id=String(i).padStart(2,'0'); partnersData.push({ name:`Provider ${id}`, slug:`provider-${id}`, desc:`Provider ${id} 소개 문구` }); }

// Elements
const rail=document.getElementById('rail'), prevBtn=document.getElementById('prevBtn'), nextBtn=document.getElementById('nextBtn');
const panel=document.getElementById('infoPanel'), infoName=document.getElementById('infoName'), infoDesc=document.getElementById('infoDesc'), infoLogo=document.getElementById('infoLogo');
const stage=document.getElementById('stage');

let current=null, lock=false;

// Render
partnersData.forEach((p,idx)=>{
  const card=document.createElement('div'); card.className='card'; card.setAttribute('role','button'); card.tabIndex=0; card.dataset.index=idx;
  const img=document.createElement('img'); img.alt=p.name; img.src=`./assets/partners/${p.slug}.png`; img.onerror=()=>{ img.src=ph(p.name); };
  const cap=document.createElement('div'); cap.className='cap'; cap.textContent=p.name;
  card.appendChild(img); card.appendChild(cap); rail.appendChild(card);
  card.addEventListener('click', ()=>selectCard(card,p));
  card.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); selectCard(card,p); } });
});

function cw(){ const c=rail.querySelector('.card'); return c? c.getBoundingClientRect().width+18:360; }
prevBtn.onclick=()=> rail.scrollBy({left:-cw()*2,behavior:'smooth'});
nextBtn.onclick=()=> rail.scrollBy({left: cw()*2,behavior:'smooth'});

// Gentle drift
let driftId=null, driftStart=null, pausedUntil=0;
function startDrift(){ if(driftId) cancelAnimationFrame(driftId); driftStart=performance.now(); const base=rail.scrollLeft; const amp=Math.max(40,Math.min(120,rail.scrollWidth-rail.clientWidth)); const period=42000;
  function frame(t){ if(t<pausedUntil||current){ driftId=requestAnimationFrame(frame); return; } const dt=(t-driftStart)%period; const phase=dt/period*Math.PI*2; rail.scrollLeft=base+Math.sin(phase)*amp*.25; driftId=requestAnimationFrame(frame); }
  driftId=requestAnimationFrame(frame);
}
function pauseDrift(ms=5000){ pausedUntil=performance.now()+ms; }
['wheel','touchstart','pointerdown','keydown'].forEach(ev=>{ rail.addEventListener(ev,()=>pauseDrift(6000),{passive:true}); prevBtn.addEventListener(ev,()=>pauseDrift(6000),{passive:true}); nextBtn.addEventListener(ev,()=>pauseDrift(6000),{passive:true}); });
startDrift();

function selectCard(card,p){
  if(lock) return; lock=true; pauseDrift(12000);
  rail.querySelectorAll('.card').forEach(el=>{ if(el!==card) el.classList.add('sink'); });
  stage.classList.add('active');

  // Ghost wrapper + inner (float only on inner)
  const r=card.getBoundingClientRect();
  const ghost=document.createElement('div'); ghost.className='ghost'; ghost.style.left=r.left+'px'; ghost.style.top=r.top+'px'; ghost.style.width=r.width+'px'; ghost.style.height=r.height+'px';
  const inner=card.cloneNode(true); inner.className='ghost-inner'; ghost.appendChild(inner); document.body.appendChild(ghost);
  card.style.visibility='hidden';

  // Target coords (after stage active)
  const pr=document.querySelector('.platform').getBoundingClientRect();
  const targetW=r.width*.8, targetH=r.height*.8;
  const targetLeft=window.innerWidth/2 - targetW/2;
  const targetTop =pr.top - targetH*.35;
  const dx=targetLeft - r.left, dy=targetTop - r.top;

  ghost.style.transition=`transform var(--dur-main) var(--easing), opacity var(--dur-main) var(--easing)`;
  requestAnimationFrame(()=>{ ghost.style.transform=`translate(${dx}px,${dy}px) scale(.8)`; });

  // Float only on inner so outer transform remains
  setTimeout(()=>{ inner.classList.add('float'); }, 2000);

  // Panel (sync duration)
  setTimeout(()=>{
    infoName.textContent=p.name; infoDesc.textContent=p.desc||''; infoLogo.src=`./assets/partners/${p.slug}.png`; infoLogo.alt=p.name;
    prepFlicker(infoName); prepFlicker(infoDesc);
    panel.classList.add('show');
  }, 200);

  setTimeout(()=>{ lock=false; current={card,ghost,fromRect:r}; }, 4900);

  ghost.addEventListener('click', ()=>{ if(lock) return; deselect(); });
  document.addEventListener('keydown', onEsc);
  function onEsc(e){ if(e.key==='Escape'){ deselect(); } }
}

function deselect(){
  if(!current||lock) return; lock=true;
  const {card,ghost,fromRect}=current; panel.classList.remove('show'); stage.classList.remove('active');
  const gr=ghost.getBoundingClientRect(); const dx=fromRect.left-gr.left, dy=fromRect.top-gr.top;
  const inner=ghost.querySelector('.ghost-inner'); if(inner) inner.classList.remove('float');
  ghost.style.transition=`transform var(--dur-main) var(--easing)`;
  requestAnimationFrame(()=>{ ghost.style.transform=`translate(${dx}px,${dy}px) scale(1)`; });
  setTimeout(()=>{ rail.querySelectorAll('.card').forEach(el=>el.classList.remove('sink')); card.style.visibility=''; ghost.remove(); lock=false; current=null; pauseDrift(4000); }, 4900);
}

function prepFlicker(el){
  const t=el.textContent; el.textContent=''; const wrap=document.createElement('span'); wrap.className='flicker';
  for(const ch of t){ const s=document.createElement('span'); s.textContent=ch; s.style.setProperty('--delay',(Math.random()*1.2).toFixed(2)+'s'); wrap.appendChild(s); }
  el.appendChild(wrap);
}

function ph(name){ const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'><rect width='100%' height='100%' fill='white'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36' fill='black'>${name}</text></svg>`; return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg); }
