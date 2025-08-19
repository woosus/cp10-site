// ===== 데이터 (1,2 고정 + 나머지) =====
const partnersData = [
  { name:'Evolution', slug:'evolution', desc:'라이브 카지노 분야 글로벌 표준 리더' },
  { name:'Pragmatic Play', slug:'pragmatic-play', desc:'슬롯/라이브 딜러/빙고까지 멀티 콘텐츠' },
];
for(let i=3;i<=28;i++){
  const id = String(i).padStart(2,'0');
  partnersData.push({ name:`Provider ${id}`, slug:`provider-${id}`, desc:`Provider ${id} 소개 문구` });
}

// ===== 엘리먼트 =====
const rail = document.getElementById('rail');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const panel = document.getElementById('infoPanel');
const infoName = document.getElementById('infoName');
const infoDesc = document.getElementById('infoDesc');
const infoLogo = document.getElementById('infoLogo');
const stage = document.getElementById('stage');

// 렌더 (수동 스크롤, 스크롤바 숨김)
partnersData.forEach((p, idx)=>{
  const card = document.createElement('div');
  card.className = 'card'; card.setAttribute('role','button'); card.setAttribute('tabindex','0'); card.dataset.index = idx;
  const img = document.createElement('img'); img.alt = p.name;
  img.src = `./assets/partners/${p.slug}.png`; img.onerror = ()=>{ img.src = makePlaceholder(p.name); };
  const cap = document.createElement('div'); cap.className = 'cap'; cap.textContent = p.name;
  card.appendChild(img); card.appendChild(cap); rail.appendChild(card);
  card.addEventListener('click', ()=>selectCard(card, p));
  card.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); selectCard(card, p); }});
});

// 수동 이동
function cardWidth(){ const c=rail.querySelector('.card'); return c? c.getBoundingClientRect().width+18:360; }
prevBtn.onclick = ()=> rail.scrollBy({left: -cardWidth()*2, behavior:'smooth'});
nextBtn.onclick = ()=> rail.scrollBy({left:  cardWidth()*2, behavior:'smooth'});

// ===== 바람에 흔들리는 듯한 초슬로우 드리프트(상호작용 시 일시정지) =====
let driftId=null, driftStart=null, pausedUntil=0;
function startDrift(){
  if(driftId) cancelAnimationFrame(driftId);
  driftStart = performance.now();
  const base = rail.scrollLeft;
  const amplitude = Math.max(40, Math.min(120, rail.scrollWidth - rail.clientWidth)); // px
  const period = 38000; // 38초 주기
  function frame(t){
    if(t < pausedUntil){ driftId = requestAnimationFrame(frame); return; }
    const dt = (t - driftStart) % period;
    const phase = dt / period * Math.PI * 2;
    rail.scrollLeft = base + Math.sin(phase) * amplitude * 0.25; // 매우 작게
    driftId = requestAnimationFrame(frame);
  }
  driftId = requestAnimationFrame(frame);
}
function pauseDrift(ms=5000){ pausedUntil = performance.now() + ms; }
['wheel','touchstart','pointerdown','keydown'].forEach(ev=>{
  rail.addEventListener(ev, ()=>pauseDrift(6000), {passive:true});
  prevBtn.addEventListener(ev, ()=>pauseDrift(6000), {passive:true});
  nextBtn.addEventListener(ev, ()=>pauseDrift(6000), {passive:true});
});
startDrift();

// ===== 선택 애니메이션 (무대 상승 + 라이트업 + FLIP) =====
function selectCard(card, p){
  // 드리프트는 일시 정지
  pauseDrift(12000);

  // 다른 카드들 가라앉기
  rail.querySelectorAll('.card').forEach(el => { if(el!==card) el.classList.add('sink'); });

  // 무대 라이트업 & 살짝 상승
  stage.classList.add('active');

  // 유령(ghost) 생성
  const r = card.getBoundingClientRect();
  const ghost = card.cloneNode(true);
  ghost.classList.add('ghost');
  ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px';
  ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px';
  document.body.appendChild(ghost);

  // 원본은 숨김
  card.style.visibility = 'hidden';

  // 타겟 좌표(무대 중앙 상단에 80% 크기 + 둥실)
  const platform = document.querySelector('.platform');
  const pr = platform.getBoundingClientRect();
  const targetW = r.width * 0.8, targetH = r.height * 0.8;
  const targetLeft = window.innerWidth/2 - targetW/2;
  const targetTop  = pr.top - targetH*0.35;
  const dx = targetLeft - r.left, dy = targetTop - r.top;

  ghost.style.transition = `transform var(--dur-main) var(--easing), opacity var(--dur-main) var(--easing)`;
  requestAnimationFrame(()=>{ ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.8)`; });

  // 둥실둥실 효과 시작
  setTimeout(()=>{ ghost.classList.add('float'); }, 1800);

  // 설명 패널(네온 그린 3D) 표시
  setTimeout(()=>{
    infoName.textContent = p.name;
    infoDesc.textContent = p.desc || '';
    infoLogo.src = `./assets/partners/${p.slug}.png`; infoLogo.alt = p.name;
    panel.classList.add('show');
  }, 1600);

  // 바깥 클릭/ESC → 초기화
  const cleanup = (restore=true)=>{
    document.removeEventListener('keydown', onEsc);
    document.removeEventListener('click', onOutside, true);
    panel.classList.remove('show'); stage.classList.remove('active');
    if(restore){
      rail.querySelectorAll('.card').forEach(el => { el.classList.remove('sink'); el.style.visibility=''; });
    }
    ghost.remove();
  };
  function onEsc(e){ if(e.key==='Escape'){ cleanup(true); } }
  function onOutside(e){
    const isGhost = ghost.contains(e.target);
    const isPanel = panel.contains(e.target);
    const isCard  = rail.contains(e.target);
    if(!isGhost && !isPanel && !isCard){ cleanup(true); }
  }
  document.addEventListener('keydown', onEsc);
  document.addEventListener('click', onOutside, true);
}

function makePlaceholder(name){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'>
    <rect width='100%' height='100%' fill='white'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
      font-family='Arial' font-size='36' fill='black'>${name}</text></svg>`;
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
}
