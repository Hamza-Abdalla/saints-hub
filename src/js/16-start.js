/* ===================== Start ===================== */
function resetData(){comp=[];cad=[];cadms=[];attT={};season=[];sCfg={};seasonOpen=false;dashEdit=false;people=[];tasks=[];att={};wins=[];wiki=[];wrevs=[];wrRecent=[];wrPage=[];notes=[];reqs=[];events=[];days={};av={};log=[];past=[];retro={name:'Retrospective: '+fd(TODAY),k:[],a:[],f:[],ai:[],lock:true,editor:null,round:'r1'};claimTried=false;headUid='';pins=null;rpnote='';busy='';dexp={}}
if(!CONFIGURED){screen='noconfig';draw(1)}
else{screen='load';draw(1);
onAuthStateChanged(auth,async u=>{unsub.forEach(f=>f());unsub=[];last={};resetData();
if(!u){real=cur='';myRole='';myName='';screen='login';tab='';arrange=false;wmode='home';wcur='';note='';msg='';okmsg='';draw(1);return}
try{const s0=await getDoc(doc(db,'users',u.uid));
if(!s0.exists()){real=u.uid;screen='nouser';draw(1);return}
real=cur=u.uid;tab='';lastAct=Date.now();myRole=s0.data().r;myName=s0.data().n||'';
if(s0.data().mustChange){screen='pin';simsg='';draw(1);return}
screen='app';listen(myRole,u.uid);draw(1)}
catch(err){if(err.code=='permission-denied'){real=u.uid;screen='nouser'}else{simsg=friendly(err);screen='login'}draw(1)}})}
document.addEventListener('pointerdown',e=>{const g=e.target.closest&&e.target.closest('.dgrip');if(!g)return;e.preventDefault();const i=+g.dataset.grip,rows=[...document.querySelectorAll('[data-ri]')];let j=i;try{g.setPointerCapture(e.pointerId)}catch(x){}
if(rows[i])rows[i].classList.add('dragging');
const mvh=ev=>{const y=ev.clientY;let k=rows.findIndex(r=>{const b=r.getBoundingClientRect();return y>=b.top&&y<=b.bottom});if(k<0)k=y<rows[0].getBoundingClientRect().top?0:rows.length-1;j=k;rows.forEach((r,x)=>r.classList.toggle('dropat',x==k&&k!=i))};
const up=()=>{g.removeEventListener('pointermove',mvh);g.removeEventListener('pointerup',up);g.removeEventListener('pointercancel',up);rows.forEach(r=>r.classList.remove('dragging','dropat'));if(j!=i){const o=navItems(tabs()),[it]=o.splice(i,1);o.splice(j,0,it);setLayout(o);render()}};
g.addEventListener('pointermove',mvh);g.addEventListener('pointerup',up);g.addEventListener('pointercancel',up)});
document.addEventListener('keydown',e=>{const g=e.target.closest&&e.target.closest('.dgrip');if(!g||!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const o=navItems(tabs()),i=+g.dataset.grip,j=i+(e.key=='ArrowUp'?-1:1);if(j<0||j>=o.length)return;[o[i],o[j]]=[o[j],o[i]];setLayout(o);render();setTimeout(()=>{const n=document.querySelector('[data-grip="'+j+'"]');if(n)n.focus()},0)});

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b&&'dcust' in b.dataset){dashEdit=!dashEdit;draw(1)}});
const DDEF=['stats','quick','notes','attn','parts','bars','progress','accomp','cal','events','wiki'];
function dashMine(p){const dd=p.dash||[];return dd.some(x=>x[0]=='+')?dd.filter(x=>x[0]=='+'&&x.length>1).map(x=>x.slice(1)):DDEF.slice()}
function setDash(l){const p=byId(cur);if(!p)return;p.dash=l.length?l.map(x=>'+'+x):['+'];render()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b||screen!='app'||!real)return;const d=b.dataset,p=byId(cur);if(!p)return;
if(d.wrm)setDash(dashMine(p).filter(x=>x!=d.wrm));else if(d.wadd)setDash([...dashMine(p).filter(x=>x!=d.wadd),d.wadd]);else if('wreset' in d){p.dash=[];render()}});
document.addEventListener('pointerdown',e=>{const g=e.target.closest&&e.target.closest('.wgrip');if(!g)return;e.preventDefault();const i=+g.dataset.wg,rows=[...document.querySelectorAll('.wrow')];let j=i;try{g.setPointerCapture(e.pointerId)}catch(x){}
if(rows[i])rows[i].classList.add('dragging');
const mvh=ev=>{const y=ev.clientY;let k=rows.findIndex(r=>{const bb=r.getBoundingClientRect();return y>=bb.top&&y<=bb.bottom});if(k<0)k=y<rows[0].getBoundingClientRect().top?0:rows.length-1;j=k;rows.forEach((r,x)=>r.classList.toggle('dropat',x==k&&k!=i))};
const up=()=>{g.removeEventListener('pointermove',mvh);g.removeEventListener('pointerup',up);g.removeEventListener('pointercancel',up);rows.forEach(r=>r.classList.remove('dragging','dropat'));if(j!=i){const o=dashMine(byId(cur)).filter(id=>document.querySelector('.wrow')),it=o.splice(i,1)[0];o.splice(j,0,it);setDash(o)}};
g.addEventListener('pointermove',mvh);g.addEventListener('pointerup',up);g.addEventListener('pointercancel',up)});
document.addEventListener('keydown',e=>{const g=e.target.closest&&e.target.closest('.wgrip');if(!g||!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const o=dashMine(byId(cur)),i=+g.dataset.wg,j=i+(e.key=='ArrowUp'?-1:1);if(j<0||j>=o.length)return;[o[i],o[j]]=[o[j],o[i]];setDash(o);setTimeout(()=>{const n=document.querySelector('[data-wg="'+j+'"]');if(n)n.focus()},0)});

document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('button');if(!b||screen!='app'||!real)return;const d=b.dataset,m=me();
if('sadd' in d&&sEdit(m)){spSave();const dt=sp.add,t=sp.t.trim();if(!dt||!t){msg='Pick a date and give it a title.';draw(1);return}season.push({id:uidn(),date:dt,title:t.slice(0,120),note:sp.n.trim().slice(0,200),cat:sp.c});sp.t='';sp.n='';sp.add='';ev('Added "'+t+'" to the build season calendar on '+dt);render()}
else if(d.sdel&&sEdit(m)){const x=season.find(i=>i.id==d.sdel);season=season.filter(i=>i.id!=d.sdel);ev('Removed "'+(x?x.title:'an item')+'" from the build season calendar');render()}
else if('sunlock' in d&&['core','owner'].includes(m.r)){try{await setDoc(doc(db,'config','main'),{seasonOpen:!seasonOpen},{merge:true});ev(seasonOpen?'Unlocked the build season calendar for everyone':'Locked the build season calendar for members');render()}catch(err){msg=friendly(err);draw(1)}}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button'),d=b&&b.dataset;if(screen!='app'||!real){return}const m0=me();if(!m0||!sEdit(m0))return;
if(d&&d.dpk){spSave();if(sp.open==d.dpk)sp.open='';else{sp.open=d.dpk;const v=d.dpk=='add'?sp.add:(sCfg[d.dpk]||''),b0=v?new Date(v+'T12:00:00'):new Date();sp.y=b0.getFullYear();sp.m=b0.getMonth()}draw(1)}
else if(d&&d.dpn){spSave();let m2=sp.m+(+d.dpn),y2=sp.y;if(m2<0){m2=11;y2--}if(m2>11){m2=0;y2++}sp.m=m2;sp.y=y2;draw(1)}
else if(d&&'dpd' in d){spSave();const k=sp.open,v=d.dpd;sp.open='';if(k=='add'){sp.add=v;draw(1)}else{sCfg[k]=v;if(/^c[123]d$/.test(k)){const ds=[1,2,3].map(i=>sCfg['c'+i+'d']).filter(Boolean).sort();sCfg.end=ds.length?ds[ds.length-1]:''}ev('Build season '+(k=='kickoff'?'kickoff':/^c[123]d$/.test(k)?'competition '+k[1]+' date':'last day')+' set to '+(v||'nothing'));render()}}
else if(sp.open&&!(e.target.closest&&e.target.closest('.dpw'))){sp.open='';draw(1)}});

