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

let current = null;   // { card, ghost, fromRect }
let lock = false;     // 애니메이션 중 외부 입력 차단

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
prevBtn.onclick = ()=> { pauseDrift(6000); rail.scrollBy({left: -cardWidth()*2, behavior:'smooth'}); };
nextBtn.onclick = ()=> { pauseDrift(6000); rail.scrollBy({left:  cardWidth()*2, behavior:'smooth'}); };

// ===== 초슬로우 드리프트 =====
let driftId=null, driftStart=null, pausedUntil=0;
function startDrift(){
  if(driftId) cancelAnimationFrame(driftId);
  driftStart = performance.now();
  const base = rail.scrollLeft;
  const amplitude = Math.max(40, Math.min(120, rail.scrollWidth - rail.clientWidth));
  const period = 42000; // 42초
  function frame(t){
    if(t < pausedUntil || current){ driftId = requestAnimationFrame(frame); return; }
    const dt = (t - driftStart) % period;
    const phase = dt / period * Math.PI * 2;
    rail.scrollLeft = base + Math.sin(phase) * amplitude * 0.25;
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
  if(lock) return;
  lock = true;
  // 드리프트 잠시 정지
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

  // 이동
  ghost.style.transition = `transform var(--dur-main) var(--easing), opacity var(--dur-main) var(--easing)`;
  requestAnimationFrame(()=>{ ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.8)`; });

  // 둥실둥실 효과 시작 (도중 클릭으로 취소되는 걸 막기 위해 애니 끝난 뒤에 활성화)
  setTimeout(()=>{ ghost.classList.add('float'); }, 2000);

  // 패널 표시 + 텍스트 flicker 준비
  setTimeout(()=>{
    infoName.textContent = p.name;
    infoDesc.textContent = p.desc || '';
    infoLogo.src = `./assets/partners/${p.slug}.png`; infoLogo.alt = p.name;
    prepareFlicker(infoName); prepareFlicker(infoDesc);
    panel.classList.add('show');
  }, 200); // 패널은 같은 주기로 같이 올라오되, 보여짐은 천천히 (CSS duration으로 동기화)

  // 애니 종료 후 잠금 해제 & 현재 선택 기억
  setTimeout(()=>{ lock = false; current = { card, ghost, fromRect: r }; }, 4900);

  // 무대의 유령(선택된 이미지)을 클릭하면 원위치로
  ghost.addEventListener('click', ()=>{ if(lock) return; deselect(true); });
  // ESC도 원위치
  document.addEventListener('keydown', onEsc);
  function onEsc(e){ if(e.key==='Escape'){ deselect(true); } }
}

// 원위치 복귀
function deselect(userAction=false){
  if(!current || lock) return;
  lock = true;
  const { card, ghost, fromRect } = current;

  // 패널 내리기, 무대 라이트다운
  panel.classList.remove('show');
  stage.classList.remove('active');

  // 유령을 원래 자리로 되돌리는 FLIP
  const gr = ghost.getBoundingClientRect();
  const dx = fromRect.left - gr.left;
  const dy = fromRect.top  - gr.top;
  ghost.classList.remove('float');
  ghost.style.transition = `transform var(--dur-main) var(--easing)`;
  requestAnimationFrame(()=>{ ghost.style.transform = `translate(${dx}px, ${dy}px) scale(1)`; });

  // 애니 종료 후 정리
  setTimeout(()=>{
    rail.querySelectorAll('.card').forEach(el => { el.classList.remove('sink'); });
    card.style.visibility = '';
    ghost.remove();
    lock = false; current = null;
    pauseDrift(4000);
  }, 4900);
}

// 텍스트를 글자 단위로 쪼개고, 각 글자에 랜덤 딜레이 flicker 애니 부여
function prepareFlicker(el){
  const text = el.textContent;
  el.textContent = '';
  const wrap = document.createElement('span');
  wrap.className = 'flicker';
  for(const ch of text){
    const s = document.createElement('span');
    s.textContent = ch;
    s.style.setProperty('--delay', (Math.random()*1.2).toFixed(2)+'s');
    wrap.appendChild(s);
  }
  el.appendChild(wrap);
}

function makePlaceholder(name){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'>
    <rect width='100%' height='100%' fill='white'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
      font-family='Arial' font-size='36' fill='black'>${name}</text></svg>`;
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
}
