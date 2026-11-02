/* ---- attendance clock: exact check-in and check-out times ---- */
function clockMark(p){const r=doc(db,'attendance',TODAY);attT[TODAY]=attT[TODAY]||{};
if(p.in){attT[TODAY][p.id]={i:Date.now()};setDoc(r,{present:arrayUnion(p.id),times:{[p.id]:{i:Date.now()}}},{merge:true}).catch(e=>console.error(e))}
else{delete attT[TODAY][p.id];updateDoc(r,{['times.'+p.id]:deleteField()}).catch(e=>console.error(e))}}
async function clockOut(id,undo){const r=doc(db,'attendance',TODAY);attT[TODAY]=attT[TODAY]||{};const t=attT[TODAY][id]||{};
try{if(undo){await updateDoc(r,{['times.'+id+'.o']:deleteField()});delete t.o}else{const now=Date.now();await updateDoc(r,{['times.'+id+'.o']:now});t.o=now}attT[TODAY][id]=t}catch(e){msg=friendly(e)}draw(1)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-cout],[data-clo]');if(!b)return;e.stopPropagation();e.preventDefault();okmsg='';msg='';const m=me();
if(b.dataset.cout!=null){if(!(att[TODAY]||[]).includes(cur))return;coAsk=true;draw(1);return}
const p=byId(b.dataset.clo);if(!p||!chk(m,p)||!p.in)return;const t=(attT[TODAY]||{})[p.id]||{};ev(t.o?'Cleared the check-out time for '+p.n:'Marked '+p.n+' as left');clockOut(p.id,!!t.o)},true);
const coBar=()=>{if(screen!='app'||!cur)return '';const t=(attT[TODAY]||{})[cur]||{};if(!(att[TODAY]||[]).includes(cur)||t.o||effOut(TODAY,cur))return '';const me0=byId(cur);if(!me0||isMentor(me0))return '';return `<div class="cobar" role="status"><span>You are checked in${t.i?' since <b>'+new Date(t.i).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})+'</b>':''}. Leaving?</span><button class="sel" data-cout>Check out</button></div>${coAsk?coModal():''}`};

let kStep=0,kMsg='',kBusy=false,ktv='';
function keepCard(){return `<div class="dbcard c12 wipecard"><h3>Erase everything except people</h3><div class="sub">Clears all the site's content but keeps every person and their login, so everyone can sign in and start fresh. Removes tasks, attendance, wiki pages, parts requests, events, notes, the change history, the build season calendar, competition items, the retrospective and each person's current task. Kept: everyone's account, PIN, role, subteam and easy username.</div>${kStep==0?`<p><button class="wipebtn" data-kw0>Erase content, keep people...</button></p>`:kStep==1?`<p><b>Are you sure?</b> This cannot be undone. Everyone stays signed up, but all site content is gone.</p><p><button class="wipebtn" data-kw1>Yes, continue</button> <button data-kwx>Cancel</button></p>`:`<p>Type <b>ERASE</b> and enter your own PIN to finish.</p><div class="dbform"><label>Type ERASE <input id="ktype" autocomplete="off" placeholder="ERASE" value="${esc(ktv)}"></label><label>Your PIN <input id="kpin" type="password" autocomplete="current-password" class="pin"></label></div><p><button class="wipebtn" data-kwgo ${kBusy?'disabled':''}>Erase content now</button> <button data-kwx ${kBusy?'disabled':''}>Cancel</button></p>`}${kMsg?`<p><b>${esc(kMsg)}</b></p>`:''}</div>`}
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('button');if(!b||screen!='app'||!real)return;const d=b.dataset,me0=byId(real);if(!me0||me0.r!='owner'||(!('kw0' in d)&&!('kw1' in d)&&!('kwx' in d)&&!('kwgo' in d)))return;e.stopPropagation();
if('kw0' in d){kStep=1;kMsg='';draw(1);return}
if('kw1' in d){kStep=2;kMsg='';draw(1);return}
if('kwx' in d){if(kBusy)return;kStep=0;ktv='';kMsg='';draw(1);return}
if(kBusy)return;const pin=($('#kpin')||{}).value||'',tp=(($('#ktype')||{}).value||'').trim();
ktv=tp;if(tp!='ERASE'){kMsg='Type ERASE in capital letters to continue.';draw(1);return}
if(!pin){kMsg='Enter your own PIN to continue.';draw(1);return}
kBusy=true;kMsg='Checking your PIN...';draw(1);
try{await reauthenticateWithCredential(auth.currentUser,EmailAuthProvider.credential(auth.currentUser.email,pin));await auth.currentUser.getIdToken(true)}
catch(err){kBusy=false;kMsg=err.code=='auth/too-many-requests'?'Too many tries. Wait a few minutes. Nothing was erased.':'That PIN is not right. Nothing was erased.';draw(1);return}
kMsg='Erasing. Do not close this page...';draw(1);
try{const cols=['tasks','reqs','events','notes','log','wins','wiki','wrev','attendance','days','avail','retro','ritems','rounds','season','comp','cadsub','cadms'];
for(const c of cols){const sn=await getDocs(collection(db,c));const ds=sn.docs;for(let i=0;i<ds.length;i+=400){const bt=writeBatch(db);ds.slice(i,i+400).forEach(x=>bt.delete(x.ref));await bt.commit()}}
const us=people.filter(p=>p.fo);for(let i=0;i<us.length;i+=400){const bt=writeBatch(db);us.slice(i,i+400).forEach(p=>bt.update(doc(db,'users',p.id),{fo:deleteField()}));await bt.commit()}
const cs=await getDoc(doc(db,'config','main')),c0=cs.exists()?cs.data():{},nc={rule:c0.rule||2,idle:c0.idle||15};if(c0.headMentorUid)nc.headMentorUid=c0.headMentorUid;await setDoc(doc(db,'config','main'),nc);
kBusy=false;kStep=0;ktv='';kMsg='Done. All content was erased. Everyone can still sign in.';setTimeout(()=>{ev('Erased all site content and kept the people');render()},1500);draw(1)}
catch(err){kBusy=false;kMsg='Stopped part way: '+friendly(err)+' Some data may be gone. Press the button again to finish.';draw(1)}},true);

let tkDel='';
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tkdel],[data-tkdok],[data-tkdx]');if(!b)return;e.stopPropagation();e.preventDefault();okmsg='';msg='';const d=b.dataset,r0=byId(real);
if('tkdx' in d){tkDel='';draw(1);return}
const id=d.tkdel||d.tkdok,k=tasks.find(x=>x.id==id);if(!k||!r0||!(k.by==real||r0.r=='owner'))return;
if(d.tkdel){tkDel=id;draw(1);return}
tasks=tasks.filter(x=>x.id!=id);tkDel='';ev('Deleted the task "'+k.x+'"');okmsg='Task deleted.';render()},true);

const reqOpen=()=>{const m=me(),t=canOrders(m)&&!canApprove(m,'eng')&&!canApprove(m,'comm')?'Orders':'Parts requests';return `<button class="sel" data-tab="${t}">Open ${t}</button>`};
function reqNote(kind,r){const who=nameOf(cur)||'Someone',req=nameOf(r.by)||'Someone',dt=r.kind=='eng'?'Director of engineering':'Director of communications',tre=people.filter(p=>p.ti=='Treasurer'),head=people.filter(p=>p.ti=='Head mentor'),dirs=people.filter(p=>p.ti==dt),amt=money(r.cost),it='"'+r.item+'"',pe=byId(r.by),out=[];
const to=(l,t)=>l.forEach(p=>{if(p&&p.id!=cur&&p.id!=real&&!out.some(o=>o.to==p.id))out.push({to:p.id,t})});
if(kind=='new'){to(dirs,req+' requested '+it+' ('+amt+'). It needs your approval.');to(tre,'FYI: '+req+' requested '+it+' ('+amt+'). The directors are working on it. Nothing for you to do until it is approved.')}
else if(kind=='approved'){to([pe],'Your parts request '+it+' was approved by '+who+'. It goes to the head mentor to order.');to(head,it+' ('+amt+') was approved by '+who+' and is ready to order.');to(tre,'FYI: '+it+' ('+amt+') was approved by '+who+'. The head mentor will order it.')}
else if(kind=='rejected'){to([pe],'Your parts request '+it+' was not approved by '+who+'.');to(tre,'FYI: '+it+' ('+amt+') was not approved by '+who+'.')}
else if(kind=='delegated'){to([byId(r.ordBy)],who+' gave you '+it+' ('+amt+') to order. Open Orders to order it.')}
else if(kind=='ordered'){to([pe],'Your parts request '+it+' was ordered.');to(tre,'FYI: '+it+' ('+amt+') was ordered by '+who+'.');to(head,it+' was ordered by '+who+'.')}
out.forEach(o=>notes.push({id:uidn(),to:o.to,tid:r.id,kind:'req',text:o.t.slice(0,390),note:'',at:Date.now(),read:false}))}

const attExpSec=()=>`<section><h3>Attendance sheet</h3><p>A simple, colorful Excel file just for attendance. Every full name has its own cell, with green for here and red for absent, plus the exact check-in and check-out times. A second sheet shows every date side by side with each person's attendance rate.</p><div class="row"><label>Date <input type="date" id="expa2" value="${expd||TODAY}"></label><button class="sel" data-exp="att">Download attendance Excel</button></div></section>`;

