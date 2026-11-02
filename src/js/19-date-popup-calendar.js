/* ---- pop-up calendar for every date field ---- */
(function(){const MN=['January','February','March','April','May','June','July','August','September','October','November','December'],pad=n=>String(n).padStart(2,'0');
const lab=v=>typeof spFmt=='function'?spFmt(v):(v||'Pick a date');
function up(root){root.querySelectorAll('input[type=date]').forEach(i=>{const v=i.value;i.type='hidden';i.value=v;const w=document.createElement('span');w.className='dfw dpw';i.parentNode.insertBefore(w,i);w.appendChild(i);const b=document.createElement('button');b.type='button';b.className='dpb';b.dataset.dfo='1';b.textContent=lab(v);w.appendChild(b)})}
function pop(w){const i=w.querySelector('input'),v=i.value,y=w._y,m=w._m,first=new Date(y,m,1),lead=first.getDay(),dim=new Date(y,m+1,0).getDate(),today=new Date().toLocaleDateString('en-CA');let cells='';for(let k=0;k<lead;k++)cells+='<span></span>';
for(let d=1;d<=dim;d++){const k=y+'-'+pad(m+1)+'-'+pad(d);cells+=`<button type="button" class="${k==v?'sel':''} ${k==today?'tdy':''}" data-dfd="${k}">${d}</button>`}
const req=i.id=='expd'||i.id=='expa';let p=w.querySelector('.dppop');if(!p){p=document.createElement('div');p.className='dppop';w.appendChild(p)}
p.innerHTML=`<div class="dphd"><button type="button" data-dfn="-1" aria-label="Previous month">&lsaquo;</button><b>${MN[m]} ${y}</b><button type="button" data-dfn="1" aria-label="Next month">&rsaquo;</button></div><div class="dpg dpwk"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div><div class="dpg">${cells}</div>${!req&&v?'<button type="button" class="dpclr" data-dfd="">Clear date</button>':''}`;
const r=p.getBoundingClientRect();if(r.right>innerWidth-8)p.style.left=Math.min(0,innerWidth-8-r.right)+'px'}
const closeAll=ex=>document.querySelectorAll('.dfw .dppop').forEach(p=>{if(!ex||p.parentNode!==ex)p.remove()});
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;const o=t.closest('[data-dfo]'),n=t.closest('[data-dfn]'),d=t.closest('[data-dfd]');
if(!o&&!n&&!d){if(!t.closest('.dfw'))closeAll();return}
const w=t.closest('.dfw');if(!w)return;const i=w.querySelector('input');e.preventDefault();e.stopPropagation();
if(o){if(w.querySelector('.dppop')){closeAll();return}closeAll();const b=i.value?new Date(i.value+'T12:00:00'):new Date();w._y=b.getFullYear();w._m=b.getMonth();pop(w)}
else if(n){let m=w._m+(+n.dataset.dfn),y=w._y;if(m<0){m=11;y--}if(m>11){m=0;y++}w._m=m;w._y=y;pop(w)}
else{const v=d.dataset.dfd;i.value=v;w.querySelector('.dpb').textContent=lab(v);closeAll();i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))}},true);
document.addEventListener('keydown',e=>{if(e.key=='Escape')closeAll()});
const app=document.getElementById('app');if(app){up(app);new MutationObserver(()=>{if(app.querySelector('input[type=date]'))up(app)}).observe(app,{childList:true,subtree:true})}})();

