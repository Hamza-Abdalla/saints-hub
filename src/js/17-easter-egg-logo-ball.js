/* ===== Easter egg: the dog logo is a ball. Grab it, throw it, watch it bounce. ===== */
(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const SEL='.dbbrand img,.dbmob img',G=2600,REST=0.8,AIR=0.08,ROLL=0.55;
let svv=0,shv=0,sh=null,tl=0,au=null,lastSnd=0,el=null,R=28,x=0,y=0,vx=0,vy=0,a=0,w=0,sqv=0,sqh=0,raf=0,last=0,held=false,pts=[],ox=0,oy=0,homing=0;
const W=()=>document.documentElement.clientWidth,H=()=>innerHeight;
const bn=v=>{v=Math.abs(v);return v>1200?REST:v>400?REST-0.07:0.5};
const snd=()=>{if(au){if(au.state=='suspended')au.resume();return au}try{const C=window.AudioContext||window.webkitAudioContext;au=C?new C():null}catch(_){au=null}return au};
const thud=(v,wall)=>{const c=au;if(!c||Math.abs(v)<250)return;const t=performance.now();if(t-lastSnd<45)return;lastSnd=t;const g=c.createGain(),o=c.createOscillator(),vol=Math.min(0.2,Math.abs(v)/9500),n=c.currentTime;o.type='sine';o.frequency.setValueAtTime((wall?190:130)*(1+Math.min(.4,Math.abs(v)/6000)),n);o.frequency.exponentialRampToValueAtTime(48,n+.14);g.gain.setValueAtTime(vol,n);g.gain.exponentialRampToValueAtTime(0.0008,n+.16);o.connect(g);g.connect(c.destination);o.start();o.stop(n+.18)};
const fxEl=(css)=>{const d=document.createElement('div');d.setAttribute('aria-hidden','true');d.style.cssText='position:fixed;left:0;top:0;pointer-events:none;z-index:99997;will-change:transform,opacity;'+css;document.body.appendChild(d);return d};
const burst=(px,py,nx,ny,v)=>{const s=Math.abs(v);if(s<450)return;const n=Math.min(10,Math.round(s/330));for(let i=0;i<n;i++){const r=2+Math.random()*3.5,sp=40+Math.random()*Math.min(150,s/12),ang=Math.atan2(ny,nx)+(Math.random()-.5)*2.2,dx=Math.cos(ang)*sp,dy=Math.sin(ang)*sp-12,d=fxEl('width:'+2*r+'px;height:'+2*r+'px;border-radius:50%;background:#a9c1d6;margin:'+(-r)+'px 0 0 '+(-r)+'px');d.animate([{transform:'translate('+px+'px,'+py+'px) scale(1)',opacity:.85},{transform:'translate('+(px+dx)+'px,'+(py+dy)+'px) scale(.2)',opacity:0}],{duration:380+Math.random()*260,easing:'cubic-bezier(.15,.7,.3,1)'}).onfinish=()=>d.remove()}
if(s>1500){const d=fxEl('width:24px;height:24px;border-radius:50%;border:3px solid rgba(255,255,255,.75);box-shadow:0 0 0 1px rgba(23,55,94,.25);margin:-12px 0 0 -12px');d.animate([{transform:'translate('+px+'px,'+py+'px) scale(.4)',opacity:.9},{transform:'translate('+px+'px,'+py+'px) scale('+(2+Math.min(3,s/2200))+')',opacity:0}],{duration:420,easing:'ease-out'}).onfinish=()=>d.remove()}};
const trail=t=>{const sp=Math.hypot(vx,vy);if(sp<1500||t-tl<30)return;tl=t;const d=fxEl('width:'+2*R+'px;height:'+2*R+'px;border-radius:50%;background:#fff url('+LOGO+') center/cover');d.animate([{transform:'translate3d('+(x-R)+'px,'+(y-R)+'px,0) scale(1)',opacity:.28},{transform:'translate3d('+(x-R)+'px,'+(y-R)+'px,0) scale(.7)',opacity:0}],{duration:260,easing:'ease-out'}).onfinish=()=>d.remove()};
const put=()=>{const sx=1+sqh-sqv,sy=1+sqv-sqh,sp=Math.hypot(vx,vy),st=held?0:Math.min(0.2,sp/8500),va=Math.atan2(vy,vx),lift=held?1.1:1;
el.style.transform='translate3d('+(x-R)+'px,'+(y-R)+'px,0) rotate('+va+'rad) scale('+(1+st)+','+(1-st*.55)+') rotate('+(-va)+'rad) scale('+sx*lift+','+sy*lift+') rotate('+a+'rad)';
if(sh){const gap=Math.max(0,H()-(y+R)),k=Math.max(.25,1-Math.min(.75,gap/(H()*.7))),wd=2*R*k*(1+Math.max(0,sqv)*1.6);sh.style.transform='translate3d('+(x-wd/2)+'px,'+(H()-7)+'px,0)';sh.style.width=wd+'px';sh.style.opacity=(held?.18:.34*k)}};
const make=img=>{const r=img.getBoundingClientRect();R=Math.max(24,Math.min(34,r.width/2+4));x=r.left+r.width/2;y=r.top+r.height/2;el=document.createElement('div');el.id='ballegg';el.setAttribute('aria-hidden','true');el.style.cssText='position:fixed;left:0;top:0;width:'+2*R+'px;height:'+2*R+'px;border-radius:50%;background:#fff url('+LOGO+') center/cover;box-shadow:0 0 0 3px #fff,0 6px 16px rgba(0,0,0,.35);z-index:99999;touch-action:none;cursor:grab;will-change:transform;user-select:none;-webkit-user-select:none';sh=document.createElement('div');sh.setAttribute('aria-hidden','true');sh.style.cssText='position:fixed;left:0;top:0;height:10px;border-radius:50%;background:radial-gradient(rgba(0,0,0,.55),rgba(0,0,0,0) 70%);z-index:99996;pointer-events:none';document.body.appendChild(sh);document.body.appendChild(el);document.body.classList.add('ball-away');a=0;w=0;sqv=sqh=0;svv=shv=0;put();
el.addEventListener('pointerdown',grab)};
let lastTap=0;const grab=e=>{e.preventDefault();const tn=performance.now();if(tn-lastTap<320&&el&&!held){lastTap=0;home();return}lastTap=tn;cancelAnimationFrame(raf);raf=0;homing=0;held=true;ox=x-e.clientX;oy=y-e.clientY;pts=[{t:performance.now(),x:e.clientX,y:e.clientY}];vx=vy=0;el.style.cursor='grabbing';snd();el.style.boxShadow='0 0 0 3px #fff,0 14px 26px rgba(0,0,0,.4)';try{el.setPointerCapture(e.pointerId)}catch(_){}el.addEventListener('pointermove',move);el.addEventListener('pointerup',drop);el.addEventListener('pointercancel',drop)};
const move=e=>{const t=performance.now(),evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];for(const q of evs){const nx=Math.max(R,Math.min(W()-R,q.clientX+ox)),ny=Math.max(R,Math.min(H()-R,q.clientY+oy));a+=(nx-x)/R;x=nx;y=ny}pts.push({t,x:e.clientX,y:e.clientY});while(pts.length>2&&t-pts[0].t>90)pts.shift();put()};
const credit=()=>{let n=0;try{n=+localStorage.getItem('ballThrows')||0}catch(_){}n++;try{localStorage.setItem('ballThrows',n)}catch(_){}if(n%15==0){const c=document.createElement('div');c.textContent='Ball idea by Daniel K Nguyen';c.style.cssText='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:rgba(20,45,80,.92);color:#fff;font:600 13px Inter,system-ui,sans-serif;padding:8px 14px;border-radius:8px;z-index:99998;opacity:0;transition:opacity .5s;pointer-events:none';document.body.appendChild(c);requestAnimationFrame(()=>c.style.opacity='1');setTimeout(()=>{c.style.opacity='0';setTimeout(()=>c.remove(),600)},4500)}};
const drop=e=>{held=false;credit();el.style.cursor='grab';el.style.boxShadow='0 0 0 3px #fff,0 6px 16px rgba(0,0,0,.35)';el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',drop);el.removeEventListener('pointercancel',drop);const t=performance.now(),f=pts[0],l=pts[pts.length-1],dt=Math.max(16,l.t-f.t)/1000;vx=(l.x-f.x)/dt;vy=(l.y-f.y)/dt;if(t-l.t>80){vx=vy=0}const sp=Math.hypot(vx,vy),mx=5200;if(sp>mx){vx*=mx/sp;vy*=mx/sp}w=vx/R*0.4;last=performance.now();raf=requestAnimationFrame(tick)};
const hit=(v,horiz)=>{const s=Math.min(0.36,Math.abs(v)/3400);thud(v,horiz);if(horiz)burst(x<W()/2?x-R:x+R,y,x<W()/2?1:-1,-.3,v);else if(y>H()/2)burst(x,y+R,0,-1,v);else burst(x,y-R,0,1,v);if(horiz)sqh=Math.max(sqh,s);else sqv=Math.max(sqv,s);if(Math.abs(v)>900&&navigator.vibrate)try{navigator.vibrate(8)}catch(_){}};
const step=dt=>{vy+=G*dt;const d=1-AIR*dt;vx*=d;vy*=d;x+=vx*dt;y+=vy*dt;a+=w*dt;w*=1-0.08*dt;let floor=false;
const r=W()-R,b=H()-R;
if(x<R){x=R;if(vx<0){hit(vx,1);vx=-vx*bn(vx);w+=vy/R*0.12}}else if(x>r){x=r;if(vx>0){hit(vx,1);vx=-vx*bn(vx);w-=vy/R*0.12}}
if(y>b){y=b;if(vy>0){hit(vy,0);vy=-vy*bn(vy);if(vy>-60)vy=0}floor=true}else if(y<R){y=R;if(vy<0){hit(vy,0);vy=-vy*bn(vy)}}
if(floor&&y>=b-0.5){vx*=1-ROLL*dt;w+=(vx/R-w)*Math.min(1,14*dt)}};
const tick=t=>{raf=0;if(held||!el)return;let dt=Math.min(0.05,(t-last)/1000);last=t;const n=Math.max(1,Math.ceil(dt/0.004)),h=dt/n;for(let i=0;i<n;i++)step(h);
svv+=(-380*sqv-15*svv)*dt;sqv+=svv*dt;shv+=(-380*sqh-15*shv)*dt;sqh+=shv*dt;trail(t);put();
const rest=y>=H()-R-0.5&&Math.abs(vy)<8&&Math.abs(vx)<6&&Math.abs(sqv)<0.003&&Math.abs(sqh)<0.003&&Math.abs(svv)<0.05&&Math.abs(shv)<0.05;if(rest){vx=vy=0;w=0;return}raf=requestAnimationFrame(tick)};
const home=()=>{const img=document.querySelector(SEL);if(!img||!el)return;cancelAnimationFrame(raf);raf=0;held=false;const r=img.getBoundingClientRect(),tx=r.left+r.width/2,ty=r.top+r.height/2,sx=x,sy=y,s0=performance.now(),dur=520;homing=1;
const fly=t=>{if(!homing)return;const p=Math.min(1,(t-s0)/dur),e=1-Math.pow(1-p,3);x=sx+(tx-sx)*e;y=sy+(ty-sy)*e-Math.sin(p*Math.PI)*70;a+=0.25;put();if(p<1)requestAnimationFrame(fly);else{homing=0;el.remove();if(sh){sh.remove();sh=null}el=null;document.body.classList.remove('ball-away')}};requestAnimationFrame(fly)};
document.addEventListener('pointerdown',e=>{if(el)return;const img=e.target.closest&&e.target.closest(SEL);if(!img||e.button>0)return;e.preventDefault();make(img);grab(e)},true);
addEventListener('resize',()=>{if(!el||held)return;x=Math.max(R,Math.min(W()-R,x));y=Math.min(H()-R,y);put();if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}});
})();

(()=>{let n=0,t0=0;document.addEventListener('click',e=>{const h=e.target.closest&&e.target.closest('h1');if(!h||!/^Saints 1899 Wiki/.test(h.textContent))return;const t=Date.now();if(t-t0>1500)n=0;t0=t;if(++n<7)return;n=0;const c=document.createElement('div');c.textContent='Wiki idea by Alex Ferlay';c.style.cssText='position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:rgba(20,45,80,.92);color:#fff;font:600 13px Inter,system-ui,sans-serif;padding:8px 14px;border-radius:8px;z-index:99998;opacity:0;transition:opacity .5s;pointer-events:none';document.body.appendChild(c);requestAnimationFrame(()=>c.style.opacity='1');setTimeout(()=>{c.style.opacity='0';setTimeout(()=>c.remove(),600)},4500)})})();

let wipeStep=0,wipeMsg='',wiping=false,wtv='';
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('button');if(!b||screen!='app'||!real)return;const d=b.dataset,me0=byId(real);if(!me0||me0.r!='owner'||(!('wipe0' in d)&&!('wipe1' in d)&&!('wipex' in d)&&!('wipego' in d)))return;
if('wipe0' in d){wipeStep=1;wipeMsg='';draw(1);return}
if('wipe1' in d){wipeStep=2;wipeMsg='';draw(1);return}
if('wipex' in d){if(wiping)return;wipeStep=0;wtv='';wipeMsg='';draw(1);return}
if(wiping)return;const pin=($('#wpin')||{}).value||'',tp=(($('#wtype')||{}).value||'').trim();
wtv=tp;if(tp!='ERASE'){wipeMsg='Type ERASE in capital letters to continue.';draw(1);return}
if(!pin){wipeMsg='Enter your own PIN to continue.';draw(1);return}
wiping=true;wipeMsg='Checking your PIN...';draw(1);
try{await reauthenticateWithCredential(auth.currentUser,EmailAuthProvider.credential(auth.currentUser.email,pin));await auth.currentUser.getIdToken(true)}
catch(err){wiping=false;wipeMsg=err.code=='auth/too-many-requests'?'Too many tries. Wait a few minutes. Nothing was erased.':'That PIN is not right. Nothing was erased.';draw(1);return}
wipeMsg='Erasing. Do not close this page...';draw(1);
try{const cols=['tasks','reqs','events','notes','log','wins','wiki','wrev','attendance','days','avail','retro','ritems','rounds','season','usernames','comp','cadsub','cadms','users'];
for(const c of cols){const sn=await getDocs(collection(db,c));const ds=sn.docs.filter(x=>!((c=='users'&&x.id==real)||(c=='usernames'&&x.data().uid==real)));for(let i=0;i<ds.length;i+=400){const bt=writeBatch(db);ds.slice(i,i+400).forEach(x=>bt.delete(x.ref));await bt.commit()}}
const cs=await getDoc(doc(db,'config','main')),c0=cs.exists()?cs.data():{};await setDoc(doc(db,'config','main'),{rule:c0.rule||2,idle:c0.idle||15});
wiping=false;wipeStep=0;wtv='';wipeMsg='Everything was erased. Load your roster from the box above to start again.';setTimeout(()=>{ev('Erased all data on the site');render()},1200);draw(1)}
catch(err){wiping=false;wipeMsg='Stopped part way: '+friendly(err)+' Some data may be gone. Press the button again to finish.';draw(1)}});

let wopen={};
function wSubOpts(cat,cur){const subs=[...new Set(wiki.filter(p=>!p.removed&&p.cat==cat&&p.sub).map(p=>p.sub))].sort((a,b)=>a.localeCompare(b));if(cur&&!subs.includes(cur))subs.push(cur);return `<option value="">None</option>${subs.map(s=>`<option value="${esc(s)}" ${s==cur?'selected':''}>${esc(s)}</option>`).join('')}<option value="__new">Add a new subcategory...</option>`}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.id)return;if(t.id=='wcat'){const s=$('#wsub');if(s){s.innerHTML=wSubOpts(t.value,'');const l=$('#wsubl');if(l)l.style.display='none'}}else if(t.id=='wsub'){const l=$('#wsubl');if(l){l.style.display=t.value=='__new'?'':'none';if(t.value=='__new'){const i=$('#wsubnew');if(i)i.focus()}}}});
document.addEventListener('keydown',e=>{const ta=e.target;if(!ta||ta.id!='wbody'||!(e.ctrlKey||e.metaKey)||e.altKey||e.shiftKey)return;const k=e.key.toLowerCase(),m={b:'**',i:'*',u:'__'}[k];if(!m)return;e.preventDefault();
const v=ta.value,s0=ta.selectionStart,e0=ta.selectionEnd,L=m.length;
if(s0>=L&&v.slice(s0-L,s0)==m&&v.slice(e0,e0+L)==m&&!(m=='*'&&(v[s0-2]=='*'||v[e0+1]=='*'))){ta.value=v.slice(0,s0-L)+v.slice(s0,e0)+v.slice(e0+L);ta.selectionStart=s0-L;ta.selectionEnd=e0-L}
else if(e0-s0>=2*L&&v.slice(s0,s0+L)==m&&v.slice(e0-L,e0)==m&&!(m=='*'&&(v[s0+1]=='*'))){ta.value=v.slice(0,s0)+v.slice(s0+L,e0-L)+v.slice(e0);ta.selectionStart=s0;ta.selectionEnd=e0-2*L}
else{ta.value=v.slice(0,s0)+m+v.slice(s0,e0)+m+v.slice(e0);ta.selectionStart=s0+L;ta.selectionEnd=e0+L}
ta.dispatchEvent(new Event('input',{bubbles:true}));if(typeof wkLive=='function')wkLive()});

document.addEventListener('input',e=>{const t=e.target,f=t&&t.closest&&t.closest('[data-rqf]');if(!f||!t.classList.contains('rqc'))return;const p=f.dataset.rqf,g=i=>document.getElementById(p+i),n=i=>+(g(i).value)||0,ic=r2(n('u')*n('q'));g('ic').value=ic?ic.toFixed(2):'';const tx=r2(ic*n('tp')/100);g('tx').value=ic?tx.toFixed(2):'';const tot=r2(ic+tx+n('sh'));g('c').value=tot?tot.toFixed(2):''});

