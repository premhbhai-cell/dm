// ===== Photos: images/<folder>/ mein apni photos daalo. Live Server / folder se kholne par auto-show (1.jpg, 2.jpg... ya kisi bhi naam se Live Server mein).
// Sabse aasan: start.bat (ya `node server.js`) chalao -> photo folder me daalo -> refresh. Nahi to: `node make-images-list.js --watch` chalao (ya update-images.bat double-click). VS Code me .vscode/tasks.json ye khud chala deta hai.
// Live site (hosting) ke liye bhi wahi. Folder khali ho to internet ki photos dikhti hain, aapki photos daalte hi wahi dikhengi.
// Baaki jagah folder khali ho to internet (Unsplash) ki photos dikhti hain.
const NAME={newborn:'Newborn',kids:'Baby & Kids',maternity:'Maternity',outdoor:'Outdoor',hero:'Studio',gallery:'Gallery'};
const NET={
 hero:['1756982477661-107a1c72c8fd','1538678867871-8a43e7487746','1649880210584-3365f4c4c08b','1527490272553-ba05e1f11ee9'],
 newborn:['1649880210584-3365f4c4c08b','1582486225644-aeacf6aa0b1b','1610901137736-d7cc46657b11','1583007054045-800d870b8249','1596252732610-fce5ac542f8e','1679919996303-1824ae520235','1591161555818-7b9debeccc07','1596034640116-a68045d257fe','1570657891791-e39a9d185540','1608039649006-df579ad70c64','1610901158532-d246c011729e','1619668001914-e53a048bf97a'],
 kids:['1524503033411-c9566986fc8f','1611708314849-8bb91fe0fa56','1620420678517-d45e226dfe6c','1534982841079-afde227ada8f','1527490272553-ba05e1f11ee9','1620420375091-f66a919dcbda','1509924603848-aca5e5f276d7','1503944583220-79d8926ad5e2','1620420522286-994c1e94d863','1597008683704-f14ade4e8a57','1504697140411-97eb65b90c16','1548102245-c79dbcfa9f92','1607453998825-f3f36da5ab18','1505377059067-e285a7bac49b'],
 maternity:['1538678867871-8a43e7487746','1457342813143-a1ae27448a82','1544784179-ae1535e9f013','1651663303138-4dc283e15992','1586102728466-46b99b3bc411','1493894473891-10fc1e5dbd22','1615766553246-9147b6d50e90','1680987218595-2d514938a72c','1568043625493-2b0633c7c491','1585010873004-923f9a54e54e','1710897869539-a48e3d69a8d7','1625238955965-2d1c8196e8b2','1541956799312-3f9df99e0006'],
 outdoor:['1756982477661-107a1c72c8fd','1597524678053-5e6fef52d8a3','1709216461598-018ae6307dc0','1756982784629-0f4c22a73000','1627007410492-f410bb5ae2d6','1511632765486-a01980e01a18','1641064496126-cf64a61c6fae','1647616927583-1d44a79a38a5','1596510914965-9ae08acae566','1689782243186-ac0da84bb1ff']};
const CATS=['newborn','kids','maternity','outdoor'],WA='917575867877',EXT=['jpg','jpeg','png','webp','JPG','JPEG','PNG','WEBP'],LIST={},SHOW=10;
const DEV=location.protocol=='file:'||/^(localhost|127\.|192\.168\.|10\.|\[::1\])/.test(location.hostname);
const nat=(a,b)=>a.localeCompare(b,undefined,{numeric:true});
// image sizes standardised -> same photo = same URL = browser cache hit (faster)
const bw=w=>w>=1200?1400:w>=800?900:w>=500?600:300;
const net=(c,i,w)=>{w=bw(+w||800);return `https://images.unsplash.com/photo-${NET[c][(i-1)%NET[c].length]}?auto=format&fit=crop&w=${w}&q=${w>1000?60:w>800?78:68}`};
const ok=u=>new Promise(r=>{const m=new Image();m.onload=()=>r(true);m.onerror=()=>r(false);m.src=u});
const lim=(p,ms,v)=>Promise.race([p,new Promise(r=>setTimeout(()=>r(v),ms))]);
// numbered files (1.jpg, 2.png ...) - ek hi baar check, har image ke liye nahi
async function probe(c){const out=[];let pref=EXT[0];
 for(let i=1;i<=40;i++){const u=e=>`images/${c}/${i}.${e}`;let hit=null;
  if(await ok(u(pref)))hit=pref;else{const r=await Promise.all(EXT.filter(e=>e!=pref).map(async e=>(await ok(u(e)))?e:null));hit=r.find(Boolean)||null}
  if(!hit)break;pref=hit;out.push(u(hit))}
 return out}
async function listFor(c){
 if(DEV)try{const r=await lim(fetch(`__list/${c}`),1500,null); // node server.js chal raha ho to folder se seedha list
  if(r&&r.ok&&(r.headers.get('content-type')||'').includes('json')){const a=await r.json();return a.map(f=>`images/${c}/${encodeURIComponent(f)}`)}}catch(e){}
 const F=(window.FILES||{})[c];if(F&&F.length)return F.map(f=>`images/${c}/${encodeURIComponent(f)}`);
 if(DEV)try{const r=await lim(fetch(`images/${c}/`),1500,null);if(r&&r.ok){const t=await r.text();
  const m=[...t.matchAll(/([^"'<>=\/\\]+?\.(?:jpe?g|png|webp|gif|avif))/gi)].map(x=>{try{return decodeURIComponent(x[1])}catch(e){return x[1]}});
  if(m.length)return [...new Set(m)].sort(nat).map(f=>`images/${c}/${encodeURIComponent(f)}`)}}catch(e){}
 return lim(probe(c),3000,[])}
const ph=()=>{const s=document.createElement('span');s.className='ph';return s};
function setSrc(e){const c=e.dataset.c,i=+e.dataset.i,w=e.dataset.w||800,L=LIST[c]||[];
 if(e.matches('.hs>img[data-i="1"],.ban>img')){e.loading='eager';e.fetchPriority='high'}
 e.decoding='async';
 if(L.length&&(i<=L.length||!e.dataset.l)){const full=L[(i-1)%L.length],th=full.replace(/\/([^\/]+)$/,'/thumb/$1'),useT=+w<1200;e.dataset.full=full;
  e.onerror=()=>{if(useT&&e.src.includes('/thumb/')){e.src=full;return}e.onerror=null;if(e.dataset.l)e.replaceWith(ph());else e.src=net(c,i,w)};
  e.src=useT?th:full;return}
 e.onerror=null;e.src=net(c,i,w)}
const init=r=>(r||document).querySelectorAll('img[data-c]:not([src])').forEach(e=>{
 // hero ki baaki slides page load ke baad (pehli slide jaldi dikhe)
 if(e.matches('.hs>img:not([data-i="1"])')&&document.readyState!='complete'){if(!e._d){e._d=1;addEventListener('load',()=>setSrc(e),{once:true})}return}
 setSrc(e)});
const tag=(c,i,w,l)=>`<img data-c="${c}" data-i="${i}" ${w?`data-w="${w}"`:''} ${l?'data-l="1"':''} loading="lazy" alt="${NAME[c]} photography by DM Studio Gandhidham">`;
const have=c=>(LIST[c]||[]).length;
const rows=a=>{let s='';for(let k=0;k<a.length;k+=5)s+=`<div class="r5">${a.slice(k,k+5).join('')}</div>`;return s};

// ===== scroll animation (cards) =====
const RV='.tile,.pc,.q,.cols>div,.steps>div,.il>div,details,.r5>*,.gal img,.mos img,.pair,.one,.tabs';
const io=('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches)?new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.1,rootMargin:'0px 0px -5% 0px'}):null;
const reveal=r=>{if(!io)return;(r||document).querySelectorAll(RV).forEach(el=>{if(el.classList.contains('rv'))return;
 const k=[...el.parentElement.children].indexOf(el);el.style.setProperty('--d',(k%5)*.08+'s');el.classList.add('rv');io.observe(el)})};
reveal();

(async()=>{
 await Promise.all(['hero',...CATS,'gallery'].map(async c=>{LIST[c]=await listFor(c)}));
 document.querySelectorAll('[data-g]').forEach(g=>{const c=g.dataset.g;
  if(g.hasAttribute('data-blank')){ // home: sirf aapki folder ki photos, warna khali
   const n=have(c);
   g.innerHTML=n?rows(Array.from({length:n},(_,k)=>tag(c,k+1,900,1))):rows(Array.from({length:SHOW},(_,k)=>tag(c,k+1,900)));
   return}
  const r=(a,b)=>{let s='';for(let i=a;i<=b;i++)s+=tag(c,i,600);return `<div class="r5">${s}</div>`};
  g.innerHTML=r(1,5)+r(6,10)});
 const hs=document.querySelector('.hs');
 if(hs){const im=hs.querySelectorAll('img'),dt=hs.querySelector('.dots');let n=0,t;
  const go=k=>{n=(k+im.length)%im.length;im.forEach((x,j)=>x.classList.toggle('on',j==n));dt.querySelectorAll('button').forEach((x,j)=>x.classList.toggle('on',j==n))};
  im.forEach((_,k)=>{const b=document.createElement('button');b.ariaLabel='Slide '+(k+1);b.onclick=()=>{go(k);clearInterval(t);t=setInterval(()=>go(n+1),5500)};dt.appendChild(b)});
  go(0);t=setInterval(()=>go(n+1),5500)}
 const g=document.getElementById('gal');
 if(g){const n=have('gallery');let s='';
  if(n)for(let k=1;k<=n;k++)s+=tag('gallery',k,900,1);
  else{const m=Math.max(...CATS.map(c=>NET[c].length));for(let k=1;k<=m;k++)CATS.forEach(c=>{if(k<=NET[c].length)s+=tag(c,k,900)})} // folder khali = internet ki photos, mix
  g.innerHTML=s}
 init();reveal()})();
// ===== Reviews slider (reviews.js se data) =====
(()=>{const box=document.getElementById('rv-s');if(!box||!window.REVIEWS||!REVIEWS.length)return;
 const star='<svg viewBox="0 0 24 24" class="st"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.500l6.100-.9z"/></svg>';
 const card=r=>`<article class="rcard"><div class="stars" aria-label="${r.r||5} star">${star.repeat(r.r||5)}</div><p>“${r.t}”</p><div class="who"><b>${(r.n||'?')[0]}</b><div><strong>${r.n}</strong><span>${r.s||''}</span></div></div></article>`;
 const tr=box.querySelector('.rt'),N=REVIEWS.length;
 tr.innerHTML=REVIEWS.map(card).join('')+REVIEWS.slice(0,3).map(card).join('');
 let i=0,t,hold=0;const step=()=>{const c=tr.children[0],g=parseFloat(getComputedStyle(tr).columnGap||getComputedStyle(tr).gap)||0;return c.offsetWidth+g};
 const go=k=>{i=k;tr.style.transition='transform .7s cubic-bezier(.4,0,.2,1)';tr.style.transform=`translateX(${-i*step()}px)`};
 tr.addEventListener('transitionend',()=>{if(i>=N){tr.style.transition='none';i=0;tr.style.transform='translateX(0)'}else if(i<0){tr.style.transition='none';i=N-1;tr.style.transform=`translateX(${-i*step()}px)`}});
 const next=()=>{if(i<N)go(i+1)},prev=()=>{if(i<=0){tr.style.transition='none';i=N;tr.style.transform=`translateX(${-i*step()}px)`;tr.offsetWidth}go(i-1)};
 const play=()=>{clearInterval(t);if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;t=setInterval(()=>{if(!hold)next()},1000)};
 box.querySelector('.rp').onclick=()=>{prev()};box.querySelector('.rn').onclick=()=>{next()};
 const vp=box.querySelector('.rs');vp.onmouseenter=()=>hold=1;vp.onmouseleave=()=>hold=0;
 let x0=null;vp.addEventListener('touchstart',e=>{hold=1;x0=e.touches[0].clientX},{passive:true});
 vp.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>40)d<0?next():prev();setTimeout(()=>hold=0,2500)});
 addEventListener('resize',()=>{tr.style.transition='none';tr.style.transform=`translateX(${-i*step()}px)`});
 play()})();
const lb=document.getElementById('lb');
document.addEventListener('click',e=>{if(e.target.tagName=='IMG'&&e.target.closest('.r5,.gal,.mos')){lb.innerHTML=`<img src="${(e.target.dataset.full||e.target.src).replace(/([?&]w=)\d+/,'$11400')}" alt="">`;lb.classList.add('on')}else lb.classList.remove('on')});
const f=document.getElementById('book');
if(f)f.onsubmit=e=>{e.preventDefault();const d=new FormData(f);
 const m=encodeURIComponent(`Hello DM Studio! Booking enquiry:\nName: ${d.get('n')}\nMobile: ${d.get('m')}\nShoot: ${d.get('s')}\nPackage: ${d.get('p')}\nDate: ${d.get('d')}\nBaby age / details: ${d.get('a')}`);
 open('https://wa.me/'+WA+'?text='+m,'_blank')};
