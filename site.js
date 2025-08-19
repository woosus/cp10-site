const TELEGRAM = 'cp10_support'; // TODO: 실제 핸들로 교체
document.addEventListener('DOMContentLoaded', ()=>{
  const f=document.getElementById('qform');
  if(!f) return;
  f.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd=new FormData(f);
    const fields=[
      ['비즈니스 모델', fd.getAll('model').join(', ')],
      ['런칭 일정', fd.get('launch')||''],
      ['대상 지역', fd.get('markets')||''],
      ['결제 통화', fd.getAll('curr').join(', ')],
      ['KYC/리스크', fd.get('kyc')||''],
      ['상품군', fd.getAll('prod').join(', ')],
      ['White/Turnkey', fd.get('wl')||''],
      ['예상 월 GGR', fd.get('ggr')||''],
      ['팀 규모', fd.get('team')||''],
      ['연락처', fd.get('contact')||''],
    ];
    const msg=fields.map(([k,v])=>`${k}: ${v}`).join('\n');
    const url=`https://t.me/${TELEGRAM}?start=${encodeURIComponent(msg.slice(0,1000))}`; // 1k 제한 안전
    window.open(url, '_blank');
  });
});
