/* ---- build season helpers ---- */
let sf=[];sp.qa='';sp.mv='';sp.qt='';sp.qc='Design';
const compsOf=()=>{const o=[];[1,2,3].forEach(i=>{const d=sCfg['c'+i+'d'];if(d)o.push({d,n:(sCfg['c'+i+'n']||'').trim()||'Competition '+i})});o.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0);if(!o.length&&sCfg.end)o.push({d:sCfg.end,n:'Last day of build'});return o};
const sE=()=>{const m=screen=='app'&&real?me():null;return !!m&&sEdit(m)};
const sqBar=()=>sp.qa&&sE()?`<div class="sqbar" role="region" aria-label="Quick add"><b>${spFmt(sp.qa)}</b><input id="sqt" maxlength="120" placeholder="What is happening?" value="${esc(sp.qt)}"><select id="sqc">${SEC.map(c=>`<option ${c==sp.qc?'selected':''}>${c}</option>`).join('')}</select><button class="sel" data-sqadd>Add</button><button data-sqx>Close</button></div>`:'';
function sMove(id,key){const x=season.find(i=>i.id==id);sp.mv='';if(x&&x.date!=key&&sE()){const old=x.date;x.date=key;ev('Moved "'+x.title+'" on the build season calendar from '+fd(old)+' to '+fd(key));render()}else draw(1)}
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.id)return;if(t.id=='sqt')sp.qt=t.value;else if(t.id=='sqc')sp.qc=t.value});
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.scn||!sE())return;sCfg[t.dataset.scn]=t.value.trim().slice(0,40);ev('Set a build season competition name to "'+sCfg[t.dataset.scn]+'"');render()});
document.addEventListener('click',e=>{if(screen!='app'||!real)return;const t=e.target;if(!t||!t.closest)return;
const bf=t.closest('button[data-sf],button[data-sfclr]');if(bf){e.stopPropagation();const c=bf.dataset.sf;if(c!==undefined)sf=sf.includes(c)?sf.filter(x=>x!=c):[...sf,c];else sf=[];draw(1);return}
if(!sE())return;const bt=t.closest('button');
if(bt){const d=bt.dataset;
if('sqx' in d){sp.qa='';draw(1)}else if('smvx' in d){sp.mv='';draw(1)}
else if('sqadd' in d){e.stopPropagation();const ti=(sp.qt||'').trim();if(!ti){msg='Give it a title.';draw(1);return}const c=SEC.includes(sp.qc)?sp.qc:'Other';season.push({id:uidn(),date:sp.qa,title:ti.slice(0,120),note:'',cat:c});ev('Added "'+ti+'" to the build season calendar on '+sp.qa);sp.qt='';sp.qa='';sp.add='';render()}
return}
const chip=t.closest('[data-schip]');if(chip){sp.mv=sp.mv==chip.dataset.schip?'':chip.dataset.schip;draw(1);return}
const cell=t.closest('[data-sday]');if(cell&&!t.closest('input,select,textarea,a')){const key=cell.dataset.sday;if(sp.mv){sMove(sp.mv,key);return}spSave();sp.add=key;sp.qa=key;draw(1)}},true);
document.addEventListener('dragstart',e=>{const c=e.target.closest&&e.target.closest('[data-schip]');if(!c||!sE())return;e.dataTransfer.setData('text/plain',c.dataset.schip);e.dataTransfer.effectAllowed='move';c.classList.add('drag')});
document.addEventListener('dragover',e=>{const c=e.target.closest&&e.target.closest('[data-sday]');if(c&&sE()){e.preventDefault();c.classList.add('over')}});
document.addEventListener('dragleave',e=>{const c=e.target.closest&&e.target.closest('[data-sday]');if(c)c.classList.remove('over')});
document.addEventListener('drop',e=>{const c=e.target.closest&&e.target.closest('[data-sday]');if(!c||!sE())return;e.preventDefault();c.classList.remove('over');const id=e.dataTransfer.getData('text/plain');if(id)sMove(id,c.dataset.sday)});
document.addEventListener('dragend',()=>document.querySelectorAll('.drag,.over').forEach(x=>x.classList.remove('drag','over')));

