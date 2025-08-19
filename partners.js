// v24 – 파트너 클릭 시 '센터 스테이지'에 고정 표시
const stage = document.getElementById('provider-stage');

function makeStageCard(brand, title, imgSrc){
  const wrap = document.createElement('div');
  wrap.className = `stage-card theme-${brand}`;

  wrap.innerHTML = `
    <div class="logo-wrap">
      <img src="${imgSrc}" alt="${title} 로고">
    </div>
    <div class="meta">
      <h3 class="title">${title}</h3>
      <p class="desc">고퀄리티 ${title} 연동. 화이트 기반의 투톤/쓰리톤 UI 가이드와 빠른 PoC 제공.</p>
      <div class="cta">
        <a class="outline" href="#partners">상세보기</a>
        <button type="button">견적/일정 문의</button>
      </div>
    </div>
  `;
  requestAnimationFrame(()=> wrap.classList.add('active'));
  return wrap;
}

document.querySelectorAll('.provider-card').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const brand = btn.dataset.brand;
    const title = btn.dataset.title || btn.querySelector('span')?.textContent?.trim() || 'Provider';
    const img = btn.querySelector('img')?.getAttribute('src') || '';

    // 스테이지 초기화 후 새 카드 삽입
    stage.classList.remove('empty');
    stage.innerHTML = '';
    // 스테이지 자체의 테마도 카드와 동기화
    stage.className = `provider-stage theme-${brand}`;

    const card = makeStageCard(brand, title, img);
    stage.appendChild(card);

    // 페이지 전체 스크롤은 유지. 헤더는 sticky로 항상 노출.
    // 스테이지가 뷰포트 밖이라면 부드럽게 중앙 근처로 스크롤
    const rect = stage.getBoundingClientRect();
    if(rect.top < 80 || rect.bottom > window.innerHeight){
      stage.scrollIntoView({behavior:'smooth', block:'center'});
    }
  }, {passive:true});
});

// 키보드 접근성: 엔터/스페이스 활성화
document.addEventListener('keydown', (ev)=>{
  if(ev.key === 'Enter' || ev.key === ' '){
    const el = document.activeElement;
    if(el && el.classList.contains('provider-card')){
      el.click();
      ev.preventDefault();
    }
  }
});
