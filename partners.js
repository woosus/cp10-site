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

// 렌더 (수동 스크롤)
partnersData.forEach((p, idx)=>{
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('role','button');
  card.setAttribute('tabindex','0');
  card.dataset.index = idx;

  const img = document.createElement('img');
  img.alt = p.name;
  // 올바른 경로: assets/partners/… (기존 자산과 일치)
  img.src = `./assets/partners/${p.slug}.png`;
  img.onerror = ()=>{ img.src = makePlaceholder(p.name); };

  const cap = document.createElement('div');
  cap.className = 'cap';
  cap.textContent = p.name;

  card.appendChild(img);
  card.appendChild(cap);
  rail.appendChild(card);

  card.addEventListener('click', ()=>selectCard(card, p));
  card.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); selectCard(card, p); }});
});

// 수동 이동(자동 없음)
function cardWidth(){ const c=rail.querySelector('.card'); return c? c.getBoundingClientRect().width+18:360; }
prevBtn.onclick = ()=> rail.scrollBy({left: -cardWidth()*3, behavior:'smooth'});
nextBtn.onclick = ()=> rail.scrollBy({left:  cardWidth()*3, behavior:'smooth'});
rail.addEventListener('wheel', (e)=>{ // 휠로 좌우
  const dx = Math.sign(e.deltaY || e.deltaX) * cardWidth() * 1.2;
  rail.scrollBy({ left: dx, behavior:'smooth' });
}, {passive:true});

// 선택 애니메이션 (FLIP)
function selectCard(card, p){
  // 다른 카드들 가라앉기
  rail.querySelectorAll('.card').forEach(el => { if(el!==card) el.classList.add('sink'); });

  // 유령(ghost) 생성
  const r = card.getBoundingClientRect();
  const ghost = card.cloneNode(true);
  ghost.classList.add('ghost');
  ghost.style.left = r.left + 'px';
  ghost.style.top = r.top + 'px';
  ghost.style.width = r.width + 'px';
  ghost.style.height = r.height + 'px';
  document.body.appendChild(ghost);

  // 원본은 숨김
  card.style.visibility = 'hidden';

  // 타겟 좌표(무대 중앙 상단에 80% 크기로, 살짝 떠 있게)
  const platform = document.querySelector('.platform');
  const pr = platform.getBoundingClientRect();
  const targetW = r.width * 0.8;
  const targetH = r.height * 0.8;
  const targetLeft = window.innerWidth/2 - targetW/2;
  const targetTop  = pr.top - targetH*0.35; // 무대 위로 살짝 띄움

  const dx = targetLeft - r.left;
  const dy = targetTop  - r.top;

  ghost.style.transition = `transform var(--dur-main) var(--easing), opacity var(--dur-main) var(--easing)`;
  requestAnimationFrame(()=>{
    ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.8)`;
  });

  // 메인 모션이 어느 정도 진행되면 둥실둥실
  setTimeout(()=>{ ghost.classList.add('float'); }, 1800);

  // 설명 패널 등장
  setTimeout(()=>{
    infoName.textContent = p.name;
    infoDesc.textContent = p.desc || '';
    infoLogo.src = `./assets/partners/${p.slug}.png`;
    infoLogo.alt = p.name;
    panel.classList.add('show');
  }, 1600);

  // 바깥 클릭/ESC로 초기화
  const cleanup = (restore=true)=>{
    document.removeEventListener('keydown', onEsc);
    document.removeEventListener('click', onOutside, true);
    panel.classList.remove('show');
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
