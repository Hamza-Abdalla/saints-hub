/* ---- wiki admin tools ---- */
let wconf='',wbe=-1;
const wParts=b=>String(b||'').split(/(\n[ \t]*\n+)/);
function wBlockOp(m,op,i){const p=pgOf();if(!p||!isMod(m))return;const parts=wParts(p.body),bi=i*2;if(bi>=parts.length)return;const old=parts[bi];let nb;
if(op=='rm'){const rest=parts.slice();if(rest.length==1){msg='A page cannot be empty. Take the whole page down instead.';return}if(bi>0)rest.splice(bi-1,2);else rest.splice(0,2);nb=rest.join('')}
else{const v=(document.getElementById('wbet')||{}).value;if(v===undefined||!v.trim()){msg='A section cannot be empty. Use Take down to remove it.';return}parts[bi]=v.replace(/\s+$/,'');nb=parts.join('')}
if(!nb.trim()){msg='A page cannot be empty.';return}
const now=Date.now(),snip=old.replace(/[#*`>\[\]|]/g,'').trim().slice(0,40);
wrevs.push({id:wk(),page:p.id,text:nb,ua:cur,by:m.n,at:now,note:(op=='rm'?'Took down a section: ':'Edited a section: ')+snip});p.body=nb;p.eby=m.n;p.eat=now;p.n=(p.n||1)+1;wbe=-1;ev((op=='rm'?'Took down':'Edited')+' a section of the wiki page "'+p.title+'"')}
function wUndo(m){const p=pgOf();if(!p||!isMod(m))return;const rv=wrevs.filter(v=>v.page==p.id).sort((a,b)=>b.at-a.at);if(rv.length<2){msg='There is no earlier version to go back to.';return}const v=rv[1],now=Date.now();wrevs.push({id:wk(),page:p.id,text:v.text,ua:cur,by:m.n,at:now,note:'Undid the last change'});p.body=v.text;p.eby=m.n;p.eat=now;p.n=(p.n||1)+1;ev('Undid the last change on the wiki page "'+p.title+'"')}
const wkTools=pg=>{if(pg.removed)return '';const bl=wParts(pg.body).filter((x,i)=>i%2==0),rv=wrevs.filter(v=>v.page==pg.id).sort((a,b)=>b.at-a.at);
return `<details class="w-adm" ${wbe>=0?'open':''}><summary><b>Admin tools: sections and changes</b></summary><p class="mut">Take down or fix one section without touching the rest. Every change is saved in History, so it can be brought back.</p>${rv.length>1?`<p><button data-wundo>Undo the last change</button> <span class="mut">Goes back to the version before the latest edit by ${esc(rv[0].by)}, ${when(rv[0].at)}.</span></p>`:''}${bl.map((b,i)=>wbe==i?`<div class="card"><textarea id="wbet" rows="${Math.min(12,Math.max(3,b.split('\n').length+1))}" style="width:100%">${esc(b)}</textarea><p><button class="sel" data-wbsv="${i}">Save section</button> <button data-wbx>Cancel</button></p></div>`:`<div class="row"><div style="white-space:pre-wrap;max-height:120px;overflow:auto;flex:1">${esc(b.length>300?b.slice(0,300)+'...':b)}</div><span><button data-wbed="${i}">Edit</button> <button data-wbrm="${i}">Take down</button></span></div>`).join('')}</details>`};

const EVC=['#7c5cff','#12b6ee','#e8590c','#d6336c','#0ca678','#f08c00'];
const evCol=e=>{let h=0;String((e&&e.title)||'').split('').forEach(c=>{h=(h*31+c.charCodeAt(0))%997});return EVC[h%EVC.length]};

let tdet='',tdm={};
const tkRow=k=>`<div class="row"><div><b class="tk">${esc(k.x)}</b><br><span class="mut">${esc(nameOf(k.who))} (${esc(k.t)})</span></div><div>${stat(k)}${dueTxt(k)}<div class="mut">Last change ${ago((k.lc||{}).at||0)}</div></div></div>`;
const tileB=(id,n,l,c,ls)=>{const arr=Array.isArray(n)?n:null,key=id+'|'+l;tdm[key]=ls||arr||[];return `<button type="button" class="tile ${c||''} ${tdet==key?'tsel':''}" data-tl="${esc(key)}" aria-pressed="${tdet==key}"><b>${arr?arr.length:n}</b>${l}</button>`};
const tdetail=id=>{if(!tdet.startsWith(id+'|'))return '';const ls=tdm[tdet]||[];return `<section><h3>${esc(tdet.slice(id.length+1))} <span class="mut">(${ls.length})</span></h3>${ls.length?ls.map(x=>x.item?rcard(x,''):tkRow(x)).join(''):'<p class="mut">Nothing here.</p>'}<p><button data-tl="${esc(tdet)}">Close</button></p></section>`};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tl]');if(!b||screen!='app')return;e.stopPropagation();e.preventDefault();tdet=tdet==b.dataset.tl?'':b.dataset.tl;draw(1)},true);

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-risave]');if(!b)return;e.stopPropagation();e.preventDefault();okmsg='';msg='';const i=retro.ai.find(x=>x.id==b.dataset.risave),ta=document.getElementById('rid'+b.dataset.risave);if(!i||!ta||i.claim!=real||cur!=real)return;const v=ta.value.trim().slice(0,900);if(!v){msg='Say what you did on it today.';draw(1);return}i.did=v;i.didOn=TODAY;ev('Posted an update on Stand-up item: '+i.text.slice(0,60));okmsg='Update saved.';render()},true);

