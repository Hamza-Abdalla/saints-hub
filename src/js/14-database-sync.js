/* ===================== Database sync (Firestore) =====================
   The page keeps normal in-memory lists. After every action, syncOut() compares them with the last copy
   from the database and writes only what changed. Snapshots from the database replace the lists. */
const san=(o,ex=['body'])=>JSON.parse(JSON.stringify(o),(k,v)=>typeof v=='string'&&!ex.includes(k)?v.replace(/[<>]/g,''):v);
const cl=o=>JSON.parse(JSON.stringify(o)),okUrl=u=>/^https?:\/\//i.test(u||'');
const F={users:['n','r','ti','t','g','lim','added','mustChange','layout','fo','dash'],tasks:['t','x','who','s','d','due','lc','did','didOn','plan','files','toHead','desc','by','cad'],reqs:['kind','sub','item','vendor','qty','unit','icost','taxp','tax','ship','link','cost','prio','orderBy','needBy','note','info','by','status','ordBy'],events:['date','title','time','plan','by'],notes:['to','tid','kind','text','note','at','read'],log:['at','by','text','tid'],wins:['at','text','toHead','t','by'],wiki:['title','cat','sub','theme','ua','by','at','removed','body','eby','eat','n'],wrev:['page','text','ua','by','at','note']};
const ARR=['votes','present'];
let season=[],sCfg={},seasonOpen=false,dashEdit=false;
const seasonMap=()=>{const m={},c={};if(sCfg.kickoff!==undefined)c.kickoff=sCfg.kickoff;if(sCfg.end!==undefined)c.end=sCfg.end;['c1n','c1d','c2n','c2d','c3n','c3d'].forEach(k=>{if(sCfg[k]!==undefined)c[k]=sCfg[k]});if(Object.keys(c).length)m.cfg=c;season.forEach(i=>{m[i.id]={date:i.date,title:i.title,note:i.note||'',cat:i.cat||'Other'}});return m};
const ent=(arr,f,x)=>{const m={};arr.forEach(e=>{const o={};f.forEach(k=>{if(e[k]!==undefined)o[k]=e[k]});if(x)x(e,o);m[e.id]=o});return m};
const hm=(e,o)=>{o.helpMap=Object.fromEntries((e.help||[]).map(h=>[h.id,h.r]))};
const J=m=>{const o={};for(const id in m){o[id]={};for(const k in m[id])o[id][k]=JSON.stringify(m[id][k])}return o};
const base=(n,m)=>{last[n]=J(m)};
const riMap=()=>{const m={};['k','a','f','ai'].forEach(t=>retro[t].forEach(i=>{m[i.id]={type:t,round:retro.round,text:i.text,sub:i.sub||'',votes:i.votes||[],by:i.by||'',done:!!i.done,carried:!!i.carried,claim:i.claim||'',...(t=='ai'?{did:i.did||'',didOn:i.didOn||''}:{})}}));return m};
const attMap=()=>{const a={};for(const d in att)a[d]={present:att[d]};return a};
const metaMap=()=>({meta:{name:retro.name,lock:retro.lock,editor:retro.editor||null,round:retro.round}});
const cfgMap=()=>({main:{rule,idle:IDLE_MIN}});
function pushMap(name,col,cur,o={}){const prev=last[name];if(!prev)return Promise.resolve();const ops=[];
if(o.keep)for(const id in prev)if(!(id in cur))cur[id]={};
for(const id in cur){const c=cur[id],p=prev[id],r=doc(db,col,id);
if(!p){if(Object.keys(c).length)ops.push(setDoc(r,c,{merge:!!(o.keep||o.up)}));continue}
const up={};
for(const k in c){if(JSON.stringify(c[k])===p[k])continue;
if(ARR.includes(k)){const old=p[k]?JSON.parse(p[k]):[],ad=c[k].filter(x=>!old.includes(x)),rm=old.filter(x=>!c[k].includes(x));if(ad.length)ops.push(setDoc(r,{[k]:arrayUnion(...ad)},{merge:true}));if(rm.length)ops.push(updateDoc(r,{[k]:arrayRemove(...rm)}));continue}
up[k]=c[k]}
for(const k in p)if(!(k in c)){if(ARR.includes(k)){const old=JSON.parse(p[k]);if(old.length)ops.push(updateDoc(r,{[k]:arrayRemove(...old)}))}else up[k]=deleteField()}
if(Object.keys(up).length)ops.push(o.up?setDoc(r,up,{merge:true}):updateDoc(r,up))}
if(!o.keep&&!o.nodel)for(const id in prev)if(!(id in cur))ops.push(deleteDoc(doc(db,col,id)));
last[name]=J(cur);return Promise.all(ops)}
let syncing=Promise.resolve();
function syncOut(){if(screen!='app'||!byId(real)||!db)return;log.forEach(e=>{if(!e.id)e.id=uidn()});
const run=()=>Promise.all([pushMap('users','users',ent(people,F.users)),pushMap('tasks','tasks',ent(tasks,F.tasks,hm)),pushMap('reqs','reqs',ent(reqs,F.reqs)),pushMap('events','events',ent(events,F.events)),pushMap('comp','comp',ent(comp,CF)),pushMap('notes','notes',ent(notes,F.notes)),pushMap('log','log',ent(log,F.log),{nodel:1}),pushMap('wins','wins',ent(wins,F.wins),{nodel:1}),pushMap('wiki','wiki',ent(wiki,F.wiki),{nodel:1}),pushMap('wrev','wrev',ent(wrevs,F.wrev),{nodel:1}),pushMap('att','attendance',attMap(),{keep:1}),pushMap('days','days',cl(days)),pushMap('av','avail',cl(av)),pushMap('ri','ritems',riMap()),pushMap('meta','retro',metaMap(),{up:1}),pushMap('cfg','config',cfgMap(),{up:1}),pushMap('season','season',seasonMap()),pushMap('cad','cadsub',ent(cad,CADF)),pushMap('cadms','cadms',ent(cadms,CMF))]);
syncing=syncing.then(run).catch(e=>{msg=friendly(e);draw(1)})}
const friendly=e=>e&&e.code=='permission-denied'?'The database did not allow that change. Your change was not saved. If you think you should be able to do this, tell an owner.':(e&&(e.message||e.code))||String(e);
function derive(){const ds=Object.keys(att).filter(d=>d!=TODAY).sort().reverse(),tod=att[TODAY]||[];
people.forEach(p=>{p.in=tod.includes(p.id);let m=0;p.last='Not yet';for(const d of ds.filter(d=>d>=(p.added||''))){if(att[d].includes(p.id)){p.last=fd(d);break}m++}p.missed=m})}
let wrRecent=[],wrPage=[];
const mergeWr=()=>{const m=new Map();wrRecent.concat(wrPage).forEach(x=>m.set(x.id,x));wrevs=[...m.values()];base('wrev',ent(wrevs,F.wrev))};
function listen(rl,uid){let wsub=null;const e=x=>console.error(x),on=(q,f)=>unsub.push(onSnapshot(q,f,e)),nm=!['member'].includes(rl);
on(collection(db,'users'),q=>{people=q.docs.map(d=>({id:d.id,...san(d.data())}));base('users',ent(people,F.users));derive();draw();claimHead()});
on(collection(db,'tasks'),q=>{tasks=q.docs.map(d=>{const x={id:d.id,...san(d.data())};x.help=Object.entries(x.helpMap||{}).map(([id,r])=>({id,r}));return x});base('tasks',ent(tasks,F.tasks,hm));draw()});
let ss=null;const subSeason=()=>{if(ss)return;ss=onSnapshot(collection(db,'season'),q=>{season=[];sCfg={};q.docs.forEach(d=>{const x=san(d.data());if(d.id=='cfg')sCfg=x;else season.push({id:d.id,...x})});base('season',seasonMap());draw()},err=>{ss=null;season=[];sCfg={};last.season=undefined;console.error(err);draw()})};unsub.push(()=>{if(ss)ss();ss=null});
on(doc(db,'config','main'),d=>{const c=d.data()||{};seasonOpen=!!c.seasonOpen;if(seasonOpen&&rl=='member')subSeason();rule=c.rule||2;IDLE_MIN=[5,10,15,30].includes(c.idle)?c.idle:15;headUid=c.headMentorUid||'';base('cfg',cfgMap());derive();draw();claimHead()});
on(collection(db,'reqs'),q=>{reqs=q.docs.map(d=>({id:d.id,...san(d.data())}));base('reqs',ent(reqs,F.reqs));draw()});
if(['owner','mentor','core','admin'].includes(rl))on(collection(db,'comp'),q=>{comp=q.docs.map(d=>({id:d.id,...san(d.data())}));base('comp',ent(comp,CF));draw()});
on(collection(db,'events'),q=>{events=q.docs.map(d=>({id:d.id,...san(d.data())}));base('events',ent(events,F.events));draw()});
on(collection(db,'cadsub'),q=>{cad=q.docs.map(d=>({id:d.id,...san(d.data())}));base('cad',ent(cad,CADF));draw()});
on(collection(db,'cadms'),q=>{cadms=q.docs.map(d=>({id:d.id,...san(d.data())}));base('cadms',ent(cadms,CMF));draw()});
on(collection(db,'days'),q=>{days={};q.docs.forEach(d=>days[d.id]=san(d.data()));base('days',cl(days));draw()});
on(collection(db,'avail'),q=>{av={};q.docs.forEach(d=>av[d.id]=san(d.data()));base('av',cl(av));draw()});
on(query(collection(db,'notes'),where('to','==',uid)),q=>{notes=q.docs.map(d=>({id:d.id,...san(d.data())}));base('notes',ent(notes,F.notes));draw()});
on(collection(db,'rounds'),q=>{past=q.docs.map(d=>({id:d.id,...san(d.data())})).sort((a,b)=>(b.at||0)-(a.at||0));draw()});
let ri=null,rr='';on(doc(db,'retro','meta'),d=>{const m=d.data()||{};if(m.name)retro.name=m.name;retro.lock=m.lock!==false;retro.editor=m.editor||null;retro.round=m.round||'r1';base('meta',metaMap());
if(retro.round!=rr){rr=retro.round;if(ri)ri();ri=onSnapshot(query(collection(db,'ritems'),where('round','==',rr)),q=>{retro.k=[];retro.a=[];retro.f=[];retro.ai=[];q.docs.forEach(x=>{const i={id:x.id,...san(x.data())};if(retro[i.type])retro[i.type].push(i)});base('ri',riMap());draw()},e)}draw()},e);unsub.push(()=>{if(ri)ri()});
if(['owner','mentor','core','admin','lead','captain'].includes(rl))on(collection(db,'attendance'),q=>{att={};attT={};q.docs.forEach(d=>{const a=d.data().present||[];if(a.length)att[d.id]=a;attT[d.id]=d.data().times||{}});base('att',attMap());derive();draw()});
else on(doc(db,'attendance',TODAY),d=>{att={};attT={};const a=(d.data()||{}).present||[];if(a.length)att[TODAY]=a;attT[TODAY]=(d.data()||{}).times||{};base('att',attMap());derive();draw()});
if(nm)on(query(collection(db,'log'),orderBy('at','desc'),limit(300)),q=>{log=q.docs.map(d=>({id:d.id,...san(d.data())}));base('log',ent(log,F.log));draw()});else last.log={};
on(query(collection(db,'wins'),orderBy('at','desc'),limit(30)),q=>{wins=q.docs.map(d=>({id:d.id,...san(d.data())}));base('wins',ent(wins,F.wins));draw()});
if(rl!='member')subSeason();
on(collection(db,'wiki'),q=>{wiki=q.docs.map(d=>({id:d.id,...san(d.data())}));base('wiki',ent(wiki,F.wiki));draw()});
on(query(collection(db,'wrev'),orderBy('at','desc'),limit(40)),q=>{wrRecent=q.docs.map(d=>({id:d.id,...san(d.data(),['text'])}));mergeWr();draw()},e);
onWikiOpen=()=>{tab='Wiki';if(wsub){wsub();wsub=null}wrPage=[];if(!wcur){mergeWr();return}const id=wcur;wsub=onSnapshot(query(collection(db,'wrev'),where('page','==',id)),q=>{wrPage=q.docs.map(d=>({id:d.id,...san(d.data(),['text'])}));mergeWr();draw()},e)};unsub.push(()=>{if(wsub)wsub()})}
/* The head mentor's id is saved once, so only she can delete attendance records. */
let claimTried=false;
async function claimHead(){if(claimTried||headUid||!real||myRole!='owner')return;const h=people.find(p=>p.ti=='Head mentor');if(!h)return;claimTried=true;try{await setDoc(doc(db,'config','main'),{headMentorUid:h.id},{merge:true})}catch(e){console.error(e)}}
async function newRetro(name){const old=retro.round,nr=uidn(),sv=l=>l.map(i=>({...i,votes:new Array((i.votes||[]).length).fill('')}));
await setDoc(doc(db,'rounds',old),{name:retro.name,at:Date.now(),k:sv(retro.k),a:sv(retro.a),f:sv(retro.f),ai:retro.ai.map(i=>({...i,votes:[]}))});
for(const i of retro.ai.filter(i=>!i.done))await setDoc(doc(db,'ritems',uidn()),{type:'ai',round:nr,text:i.text,sub:'',votes:[],by:i.by||'',done:false,carried:true,claim:i.claim||''});
await setDoc(doc(db,'retro','meta'),{name:name||'Retrospective',lock:true,editor:null,round:nr})}
/* New logins are made with a second copy of the app, so the owner stays signed in. */
async function newLogin(email,pin){app2=app2||initializeApp(cfg,'second');const a=getAuth(app2);const c=await createUserWithEmailAndPassword(a,email,pin);await signOut2(a);return c.user.uid}
const signOut2=a=>fbSignOut(a);
async function mkUser(n,r,ti,t,g,lim){let u,id,pin=mkpin();for(let k=0;k<5;k++){u=mkuser();try{id=await newLogin(u+DOM,pin);break}catch(err){if(err.code!='auth/email-already-in-use'||k==4)throw err}}await setDoc(doc(db,'users',id),{n,r,ti,t,g,lim:lim||null,added:TODAY,mustChange:true});return{u,pin,uid:id}}
/* A forgotten PIN gets a brand new login. Everything that pointed at the old one is moved to the new one. */
async function reissue(old){const p=byId(old);if(!p)throw new Error('That person was not found.');const pin=mkpin();let u,nu;for(let k=0;k<5;k++){u=mkuser();try{nu=await newLogin(u+DOM,pin);break}catch(err){if(err.code!='auth/email-already-in-use'||k==4)throw err}}
await setDoc(doc(db,'users',nu),{n:p.n,r:p.r,ti:p.ti,t:p.t,g:p.g,lim:p.lim||null,added:p.added||'',mustChange:true});
const W=[];
for(const k of tasks){const u2={};if(k.who==old)u2.who=nu;if((k.help||[]).some(h=>h.id==old)){const m=Object.fromEntries((k.help||[]).map(h=>[h.id==old?nu:h.id,h.r]));u2.helpMap=m}if(Object.keys(u2).length)W.push(updateDoc(doc(db,'tasks',k.id),u2))}
for(const r of reqs){const u2={};if(r.by==old)u2.by=nu;if(r.ordBy==old)u2.ordBy=nu;if(Object.keys(u2).length)W.push(updateDoc(doc(db,'reqs',r.id),u2))}
for(const d of Object.keys(att))if(att[d].includes(old)){const r=doc(db,'attendance',d);W.push(updateDoc(r,{present:arrayRemove(old)}).then(()=>updateDoc(r,{present:arrayUnion(nu)})))}
for(const d of Object.keys(av))if(av[d][old]){W.push(setDoc(doc(db,'avail',d),{[nu]:av[d][old],[old]:deleteField()},{merge:true}))}
await Promise.all(W);
await deleteDoc(doc(db,'users',old));
if(p.ti=='Head mentor'||headUid==old)await setDoc(doc(db,'config','main'),{headMentorUid:nu},{merge:true});
pins=[{n:p.n,ti:p.ti,u,pin,uid:nu}];rpnote=p.n+' has a new username and starting PIN. They are in the table below. Give both to them in person.'}
let editRid='',expd='',XLp=null;
const filesTxt=(k,ed)=>(k.files||[]).map((f,j)=>okUrl(f.url)?`<div>File: <a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${esc(f.name)}</a>${ed?` <button data-rmf="${k.id}:${j}">Remove</button>`:''}</div>`:'').join('');
const attachUI=k=>`<div class="seg">${STORAGE_ON?`<input type="file" data-up="${k.id}">`:''}<button data-link="${k.id}">Add link</button></div>`;
const SUBS_ENG=['Mechanical','Electrical','Programming'],SUBS_COMM=['Business','Imagery'];
const r2=n=>Math.round((+n||0)*100)/100;
const rqDraft={};
const reqForm=(p,r0)=>{const dr=rqDraft[p],r=dr&&dr._id==(r0.id||'new')?Object.assign({},r0,dr):r0,q=+r.qty||'',u=r.unit!=null&&r.unit!==''?+r.unit:'',ic=r2((+u||0)*(+q||0)),sh=r.ship!=null&&r.ship!==''?+r.ship:'',tx=r.tax!=null&&r.tax!==''?+r.tax:'',tot=r2(ic+(+tx||0)+(+sh||0));
return `<div data-rqf="${p}"><div class="row"><label>Item name <input id="${p}i" value="${esc(r.item||'')}" placeholder="What do you need?"></label><label>Vendor <input id="${p}v" value="${esc(r.vendor||'')}" placeholder="Where it is bought"></label></div>
<div class="row"><label style="flex:1 1 320px">Link <input id="${p}l" value="${esc(r.link||'')}" placeholder="https://..." style="width:100%"></label><label>Subteam requesting <select id="${p}s">${subOpts(r.sub)}</select></label></div>
<div class="row"><label>Quantity <input id="${p}q" class="rqc" type="number" min="1" step="1" value="${q}" style="width:90px"></label><label>Unit cost $ <input id="${p}u" class="rqc" type="number" min="0" step="0.01" value="${u}" style="width:110px"></label><label>Item cost $ (unit x quantity) <input id="${p}ic" type="number" value="${ic?ic.toFixed(2):''}" style="width:120px" readonly tabindex="-1"></label></div>
<div class="row"><label>Shipping $ <input id="${p}sh" class="rqc" type="number" min="0" step="0.01" value="${sh}" placeholder="0 if free" style="width:110px"></label><label>Tax % <input id="${p}tp" class="rqc" type="number" min="0" max="30" step="0.001" value="${r.taxp!=null&&r.taxp!==''?+r.taxp:''}" placeholder="0 if none" style="width:100px"></label><label>Tax $ (of item cost) <input id="${p}tx" type="number" value="${tx!==''?(+tx).toFixed(2):''}" style="width:110px" readonly tabindex="-1"></label><label>Total $ <input id="${p}c" type="number" value="${tot?tot.toFixed(2):''}" style="width:120px" readonly tabindex="-1"></label></div>
<div class="row"><label>Priority <select id="${p}p">${['High','Medium','Low'].map(x=>`<option value="${x}" ${(r.prio||'Medium')==x?'selected':''}>${x}${x=='High'?': needed soon':x=='Low'?': can wait':''}</option>`).join('')}</select></label><label>Order by <input id="${p}o" type="date" value="${esc(r.orderBy||'')}"></label><label>Needs to arrive by <input id="${p}n" type="date" value="${esc(r.needBy||'')}"></label></div>
<div class="row"><label style="flex:1 1 320px">Special notes for delivery (type None if there are none) <input id="${p}t" value="${esc(r.note||'')}" placeholder="None" style="width:100%"></label></div><div class="row"><label style="flex:1 1 320px">Notes for the people reviewing this request <span class="mut">(optional, not an ordering instruction)</span><textarea id="${p}x" rows="2" maxlength="500" style="width:100%" placeholder="Anything the directors, treasurer or mentors should know">${esc(r.info||'')}</textarea></label></div></div>`};
function readReq(p){const g=i=>(document.getElementById(p+i)||{}).value||'';rqDraft[p]={_id:p=='rq'?'new':editRid,item:g('i'),vendor:g('v'),link:g('l'),sub:g('s'),qty:g('q'),unit:g('u'),ship:g('sh'),taxp:g('tp'),tax:g('tx'),note:g('t'),info:g('x'),prio:g('p'),orderBy:g('o'),needBy:g('n')};const n=i=>g(i)===''?NaN:+g(i),sub=g('s'),item=g('i').trim(),vendor=g('v').trim(),link=g('l').trim(),qty=n('q'),unit=n('u'),ship=n('sh'),taxp=n('tp'),note=g('t').trim();
if(!item)return{err:'Please give the item name.'};if(!vendor)return{err:'Please give the vendor.'};if(!/^https?:\/\/\S+$/i.test(link))return{err:'Please give the link, starting with https://'};
if(!(qty>=1)||qty!=Math.floor(qty))return{err:'Quantity must be a whole number, 1 or more.'};if(!(unit>0))return{err:'Please give the unit cost.'};
if(isNaN(ship)||ship<0)return{err:'Please give the shipping cost. Type 0 if there is none.'};if(isNaN(taxp)||taxp<0||taxp>30)return{err:'Please give the tax percentage. Type 0 if there is none.'};
if(!note)return{err:'Please fill in special notes for delivery. Type None if there are none.'};
const icost=r2(unit*qty),tax=r2(icost*taxp/100),cost=r2(icost+tax+ship);if(!(cost>0&&cost<100000))return{err:'That total is not a valid amount.'};
delete rqDraft[p];return{o:{kind:SUBS_ENG.includes(sub)?'eng':'comm',sub,item,vendor,link,qty,unit:r2(unit),icost,taxp:r2(taxp*1000)/1000,tax,ship:r2(ship),cost,prio:g('p'),orderBy:g('o'),needBy:g('n'),note,info:g('x').trim().slice(0,500)}}}
const subOpts=sel=>`<optgroup label="Engineering parts or machinery">${SUBS_ENG.map(x=>`<option ${sel==x?'selected':''}>${x}</option>`).join('')}</optgroup><optgroup label="Communications">${SUBS_COMM.map(x=>`<option ${sel==x?'selected':''}>${x}</option>`).join('')}</optgroup>`;
const reqEditForm=r=>`<div class="card"><b>Edit request</b>${reqForm("eq",r)}<div class="row"><button class="sel" data-rsave="${r.id}">Save changes</button><button data-rcancel>Cancel</button></div></div>`;
const reqActs=r=>{const m=me(),mine=r.by==m.id&&r.status=='pending',dir=canApprove(m,r.kind)&&['pending','approved'].includes(r.status);let b='';if(mine||dir)b+=`<button data-red="${r.id}">Edit</button> `;if(mine)b+=`<button data-rwd="${r.id}">Withdraw request</button>`;return b?`<p>${b}</p>`:''};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;let hit=1;
if(d.red)editRid=d.red;
else if('rcancel' in d)editRid='';
else if(d.rwd){const r=reqs.find(r=>r.id==d.rwd);if(r&&r.status=='pending'&&r.by==cur){r.status='withdrawn';ev('Withdrew the parts request "'+r.item+'"')}}
else if(d.rsave){const r=reqs.find(r=>r.id==d.rsave),q=readReq('eq');if(q.err)msg=q.err;else{Object.assign(r,q.o);editRid='';ev('Edited the parts request "'+q.o.item+'"')}}
else hit=0;
if(hit)render()});
const dstr=ms=>new Date(ms).toLocaleDateString('en-CA');
const getXL=()=>XLp||(XLp=import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs'));
async function logsFor(a,b){const d0=new Date(a+'T00:00:00'),d1=new Date(b+'T00:00:00');d1.setDate(d1.getDate()+1);const q=await getDocs(query(collection(db,'log'),where('at','>=',d0.getTime()),where('at','<',d1.getTime()),orderBy('at')));return q.docs.map(d=>({id:d.id,...san(d.data())}))}
async function buildXlsx(day,logs){const pres=att[day]||[],all=people.filter(p=>!isMentor(p)).sort((a,b)=>a.n.localeCompare(b.n)),here=all.filter(p=>pres.includes(p.id)).length,rec=!!att[day],upd=tasks.filter(k=>k.didOn==day),dl=logs.filter(e=>dstr(e.at)==day).sort((a,b)=>a.at-b.at),tk=id=>(tasks.find(k=>k.id==id)||{}).x||'',
NAVY='17375E',long=new Date(day+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}),
T1={b:1,sz:22,c:'FFFFFF',bg:NAVY,al:'left'},T2={sz:13,c:'FFFFFF',bg:'2B5C93',al:'left'},bl=(n,s)=>Array.from({length:n},()=>({v:'',s})),
H=t=>({v:t,s:{b:1,c:'FFFFFF',bg:NAVY,al:'center',bd:1,sz:12,wrap:1}}),
STC={done:{bg:'D4EFD9',c:'1B7A4A'},blocked:{bg:'FAD7D7',c:'C62828'},progress:{bg:'DDEBF7',c:'1F5FA8'},todo:{bg:'EEF1F5',c:'4A5568'}},
RSC={pending:{bg:'FFF2CC',c:'8A6100'},approved:{bg:'D4EFD9',c:'1B7A4A'},rejected:{bg:'FAD7D7',c:'C62828'},ordered:{bg:'DDEBF7',c:'1F5FA8'},delegated:{bg:'E4DFEC',c:'5B3F8C'},inprogress:{bg:'DDEBF7',c:'1F5FA8'},withdrawn:{bg:'EEF1F5',c:'4A5568'}},
// cols: [{t:header,w:width,wrap?,al?,nf?,col?:row=>{bg,c}}]; data: array of arrays
sheet=(name,title,note,cols,data,empty)=>{const n=cols.length,rows=[{h:38,cells:[{v:'  '+title,s:T1},...bl(n-1,T1)]},{h:24,cells:[{v:'  '+note,s:T2},...bl(n-1,T2)]},{h:10,cells:bl(n)},{h:30,cells:cols.map(c=>H(c.t))}];
data.forEach((r,i)=>{const z=i%2?'F4F7FB':'FFFFFF';rows.push({cells:cols.map((c,j)=>{const v=r[j],x=c.col&&c.col(r,v);return{v:v==null?'':v,s:{bd:1,bg:z,al:c.al||'left',wrap:c.wrap?1:0,nf:c.nf||0,b:j==c.bold?1:0,...(x||{})}}})})});
if(!data.length)rows.push({h:26,cells:[{v:'  '+(empty||'Nothing recorded.'),s:{c:'6B7686',al:'left'}},...bl(n-1)]});
return{name,cols:cols.map(c=>c.w),rows,merges:['A1:'+XW.colL(n-1)+'1','A2:'+XW.colL(n-1)+'2'],freeze:{r:4},filter:data.length?'A4:'+XW.colL(n-1)+(4+data.length):''}},
G={bg:'E5F4E4',c:'1B7A4A',al:'center'},R={bg:'FBEBEB',c:'C62828',al:'center'},Bl={bg:'E7F1FB',c:NAVY,al:'center'},Am={bg:'FFF2CC',c:'8A6100',al:'center'},Pu={bg:'E4DFEC',c:'5B3F8C',al:'center'};
// Summary: three rows of two-column tiles
const blocked=tasks.filter(k=>k.s=='blocked').length;
const sm=[{h:38,cells:[{v:'  Saints 1899 Team Hub records',s:T1},...bl(5,T1)]},{h:24,cells:[{v:'  '+long,s:T2},...bl(5,T2)]},{h:10,cells:bl(6)}];
const trio=(items)=>{sm.push({h:22,cells:items.flatMap(([l,v,S])=>[{v:l,s:{...S,b:1,sz:11}},{v:'',s:S}])});sm.push({h:44,cells:items.flatMap(([l,v,S])=>[{v:v,s:{...S,b:1,sz:28}},{v:'',s:S}])});sm.push({h:12,cells:bl(6)})};
trio([['PRESENT',rec?here:'-',G],['ABSENT',rec?all.length-here:'-',R],['ATTENDANCE',rec&&all.length?Math.round(here/all.length*100)+'%':'-',Bl]]);
trio([['TASK UPDATES TODAY',upd.length,Bl],['TASKS BLOCKED NOW',blocked,blocked?R:G],['CHANGES TODAY',dl.length,Pu]]);
const info=(k,v)=>sm.push({h:22,cells:[{v:'  '+k,s:{b:1,bg:'F4F7FB',bd:1,al:'left'}},{v:'',s:{bg:'F4F7FB',bd:1}},{v:v,s:{bd:1,al:'left'}},...bl(3,{bd:1})]});
info('Date',fl(day));info('Downloaded',new Date().toLocaleString());info('Attendance recorded',rec?'Yes':'No');info('Open parts requests',reqs.filter(r=>['pending','approved','ordered','delegated','inprogress'].includes(r.status)).length);
const s0={name:'Summary',cols:[18,12,18,12,18,12],rows:sm,merges:['A1:F1','A2:F2',...[4,7].flatMap(r=>['A'+r+':B'+r,'C'+r+':D'+r,'E'+r+':F'+r,'A'+(r+1)+':B'+(r+1),'C'+(r+1)+':D'+(r+1),'E'+(r+1)+':F'+(r+1)]),...[10,11,12,13].map(r=>'A'+r+':B'+r),...[10,11,12,13].map(r=>'C'+r+':F'+r)]};
const sub=p=>p.t||(p.g=='eng'?'Engineering':p.g=='comm'?'Communications':'');
const upCols=[{t:'Section',w:16},{t:'Task',w:36,wrap:1,bold:1},{t:'Assigned to',w:24},{t:'Status',w:22,al:'center'},{t:'Due date',w:12,al:'center'},{t:'What was done',w:50,wrap:1},{t:'Plan for next meeting',w:40,wrap:1},{t:'Last change',w:40,wrap:1}];
const sh=[s0,attSheets(day,1)[0],null];
// status colour needs the raw status
sh[2]=(()=>{const cols=upCols.map(c=>c.t=='Status'?{...c,col:(r)=>{const k=r.__s;return k&&STC[k]?{...STC[k],al:'center',b:1}:null}}:c),data=upd.map(k=>{const r=[k.t,k.x,k.who?nameOf(k.who):'Unassigned',SL[k.s],k.due||'',k.did||'',k.plan||'',k.lc?k.lc.text+' ('+k.lc.by+')':''];r.__s=k.s;return r});return sheet('Task updates','Task updates','Tasks with a daily update on this date.',cols,data,'No task updates on this date.')})();
const allCols=[{t:'Section',w:16},{t:'Task',w:36,wrap:1,bold:1},{t:'Assigned to',w:24},{t:'Status',w:22,al:'center',col:r=>r.__s&&STC[r.__s]?{...STC[r.__s],al:'center',b:1}:null},{t:'Days left',w:10,al:'center'},{t:'Due date',w:12,al:'center'},{t:'Last update',w:14,al:'center'},{t:'What was done',w:50,wrap:1},{t:'Plan for next meeting',w:40,wrap:1},{t:'Asked for help',w:28,wrap:1},{t:'Last change',w:40,wrap:1},{t:'Changed by',w:24},{t:'Changed at',w:22}];
sh.push(sheet('All tasks','All tasks','Every task right now, colored by status.',allCols,tasks.map(k=>{const r=[k.t,k.x,k.who?nameOf(k.who):'Unassigned',SL[k.s],k.s=='progress'?k.d:'',k.due||'',k.didOn||'',k.did||'',k.plan||'',(k.help||[]).map(h=>nameOf(h.id)).join(', '),k.lc?k.lc.text:'',k.lc?k.lc.by:'',k.lc?new Date(k.lc.at).toLocaleString():''];r.__s=k.s;return r}),'No tasks yet.'));
sh.push(sheet('Change history','Change history','Everything that changed on this date, in order.',[{t:'Time',w:14,al:'center'},{t:'Who',w:30,bold:1},{t:'What',w:60,wrap:1},{t:'Task',w:36,wrap:1}],dl.map(e=>[new Date(e.at).toLocaleTimeString(),e.by,e.text,tk(e.tid)]),'No changes recorded on this date.'));
sh.push(sheet('Mentors','Mentors','Mentors who can help on this date.',[{t:'Mentor',w:28,bold:1},{t:'Can mentor from',w:18,al:'center'},{t:'Until',w:14,al:'center'}],Object.keys(av[day]||{}).map(i=>[nameOf(i),av[day][i].from,av[day][i].to]),'No mentors signed up for this date.'));
sh.push(sheet('Events','Events','Events on this date.',[{t:'Event',w:30,bold:1,wrap:1},{t:'Time',w:16,al:'center'},{t:'Details',w:60,wrap:1},{t:'Added by',w:24}],events.filter(e=>e.date==day).map(e=>[e.title,e.time||'',e.plan||'',e.by||'']),'No events on this date.'));
const $f='"$"#,##0.00',cur=x=>x==null||x===''?'':+x;
sh.push(sheet('Parts requests','Parts requests','All requests, colored by where they are in the process.',[{t:'Item',w:32,wrap:1,bold:1},{t:'Vendor',w:18},{t:'Subteam',w:14},{t:'Type',w:30,wrap:1},{t:'Requested by',w:24},{t:'Priority',w:10,al:'center',col:r=>({High:{bg:'FAD7D7',c:'C62828',b:1},Medium:{bg:'FFF2CC',c:'8A6100',b:1},Low:{bg:'D4EFD9',c:'1B7A4A',b:1}})[r[5]]},{t:'Qty',w:8,al:'center'},{t:'Unit cost',w:12,nf:7,al:'right'},{t:'Item cost',w:12,nf:7,al:'right'},{t:'Tax %',w:8,al:'center'},{t:'Tax',w:11,nf:7,al:'right'},{t:'Shipping',w:11,nf:7,al:'right'},{t:'Total cost',w:13,nf:7,al:'right',col:()=>({b:1})},{t:'Link',w:40},{t:'Order by',w:12,al:'center'},{t:'Needed by',w:12,al:'center'},{t:'Status',w:30,wrap:1,al:'center',col:r=>r.__s&&RSC[r.__s]?{...RSC[r.__s],b:1}:null},{t:'Delivery notes',w:40,wrap:1},{t:'Notes for reviewers',w:40,wrap:1}],
reqs.map(r=>{const x=[r.item,r.vendor||'',r.sub||'',REQKIND[r.kind]||'',nameOf(r.by),r.prio,r.qty||'',cur(r.unit),cur(r.icost),r.taxp==null?'':+r.taxp,cur(r.tax),cur(r.ship),+r.cost||0,r.link||'',r.orderBy||'',r.needBy||'',RS[r.status]||r.status,r.note||'',r.info||''];x.__s=r.status;return x}),'No parts requests yet.'));
const blob=XW.book(sh),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='saints-1899-records-'+day+'.xlsx';document.body.appendChild(a);a.click();await new Promise(r=>setTimeout(r,400));URL.revokeObjectURL(a.href);a.remove()}

document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||!b.dataset.exp)return;const x=b.dataset.exp;
try{msg='Preparing the Excel file...';draw(1);
if(x=='day'){const day=$('#expd').value||TODAY;expd=day;await buildXlsx(day,await logsFor(day,day));msg=''}
else if(x=='att'){const day=((b.closest('section')||document).querySelector('input[id^=expa]')||{}).value||TODAY;expd=day;buildAttXlsx(day);msg=''}else if(x=='all'){const ds=Object.keys(att).sort();if(!ds.length)msg='There are no attendance dates yet.';else{const logs=await logsFor(ds[0],ds[ds.length-1]);for(const dd of ds){await buildXlsx(dd,logs);await new Promise(r=>setTimeout(r,500))}msg=''}}
}catch(err){msg='Could not make the Excel file: '+(err.message||err)}
draw(1)});
