/* ===================== Sign-in, accounts, files and exports ===================== */
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset,R=byId(real);let hit=1;
try{
if('menu' in d){document.body.classList.toggle('navopen');return}
if('signout' in d||'out' in d){await signOut('');return}
if('stay' in d){lastAct=Date.now();$('#idlewarn').hidden=true;return}
if('signin' in d){await doSignIn();return}
if('hidepins' in d){pins=null;rpnote=''}
else if('pinset' in d){const a=$('#np1').value,c=$('#np2').value,bad=weakPin(a,myRole);
if(bad)simsg=bad;else if(a!=c)simsg='The two PINs do not match.';else{await updatePassword(auth.currentUser,a);await updateDoc(doc(db,'users',real),{mustChange:false});simsg='';okmsg='Your new PIN is saved.';secEv('Chose a new PIN',{n:myName});screen='app';listen(myRole,real)}draw(1);return}
else if('pinchg' in d){const a=$('#pin0').value,n1=$('#pin1').value,n2=$('#pin2').value,bad=weakPin(n1,R.r);
if(!a)msg='Type your current PIN.';else if(bad)msg=bad;else if(n1!=n2)msg='The two new PINs do not match.';else if(n1==a)msg='Choose a PIN that is different from your current one.';
else{try{await reauthenticateWithCredential(auth.currentUser,EmailAuthProvider.credential(auth.currentUser.email,a))}catch(err){msg=err.code=='auth/too-many-requests'?'Too many tries. Wait a few minutes before trying again.':'Your current PIN is not right.';secEv('Wrong PIN entered while changing PIN',R);draw(1);return}
await updatePassword(auth.currentUser,n1);okmsg='Your PIN was changed.';secEv('Changed PIN',R);ev('Changed their own PIN')}}
else if('alset' in d){await aliasSave(false);return}else if('alclr' in d){await aliasSave(true);return}else if('pinreset' in d){const id=$('#rpwho').value;if(id&&id!=real){busy='Working...';rpnote='';draw(1);await reissue(id);busy='';secEv('PIN reset by '+R.n,byId(id)||R);ev('Reset a PIN for '+(byId(id)||{n:'someone'}).n)}}
else if('actgo' in d){const p=byId($('#actwho').value),pin=$('#actpin').value;
if(!pin)msg='Type your own PIN first.';else{try{app2=app2||initializeApp(cfg,'second');const a2=getAuth(app2);await signInWithEmailAndPassword(a2,auth.currentUser.email,pin);await fbSignOut(a2)}catch(err){msg=err.code=='auth/too-many-requests'?'Too many tries. Wait a few minutes before trying again.':'That is not your PIN.';secEv('Wrong PIN entered to act as someone',R);draw(1);return}
if(p){cur=p.id;tab='Dashboard';secEv('Started acting as '+p.n,R);ev('Started acting as '+p.n)}}}
else if(d.tool!=null){const ta=$('#wbody'),[,,a0,c]=WTOOLS[+d.tool],s0=ta.selectionStart,e0=ta.selectionEnd,sel=ta.value.slice(s0,e0),a=(s0==0||ta.value[s0-1]=='\n')?a0.replace(/^\n/,''):a0;ta.value=ta.value.slice(0,s0)+a+sel+c+ta.value.slice(e0);ta.focus();ta.selectionStart=s0+a.length;ta.selectionEnd=s0+a.length+sel.length;wkLive();return}
else if('addp' in d){msg='';const n=$('#pn').value.trim(),r=$('#pr').value,ti=$('#ptt')?$('#ptt').value.trim():'',g=r=='admin'&&$('#pg')?$('#pg').value:'',t=['member','lead'].includes(r)?$('#pt').value:'';
if(n.length>60)note='Names can be up to 60 characters.';else if(people.some(p=>p.n.toLowerCase()==n.toLowerCase()))note='Someone with that name is already on the team.';
else if(n){note='Creating the login...';draw(1);const x=await mkUser(n,r,ti||(r=='mentor'?'General mentor':''),t,g,null);note=n+' was added. Username: '+x.u+'. Starting PIN: '+x.pin+'. Give both to them in person. They choose their own PIN the first time they sign in.';ev('Added '+n+' as '+RL[r])}}
else if(d.link){const k=tasks.find(k=>k.id==d.link),u=prompt('Paste the link (Google Drive, Docs, or any web address):');if(k&&u&&okUrl(u.trim())){const n=prompt('What should this link be called?')||u;k.files=[...(k.files||[]),{name:n.trim().slice(0,80),url:u.trim()}];ev('Attached a link',k)}else if(u)msg='The link must start with http:// or https://'}
else if(d.rmf){const[i,x]=d.rmf.split(':'),k=tasks.find(k=>k.id==i);if(k){k.files=(k.files||[]).filter((_,j)=>j!=x);ev('Removed an attachment',k)}}
else hit=0}catch(err){msg=friendly(err);busy='';hit=1}
if(hit)render()});
document.addEventListener('change',async e=>{const t=e.target,d=t.dataset;let hit=1;
try{
if(t.id=='idle'){IDLE_MIN=+t.value;lastAct=Date.now();secEv('Auto sign-out changed to '+IDLE_MIN+' minutes',byId(real));ev('Changed the auto sign-out time to '+IDLE_MIN+' minutes')}
else if(t.id=='wcat'||t.name=='wtheme'){wkLive();return}
else if('roster' in d){const fl=t.files[0];if(!fl)return;busy='Creating logins, please wait...';rpnote='';draw(1);
let Rr;try{Rr=JSON.parse(await fl.text())}catch(x){throw new Error('That file is not a valid roster.json.')}
if(!Array.isArray(Rr))throw new Error('That file is not a roster.');
const todo=Rr.filter(x=>x&&x.n&&!people.some(p=>p.n==x.n));pins=[];
try{for(const r of todo){if(!(r.r in RL))throw new Error('Unknown role for '+r.n);const x=await mkUser(String(r.n).slice(0,60),r.r,String(r.ti||''),r.t||'',r.g||'',r.lim||null);pins.push({n:r.n,ti:r.ti||RL[r.r],u:x.u,pin:x.pin,uid:x.uid})}}
catch(err){msg='Stopped part way: '+friendly(err)+' The people listed below were created. Load the file again to create the rest.'}
if(!pins.length)pins=null;if(!todo.length)msg='Everyone in that file already has a login.';busy='';t.value='';claimTried=false;claimHead()}
else if(d.up){const f=t.files[0],k=tasks.find(k=>k.id==d.up);if(!f||!k)return;if(f.size>10*1024*1024)throw new Error('That file is over 10 MB.');if(!STORAGE_ON)throw new Error('File upload is not set up. Add a link instead.');msg='Uploading, please wait...';draw(1);
const {getStorage,ref,uploadBytes,getDownloadURL}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js');const stg=getStorage(app),r=ref(stg,'tasks/'+d.up+'/'+Date.now()+'-'+f.name.replace(/[^\w.\-]+/g,'_'));await uploadBytes(r,f);k.files=[...(k.files||[]),{name:f.name.slice(0,80),url:await getDownloadURL(r)}];ev('Attached a file',k);msg=''}
else hit=0}catch(err){busy='';msg=friendly(err);hit=1}
if(hit)render()});
document.addEventListener('keydown',e=>{if(e.key!='Enter')return;if(e.target.id=='sipin'||e.target.id=='lu'){e.preventDefault();doSignIn()}else if(e.target.id=='np1'||e.target.id=='np2'){e.preventDefault();const b=$('[data-pinset]');if(b)b.click()}});
