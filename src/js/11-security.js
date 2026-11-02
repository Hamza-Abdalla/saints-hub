/* ===================== Security =====================
   Sign-in, PIN storage and wrong-PIN limits are handled by Firebase Authentication.
   This page never sees or stores anyone's PIN, except while it is being typed. */
const LOGO=document.querySelector('.hd img').src;
let alMine=null,alLoad=false,alMsg='',alOk='',IDLE_MIN=15,lastAct=Date.now(),secLog=[],simsg='',siLast='',okmsg='',rpnote='',pins=null,busy='',unsub=[],last={},headUid='',app2=null;
const rnd=n=>{const a=new Uint8Array(n);crypto.getRandomValues(a);return a};
const r32=()=>{const a=rnd(4);return((a[0]<<24)|(a[1]<<16)|(a[2]<<8)|a[3])>>>0};
const mkpin=()=>String(100000+r32()%900000);
const mkuser=()=>{const c='abcdefghjkmnpqrstuvwxyz23456789';let u='';for(let i=0;i<6;i++)u+=c[r32()%c.length];return 'saint-'+u};
const privileged=r=>['owner','mentor','core','admin'].includes(r);
const minPin=r=>privileged(r)?10:6;
const myUser=()=>auth&&auth.currentUser&&auth.currentUser.email?auth.currentUser.email.split('@')[0]:'';
const weakPin=(pin,r)=>{if(pin.length<minPin(r))return privileged(r)?'Owners, mentors, core admins and admins need a PIN of at least 10 characters.':'A PIN needs at least 6 characters. Six digits is fine.';if(pin.length>64)return 'That PIN is too long.';if(/^(.)\1+$/.test(pin)||'0123456789012345'.includes(pin)||'9876543210987654'.includes(pin)||/^(password|saints1899|qwerty|letmein|iloveyou)/i.test(pin)||pin.toLowerCase()==myUser())return 'That PIN is too easy to guess. Avoid repeated or counting characters.';return ''};
const secEv=(text,p)=>{secLog.unshift({at:Date.now(),who:p?p.n:'',text});if(secLog.length>80)secLog.length=80};
const ini=n=>String(n).replace(/^(Mdm|Mr|Ms|Mrs|Dr)\.?\s+/,'').split(' ').filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase();
const sessLeft=()=>IDLE_MIN*60000-(Date.now()-lastAct);
const sessTxt=()=>'Auto sign-out in '+Math.max(1,Math.ceil(sessLeft()/60000))+' min';
async function signOut(reason){const R=byId(real);if(R)secEv(reason?'Signed out automatically (no activity)':'Signed out',R);simsg=reason||'';document.body.classList.remove('navopen');try{await fbSignOut(auth)}catch(e){}}
const isHead=m=>m.ti=='Head mentor'||m.r=='owner';
const isHeadUid=()=>!!headUid&&real===headUid&&cur===real;
/* Every action is checked against the signed-in person's permissions before it runs. */
function allowClick(d){const m=me(),R=byId(real),own=R&&R.r=='owner'&&cur==real,K=i=>tasks.find(k=>k.id==i),Q=i=>reqs.find(r=>r.id==i),N=i=>notes.find(n=>n.id==i);
const keys=Object.keys(d);if(screen!='app'||!real||!R)return keys.every(x=>['signin','pinset','signout','out'].includes(x));
if(d.tab)return tabs().includes(d.tab);
if(d.in)return chk(m,byId(d.in)||{});
if(d.add)return S.includes(d.add)&&add(m,d.add);
if(d.take){const k=K(d.take);return !!k&&!k.who&&add(m,k.t)&&can(m,m)&&fits(m,k.t)}
if(d.save||d.none){const k=K(d.save||d.none);return !!k&&k.who==cur}
if(d.focus){const k=K(d.focus);return !!k&&k.who==cur}
if(d.rev||'own' in d||'pinreset' in d||'actgo' in d)return own;
if(d.dl||d.dok)return isHeadUid();
if('addp' in d)return m.r=='owner'||(m.r=='mentor'&&['member','lead','captain','mentor','admin'].includes(($('#pr')||{}).value))||(m.r=='core'&&['member','lead','captain'].includes(($('#pr')||{}).value));
if(d.ds)return calEdit(m);if(d.avs||d.avx)return isMentor(m);if(d.evadd)return evAdd(m);
if('rsend' in d)return m.r!='mentor';
if(d.rap){const r=Q(d.rap.split(':')[0]);return !!r&&r.status=='pending'&&canApprove(m,r.kind)}
if(d.ordp){const r=Q(d.ordp);return !!r&&r.status=='delegated'&&r.ordBy==cur}
if(d.ord){const r=Q(d.ord);return !!r&&((r.status=='approved'&&isHead(m))||(['delegated','inprogress'].includes(r.status)&&r.ordBy==cur))}
if(d.adone)return canDone(m);
if('cgrant' in d||'clock' in d||'cnew' in d)return ['core','owner'].includes(m.r);
if(d.hask||d.hrm){const k=K((d.hask||d.hrm).split(':')[0]);return !!k&&k.who==cur}
if(d.hans){const n=N(d.hans.split(':')[0]);return !!n&&n.to==cur}
if(d.nread){const n=N(d.nread);return !!n&&n.to==cur}
if(d.exp)return ['owner','mentor','core','admin'].includes(m.r);
if(d.rwd){const r=Q(d.rwd);return !!r&&r.status=='pending'&&r.by==cur}
if(d.red){const r=Q(d.red);return !!r&&((r.by==cur&&r.status=='pending')||(canApprove(m,r.kind)&&['pending','approved'].includes(r.status)))}
if(d.rsave){const r=Q(d.rsave);return !!r&&((r.by==cur&&r.status=='pending')||(canApprove(m,r.kind)&&['pending','approved'].includes(r.status)))}
if(d.link||d.rmf){const k=K(d.link||String(d.rmf).split(':')[0]);return !!k&&add(m,k.t)}
if(d.wpr||d.wrs||d.wrestore||d.wprok||'wprno' in d||d.wbrm!==undefined||d.wbed!==undefined||d.wbsv!==undefined||'wbx' in d||'wundo' in d)return isMod(m);
if('pinchg' in d||'alset' in d||'alclr' in d)return cur==real;
return true}
function allowChange(t){const d=t.dataset,m=me(),R=byId(real),own=R&&R.r=='owner'&&cur==real,K=i=>tasks.find(k=>k.id==i);
if(!real||screen!='app')return true;
if(d.ss||d.days){const k=K(d.ss||d.days);return !!k&&k.who==cur}
if(d.due){const k=K(d.due),p=k&&byId(k.who);return !!p&&add(m,k.t)&&can(m,p)&&dueOK(m,p)}
if(d.as){const k=K(d.as);if(!k||!add(m,k.t))return false;const p=t.value&&byId(t.value);return !t.value||t.value==k.who||(!!p&&can(m,p)&&fits(p,k.t))}
if(t.id=='rule'||t.id=='idle'||'roster' in d)return own;
if(d.up){const k=K(d.up);return !!k&&add(m,k.t)}
if(d.hol)return calEdit(m);
if(d.del){const r=reqs.find(r=>r.id==d.del);return !!r&&r.status=='approved'&&isHead(m)}
if(d.thk){const k=K(d.thk);return !!k&&add(m,k.t)}
return true}
const block=(e,what)=>{e.stopPropagation();e.preventDefault();msg='You do not have permission to do that.';if(real)secEv('Blocked an action without permission ('+what+')',byId(real));render()};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;okmsg='';if(!allowClick(b.dataset)){block(e,Object.keys(b.dataset)[0]||'button');return}
if('back' in b.dataset&&cur!=real)secEv('Stopped acting as '+me().n,byId(real))},true);
document.addEventListener('change',e=>{const t=e.target;if(t.matches('select,input')&&!allowChange(t))block(e,t.id||Object.keys(t.dataset)[0]||'field')},true);
['pointerdown','keydown','input'].forEach(x=>document.addEventListener(x,()=>{lastAct=Date.now();const w=$('#idlewarn');if(w)w.hidden=true},true));
setInterval(()=>{if(!real)return;const left=sessLeft(),w=$('#idlewarn');if(left<=0){if(w)w.hidden=true;signOut('You were signed out after '+IDLE_MIN+' minutes with no activity.');return}
const s=$('#sesst');if(s)s.textContent=sessTxt();if(w){if(left<60000){w.hidden=false;w.querySelector('span').textContent='No activity for a while. You will be signed out in '+Math.ceil(left/1000)+' seconds.'}else w.hidden=true}},1000);
document.addEventListener('submit',e=>e.preventDefault(),true);
const brand='<div class="sibrand"><img alt="Saints 1899 logo" src="'+LOGO+'"><div><b>Saints 1899</b><span>Team Hub</span></div></div>';
function vSignIn(){return `<div class="si"><div class="sicard" id="signin">${brand}<h1>Sign in</h1><label>Username<input id="lu" value="${esc(siLast)}" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="Username" maxlength="40" ${siLast?'':'autofocus'}></label><label>PIN<input id="sipin" class="pin" type="password" autocomplete="current-password" maxlength="64" ${siLast?'autofocus':''}></label><p><label class="sishared"><input type="checkbox" id="shared"> This is a shared computer. Sign me out when I close this tab.</label></p>${simsg?`<p class="sierr" role="alert">${esc(simsg)}</p>`:''}<button class="sel" type="button" data-signin>Sign in</button><p class="mut" style="font-size:15px">Your username and starting PIN come from a mentor or owner. Forgot your PIN? Ask an owner to reset it. After several wrong tries, sign-in pauses for a while. You are signed out after ${IDLE_MIN} minutes with no activity.</p></div></div>`}
function vPinSet(){return `<div class="si"><div class="sicard">${brand}<h1>Choose your own PIN</h1><p>Welcome${myName?', '+esc(myName):''}. You signed in with a starting PIN, so choose a new PIN that only you know.</p><p class="mut" style="font-size:15px">${privileged(myRole)?'Your role needs at least 10 characters.':'At least 6 characters. Six digits is fine.'} Avoid repeated or counting characters.</p><label>New PIN<input id="np1" class="pin" type="password" autocomplete="new-password" maxlength="64"></label><label>Type it again<input id="np2" class="pin" type="password" autocomplete="new-password" maxlength="64"></label>${simsg?`<p class="sierr" role="alert">${esc(simsg)}</p>`:''}<button class="sel" data-pinset>Save my PIN</button><button data-signout>Sign out</button></div></div>`}
const vNoUser=()=>`<div class="si"><div class="sicard">${brand}<h1>Signed in, but no access yet</h1><p>Your login worked, but the site could not open your team record. Ask an owner to check that you were added. If you are setting up the first owner, check that the Firestore rules are published and that the users record has the same ID as your User UID (SETUP.md).</p><button data-signout>Sign out</button></div></div>`;
const vNoConfig=()=>`<div class="si"><div class="sicard">${brand}<h1>Almost ready</h1><p>This site is not connected to its database yet. In the GitHub repository, open <b>firebase-config.js</b> and paste your Firebase settings into it. Then reload this page.</p></div></div>`;
const vLoading=()=>`<div class="si"><div class="sicard">${brand}<p class="mut">Loading...</p></div></div>`;
async function doSignIn(){const raw=$('#lu').value.trim(),u=slug(raw),pin=$('#sipin').value;siLast=raw;simsg='';
if(!u||!pin){simsg='Type your username and your PIN.';draw(1);return}
const b=$('[data-signin]');if(b)b.disabled=true;
try{await setPersistence(auth,$('#shared')&&$('#shared').checked?browserSessionPersistence:browserLocalPersistence);
try{await signInWithEmailAndPassword(auth,u+DOM,pin)}
catch(e1){if(['auth/too-many-requests','auth/network-request-failed'].includes(e1.code))throw e1;
let real0='';try{const s=await getDoc(doc(db,'usernames',u));if(s.exists()&&typeof s.data().u=='string')real0=s.data().u}catch(e2){}
if(!real0)throw e1;await signInWithEmailAndPassword(auth,real0+DOM,pin)}}
catch(err){simsg=err.code=='auth/too-many-requests'?'Too many tries. Wait a few minutes before trying again, or ask an owner to reset your PIN.':err.code=='auth/network-request-failed'?'No internet connection. Try again.':'That username or PIN is not right.';draw(1)}}
Object.assign(ICN,{'My account':'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6','Sign out':'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',Arrange:'M7 4v16M7 4L3 8M7 4l4 4M17 20V4M17 20l-4-4M17 20l4-4',Bell:'M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',Lock:'M5 11h14v10H5zM8 11V7a4 4 0 018 0v4'});
function sideNav(ts){const o=navItems(ts),u=unread();let h='',rare=false;const mv=(i,n)=>`<span class="dgrip" data-grip="${i}" role="button" tabindex="0" aria-label="Drag to move ${n}. The up and down arrow keys also work." title="Drag to move">&#8942;&#8942;</span>`;
o.forEach((t,i)=>{if(t=='|'){rare=true;h+=`<div class="dbdiv" data-ri="${i}"><span>${arrange?'Divider line':''}</span>${arrange?mv(i,'the line'):''}</div>`;return}
h+=`<div class="dbrow" data-ri="${i}"><button class="dbnav ${rare?'rare':''} ${t==tab?'on':''}" data-tab="${t}" ${t==tab?'aria-current="page"':''}>${dbic(t)}<span>${t}</span>${t=='Dashboard'&&u?`<span class="cnt">${u}</span>`:''}</button>${arrange?mv(i,t):''}</div>`});
return h+`<button class="dbnav rare" data-arr>${dbic('Arrange')}<span>${arrange?'Done arranging':'Arrange pages'}</span></button>`}
function shell(ts,title,sub,inner){const m=me(),R=byId(real),u=unread();
return `<div class="db"><aside class="dbside" aria-label="Main menu"><div class="dbbrand"><img alt="Saints 1899 logo" src="${LOGO}"><div><b>Saints 1899</b><small>Team Hub</small></div><button class="dbclose" data-menu aria-label="Close menu">Close</button></div><div class="dbprof"><div class="dbav">${esc(ini(m.n))}</div><b>${esc(m.n)}</b><small>${esc(label(m))}</small></div>${sideNav(ts)}<button class="dbnav dbout" data-signout>${dbic('Sign out')}<span>Sign out</span></button></aside>
<div class="dbmain"><div class="dbmob"><img alt="" src="${LOGO}"><b>Saints 1899</b><button data-menu aria-label="Open menu">Menu${u?' ('+u+')':''}</button></div>${cur!=real?`<div class="dbactas"><span>You are acting as <b>${esc(m.n)}</b>, signed in as ${esc(R.n)}. Every change is recorded under both names.</span><button data-back>Back to my account</button></div>`:''}
<div class="dbtop"><div><h1>${title}</h1><div class="mut">${sub}</div></div><div class="dbtopr"><button class="dbbell" data-tab="Dashboard" aria-label="${u} notification${u==1?'':'s'}">${dbic('Bell')}${u?`<i>${u}</i>`:''}</button><span class="dbsess" title="For safety you are signed out after ${IDLE_MIN} minutes with no activity">${dbic('Lock')}<span id="sesst">${sessTxt()}</span></span></div></div>${inner}</div></div>`}
function renderApp(){document.body.classList.remove('navopen');
if(screen!='app'){$('#app').innerHTML=({login:vSignIn,pin:vPinSet,nouser:vNoUser,noconfig:vNoConfig}[screen]||vLoading)();const f=screen=='login'?$(siLast?'#sipin':'#lu'):screen=='pin'?$('#np1'):null;if(f&&document.activeElement!==f)f.focus();return}
const R=byId(real);if(!R){$('#app').innerHTML=vLoading();return}
if(!byId(cur))cur=real;const ts=tabs();if(!ts.includes(tab))tab='Dashboard';
const V={'Directors view':vDir,'Records':vRec,'Parts requests':vReq,'Orders':vOrders2,'Calendar':vCal,'Dashboard':vDash,'Wiki':vWiki,'Retrospective':vRetro,'Core admin view':vCore,'History':vHist,'Org chart':vOrg,'Check-in':vCheck,'Team':vTeam,'Tasks':vTasks,'My tasks':vMine,'Build season':vSeason,'View all tasks':vAll,'Assign tasks':vAssign,'Captains view':vCap,'General CAD Info':vCadInfo,'Competition':vComp,'Attendance log':vLog,'Add people':vAdd,'Settings':vSet,'My account':vAcct};
let html=(V[tab]||(()=>vCadTab(tab)))(),title=esc(tab);const mm=html.match(/^\s*<h2>([\s\S]*?)<\/h2>/);if(mm){title=mm[1];html=html.slice(mm[0].length)}
const hr=new Date().getHours(),sub=tab=='Dashboard'?`${hr<12?'Good morning':hr<18?'Good afternoon':'Good evening'}, ${esc(me().n)}. ${fl(TODAY)}`:tab=='Wiki'?"The team's shared notes. Anyone can start or improve a page.":fl(TODAY);
$('#app').innerHTML=shell(ts,title,sub,coBar()+(msg?`<div class="dbmsg" role="alert">${esc(msg)}</div>`:'')+(okmsg?`<div class="dbmsg ok" role="status">${esc(okmsg)}</div>`:'')+(tab!='Dashboard'?helpBanner():'')+html);
document.querySelectorAll('#app input:not([type]),#app input[type=text],#app textarea').forEach(el=>{if(el.maxLength<0)el.maxLength=el.tagName=='TEXTAREA'?(el.id=='wbody'?20000:2000):200})}
function draw(f){TODAY=new Date().toLocaleDateString('en-CA');const x=document.activeElement;if(!f&&x&&x.closest&&x.closest('#app')&&['INPUT','SELECT','TEXTAREA'].includes(x.tagName))return;const sd=document.querySelector('.dbside'),sy=sd?sd.scrollTop:0;renderApp();const sn=document.querySelector('.dbside');if(sn&&sy)sn.scrollTop=sy}
function render(){draw(1);syncOut()}
