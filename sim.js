/* Sim Lab · interactive teaching simulations (Phase 1). Loaded lazily from #sim.
   All physiology models are simplified TEACHING ILLUSTRATIONS, not clinical tools. */
(function(){
const F=window.RCSF;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const zh=t=>t?`<span class="zh">${t}</span>`:"";
const fx=(x,d=1)=>Number.isFinite(x)?x.toFixed(d):"–";
const RM=()=>window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
const NS="http://www.w3.org/2000/svg";

const CSS=`
.sim-hub{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));gap:12px;margin:14px 0}
.sim-card{display:flex;gap:10px;align-items:center;padding:12px 14px;border:2px solid var(--line);border-radius:20px;background:var(--panel);color:var(--fg);text-decoration:none}
.sim-card[aria-current="true"]{border-color:var(--away);box-shadow:0 4px 0 var(--away)}
.sim-card b{display:block;font-family:var(--f-display)}.sim-card small{color:var(--muted)}
.sim-card .ico{flex:none;width:38px;height:38px;border-radius:12px;background:var(--panel-2);display:grid;place-items:center;font-size:1.2rem}
.sim-mod{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}
.sim-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}
@media(max-width:820px){.sim-grid{grid-template-columns:minmax(0,1fr)}}
.sim-fig{margin:0;min-width:0;background:var(--panel);border:2px solid var(--line);border-radius:20px;padding:10px}
.sim-fig svg{width:100%!important;max-width:540px!important;margin:0 auto;height:auto;display:block;font-family:var(--f-body)}
#pv-wig,#dp-spec{max-width:none!important}
.sim-fig figcaption{font-size:.8rem;color:var(--muted);margin-top:4px}
.sim-ax{stroke:var(--muted);stroke-width:1;fill:none}.sim-grid-l{stroke:var(--line);stroke-width:1}
.sim-t{fill:var(--fg);font-size:11px}.sim-tm{fill:var(--muted);font-size:10px}
.sim-l1{stroke:var(--away);stroke-width:2.6;fill:none}.sim-l2{stroke:var(--toward);stroke-width:2.6;fill:none}
.sim-l3{stroke:var(--cocoa);stroke-width:2.2;fill:none}.sim-l4{stroke:var(--ok);stroke-width:2.2;fill:none}
.sim-dash{stroke-dasharray:5 4}.sim-cur{stroke:var(--fg);stroke-width:1.5;stroke-dasharray:3 3}
.sim-dot{fill:var(--toward);stroke:var(--panel);stroke-width:2}
.sim-out{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px}
.sim-out div{background:var(--panel-2);border-radius:14px;padding:8px 10px}
.sim-out b{display:block;font-family:var(--f-mono);font-size:1.05rem}.sim-out span{font-size:.75rem;color:var(--muted)}
.sim-tutor{display:flex;gap:10px;align-items:flex-start;background:var(--panel);border:2px dashed var(--blush);border-radius:20px;padding:10px 12px}
.sim-tutor img{width:44px;height:40px;flex:none}
.sim-tutor p{margin:0}.sim-tutor .who{font-family:var(--f-display);font-weight:700;color:var(--cocoa);font-size:.85rem}
.sim-explain{line-height:1.6}.sim-explain li{margin:4px 0}
.sim-warn{display:inline-block;font-size:.72rem;font-weight:800;padding:1px 8px;border-radius:999px;background:var(--warn-soft);color:var(--warn);border:1px solid currentColor}
.sim-note{font-size:.8rem;color:var(--muted)}
.sim-eq{font-family:var(--f-mono);background:var(--panel-2);border-radius:12px;padding:8px 10px;overflow-x:auto;font-size:.86rem}
.sim-sev{display:flex;height:16px;border-radius:999px;overflow:hidden;border:1px solid var(--line)}
.sim-sev i{display:block}
details.sim-data summary{cursor:pointer;font-weight:700}
details.sim-data table{font-size:.82rem}
`;
function injectCSS(){if($("#sim-css"))return;const s=document.createElement("style");s.id="sim-css";s.textContent=CSS;document.head.appendChild(s)}

function slider(id,en,zht,min,max,step,val,unit){return `<label for="${id}">${en} ${zh(zht)} <output id="${id}-o" for="${id}"></output><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-unit="${unit||""}"></label>`}
function bindSliders(root,cb){const upd=()=>{$$("input[type=range]",root).forEach(i=>{const o=$("#"+i.id+"-o",root);const txt=i.value+(i.dataset.unit?" "+i.dataset.unit:"");if(o)o.textContent=txt;i.setAttribute("aria-valuetext",txt)});cb()};
 let raf=0;root.addEventListener("input",e=>{if(e.target.type==="range"){cancelAnimationFrame(raf);raf=requestAnimationFrame(upd)}});upd()}
const val=(root,id)=>parseFloat($("#"+id,root).value);
function setVal(root,id,v){const i=$("#"+id,root);if(i){i.value=v}}
function tutor(bear,who,en,zht){return `<div class="sim-tutor" aria-live="polite"><img src="img/${bear}.svg" alt="" aria-hidden="true"><div><p class="who">${who}</p><p class="tut-en">${en}</p>${zh(zht)}</div></div>`}
function setTutor(el,en,zht){const t=$(".sim-tutor",el);$(".tut-en",t).textContent=en;const z=$(".zh",t);if(z)z.textContent=zht}
function outs(list){return `<div class="sim-out" aria-live="polite">${list.map(([id,l])=>`<div><b id="${id}">–</b><span>${l}</span></div>`).join("")}</div>`}
function setOut(root,id,t){const e=$("#"+id,root);if(e)e.textContent=t}
function dataTable(rows){return `<table><thead><tr><th scope="col">Item</th><th scope="col">Value</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}</tbody></table>`}

/* tiny SVG chart helpers */
function scale(d0,d1,r0,r1){return v=>r0+(v-d0)/(d1-d0)*(r1-r0)}
function pathOf(pts,X,Y){return pts.map((p,i)=>(i?"L":"M")+X(p[0]).toFixed(1)+" "+Y(p[1]).toFixed(1)).join("")}
function axes(o){// o:{x0,x1,y0,y1,W,H,m,xt,yt,xl,yl}
 const X=scale(o.x0,o.x1,o.m[3],o.W-o.m[1]),Y=scale(o.y0,o.y1,o.H-o.m[2],o.m[0]);let s=`<g>`;
 (o.yt||[]).forEach(v=>{s+=`<line class="sim-grid-l" x1="${X(o.x0)}" x2="${X(o.x1)}" y1="${Y(v)}" y2="${Y(v)}"/><text class="sim-tm" x="${X(o.x0)-4}" y="${Y(v)+3}" text-anchor="end">${v}</text>`});
 (o.xt||[]).forEach(v=>{s+=`<text class="sim-tm" x="${X(v)}" y="${Y(o.y0)+13}" text-anchor="middle">${v}</text>`});
 s+=`<path class="sim-ax" d="M${X(o.x0)} ${Y(o.y1)}V${Y(o.y0)}H${X(o.x1)}"/>`;
 if(o.xl)s+=`<text class="sim-t" x="${(X(o.x0)+X(o.x1))/2}" y="${o.H-2}" text-anchor="middle">${o.xl}</text>`;
 if(o.yl)s+=`<text class="sim-t" transform="translate(11 ${(Y(o.y0)+Y(o.y1))/2}) rotate(-90)" text-anchor="middle">${o.yl}</text>`;
 return {X,Y,svg:s+"</g>"}}

/* ================= Module 1: PV loop + Wiggers ================= */
const PV_PRESETS={
 normal:{en:"Normal",zh:"正常",edv:120,ees:2.2,ea:2.0,k:0.030,hr:70,lesion:""},
 dcm:{en:"Dilated CM",zh:"擴張型心肌病",edv:220,ees:0.7,ea:2.2,k:0.022,hr:85,lesion:""},
 restr:{en:"Restrictive / stiff LV",zh:"限制型／僵硬左室",edv:95,ees:2.4,ea:2.2,k:0.060,hr:80,lesion:""},
 as:{en:"Aortic stenosis",zh:"主動脈瓣狹窄",edv:125,ees:2.8,ea:3.4,k:0.040,hr:70,lesion:"as"},
 ar:{en:"Chronic AR",zh:"慢性主動脈瓣反流",edv:210,ees:1.8,ea:1.3,k:0.020,hr:70,lesion:"ar"},
 mr:{en:"Chronic MR",zh:"慢性二尖瓣反流",edv:175,ees:2.0,ea:1.1,k:0.022,hr:75,lesion:"mr"}};
const PHASE={ivc:["Isovolumic contraction","等容收縮期"],eje:["Ejection","射血期"],ivr:["Isovolumic relaxation","等容舒張期"],fill:["Filling (E → diastasis → A)","充盈期（E 波 → 舒張停滯 → A 波）"]};

function pvModel(p){
 const V0=10,A=0.5,les=p.lesion;
 const edv=p.edv,esv=F.esv(edv,p.ees,p.ea,V0),pes=F.pes(edv,p.ees,p.ea,V0),edp=F.edp(edv,A,p.k,V0);
 const sv=edv-esv;const rf=les==="mr"?0.45:les==="ar"?0.40:0;
 const asg=les==="as"?45:0; // mean LV–Ao gradient used for the AS illustration (mmHg)
 const pdia=les==="ar"?Math.max(pes*0.38,35):Math.max(pes*0.62-asg*0.6,45);
 const rr=60/p.hr,et=Math.max(0.18,(413-1.7*p.hr)/1000),tivc=0.05,tivr=0.08,tfill=Math.max(0.12,rr-et-tivc-tivr);
 const N=40,loop=[],tl=[];let t=0;
 const vOpen=les==="mr"?edv-0.18*sv:edv;
 for(let i=0;i<=N;i++){const s=i/N;loop.push({v:edv+(vOpen-edv)*s,p:edp+(pdia-edp)*Math.pow(s,1.3),ph:"ivc",t:t+s*tivc})}t+=tivc;
 for(let i=1;i<=N;i++){const s=i/N;const base=pdia+(pes-pdia)*s;const bump=(Math.max(pes-pdia,10)*0.45+asg*1.2)*Math.sin(Math.PI*s);loop.push({v:vOpen+(esv-vOpen)*(1-Math.pow(1-s,1.6)),p:base+bump,ph:"eje",t:t+s*et})}t+=et;
 const pmin=Math.max(F.edp(esv,A,p.k,V0),1)+1,vClose=les==="ar"?esv+0.2*sv:esv;
 for(let i=1;i<=N;i++){const s=i/N;loop.push({v:esv+(vClose-esv)*s,p:pes+(pmin-pes)*(1-Math.pow(1-s,0.8)),ph:"ivr",t:t+s*tivr})}t+=tivr;
 for(let i=1;i<=N;i++){const s=i/N;let f;if(s<0.4)f=0.7*Math.sin(Math.PI/2*s/0.4);else if(s<0.75)f=0.7+0.05*(s-0.4)/0.35;else f=0.75+0.25*Math.sin(Math.PI/2*(s-0.75)/0.25);
  const v=vClose+(edv-vClose)*f;const dip=s<0.25?-2*Math.sin(Math.PI*s/0.25):0;loop.push({v,p:Math.max(F.edp(v,A,p.k,V0)+dip,0.5),ph:"fill",t:t+s*tfill,s})}
 // Wiggers series
 const pdic=pes*0.93;const W=loop.map(q=>{let ao;if(q.ph==="eje")ao=q.p-asg*1.6*Math.sin(Math.PI*((q.t-tivc)/et));
  else{const since=q.ph==="ivc"?(rr-et-tivc)+q.t:q.t-(tivc+et);const u=Math.min(since/(rr-et),1);ao=pdia*Math.pow(pdic/pdia,1-u)}
  let la=edp*0.8+2;if(q.ph==="fill"){la=q.p+2+(q.s>0.78?7*Math.sin(Math.PI*(q.s-0.78)/0.22):0)+(q.s<0.2?6*(1-q.s/0.2):0)}
  if(q.ph==="eje"||q.ph==="ivr"){const u=q.ph==="eje"?(q.t-tivc)/et:1+(q.t-tivc-et)/tivr*0.3;la+=(les==="mr"?28:8)*Math.min(u,1.15)}
  let mv=0,av=0;if(q.ph==="fill"){mv=q.s<0.4?0.85*Math.sin(Math.PI*q.s/0.4):q.s>0.75?0.55*Math.sin(Math.PI*(q.s-0.75)/0.25):0}
  if(q.ph==="eje"){const u=(q.t-tivc)/et;const pk=les==="as"?F.velFromGradient(asg/0.6):1.1;av=pk*Math.sin(Math.PI*Math.pow(u,les==="as"?0.85:0.7))}
  if(les==="mr"&&(q.ph!=="fill"))mv=-(q.ph==="ivc"?3.5:q.ph==="eje"?5:2)*(q.ph==="ivr"?0.5:1);
  if(les==="ar"&&q.ph==="fill")av=-(4.2-1.2*q.s);
  return {t:q.t,lv:q.p,ao,la,vol:q.v,mv,av,ph:q.ph}});
 return {loop,W,edv,esv,sv,pes,edp,pdia,ef:F.ef(edv,esv),rf,fsv:sv*(1-rf),rr,et,les,ees:p.ees,ea:p.ea,k:p.k,A,V0}}

function modPV(el){
 el.innerHTML=`<div class="sim-mod">
 <div class="row" role="group" aria-label="Preset">${Object.entries(PV_PRESETS).map(([k,v],i)=>`<button class="chip" data-pre="${k}" aria-pressed="${i===0}">${v.en} ${zh(v.zh)}</button>`).join("")}</div>
 <div class="ctrl">${slider("pv-edv","Preload · EDV","前負荷","60","260","1",120,"mL")}${slider("pv-ees","Contractility · Ees","收縮力（ESPVR 斜率）","0.4","4","0.1",2.2,"mmHg/mL")}${slider("pv-ea","Afterload · Ea","後負荷（動脈彈性）","0.8","5","0.1",2.0,"mmHg/mL")}${slider("pv-k","LV stiffness · EDPVR k","心室僵硬度","0.015","0.08","0.001",0.03,"")}${slider("pv-hr","Heart rate","心率","45","150","1",70,"bpm")}${slider("pv-t","Time in cardiac cycle","心動週期時間點","0","100","1",30,"%")}</div>
 <div class="row"><button class="btn" id="pv-play" aria-pressed="false">▶ Play cycle</button><span class="sim-note" id="pv-phase" aria-live="polite"></span></div>
 <div class="sim-grid"><figure class="sim-fig"><svg id="pv-loop" viewBox="0 0 360 300" role="img" aria-labelledby="pv-loop-t"><title id="pv-loop-t">Pressure–volume loop</title></svg><figcaption>PV loop: ESPVR (slope = Ees), EDPVR, arterial elastance line (Ea). ${zh("壓力–容積環")}</figcaption></figure>
 <figure class="sim-fig"><svg id="pv-wig" viewBox="0 0 480 420" role="img" aria-labelledby="pv-wig-t"><title id="pv-wig-t">Wiggers diagram</title></svg><figcaption>Wiggers diagram: pressures, LV volume, ECG and valve Doppler on one time axis. ${zh("Wiggers 圖：壓力、容積、心電圖及瓣膜多普勒同一時間軸")}</figcaption></figure></div>
 ${outs([["pv-o-edv","EDV mL"],["pv-o-esv","ESV mL"],["pv-o-sv","Total SV mL"],["pv-o-fsv","Forward SV mL"],["pv-o-ef","EF %"],["pv-o-pes","LV end-systolic P"],["pv-o-edp","LVEDP mmHg"],["pv-o-cp","Ea/Ees coupling"]])}
 ${tutor("bubu","Bubu says · 布布話你知","Drag the time slider: the red dot on the loop and the dashed line on the Wiggers diagram move together.","拉動時間滑桿：PV 環上的紅點與 Wiggers 圖上的虛線同步移動。")}
 <div class="panel sim-explain"><h3>Key ideas</h3><ul>
 <li>The loop runs counter-clockwise: <b>filling</b> along the EDPVR → <b>isovolumic contraction</b> (both valves shut, volume fixed) → <b>ejection</b> → <b>isovolumic relaxation</b>. ${zh("逆時針：充盈 → 等容收縮 → 射血 → 等容舒張。")}</li>
 <li><b>Ees</b> (ESPVR slope) is a load-independent index of contractility; <b>Ea</b> ≈ Pes/SV reflects afterload. ESV is set where the two lines meet. ${zh("Ees 代表收縮力，Ea 代表後負荷，兩線交點決定 ESV。")}</li>
 <li>A steeper <b>EDPVR</b> (stiff LV) means a higher LVEDP for the same volume → high E/e′, LA enlargement. ${zh("EDPVR 越陡，同樣容積下 LVEDP 越高。")}</li>
 <li><b>MR</b>: no true isovolumic contraction; total EF can look normal while <b>forward SV</b> is low. <b>AR</b>: no true isovolumic relaxation; big EDV, wide pulse pressure. <b>AS</b>: LV systolic pressure exceeds aortic pressure. ${zh("MR：無真正等容收縮，EF 看似正常但前向 SV 低；AR：無真正等容舒張，EDV 大、脈壓寬；AS：左室收縮壓高於主動脈壓。")}</li></ul>
 <p class="sim-note">Teaching illustration (time-varying elastance model with fixed shape constants); numbers are illustrative, not patient values. ${zh("教學示意模型，數值僅作說明，非臨床數據。")}</p></div>
 <details class="sim-data"><summary>Data table (text alternative) ${zh("數據表（文字版）")}</summary><div id="pv-table"></div></details></div>`;
 let preset="normal",M=null,playing=false,raf=0,t0=0;
 const draw=()=>{
  const p={edv:val(el,"pv-edv"),ees:val(el,"pv-ees"),ea:val(el,"pv-ea"),k:val(el,"pv-k"),hr:val(el,"pv-hr"),lesion:PV_PRESETS[preset].lesion};M=pvModel(p);
  const tf=val(el,"pv-t")/100;const tc=tf*M.rr;let cur=M.loop.reduce((b,q)=>Math.abs(q.t-tc)<Math.abs(b.t-tc)?q:b,M.loop[0]);
  // PV loop
  const maxP=Math.max(160,...M.loop.map(q=>q.p))*1.08,maxV=Math.max(280,M.edv*1.15);
  const ax=axes({x0:0,x1:maxV,y0:0,y1:maxP,W:360,H:300,m:[12,10,30,40],xt:[0,50,100,150,200,250].filter(v=>v<=maxV),yt:[0,50,100,150,200].filter(v=>v<=maxP),xl:"LV volume (mL)",yl:"LV pressure (mmHg)"});
  const X=ax.X,Y=ax.Y;const espvr=[[M.V0,0],[Math.min(maxV,M.V0+maxP/M.ees),Math.min(maxP,(maxV-M.V0)*M.ees)]];
  const edpvr=[];for(let v=M.V0;v<=maxV;v+=4){const pp=F.edp(v,M.A,M.k,M.V0);if(pp>maxP)break;edpvr.push([v,pp])}
  const eaL=[[M.esv,M.pes],[M.edv,0]];
  const loopPts=M.loop.map(q=>[q.v,q.p]);
  $("#pv-loop",el).innerHTML=`<title id="pv-loop-t">PV loop: EDV ${fx(M.edv,0)} mL, ESV ${fx(M.esv,0)} mL, EF ${fx(M.ef,0)}%, LVEDP ${fx(M.edp,0)} mmHg. Phase now: ${PHASE[cur.ph][0]}.</title>${ax.svg}
  <path class="sim-l3 sim-dash" d="${pathOf(espvr,X,Y)}"/><text class="sim-t" x="${X(espvr[1][0])-4}" y="${Y(espvr[1][1])+14}" text-anchor="end">ESPVR</text>
  <path class="sim-l4 sim-dash" d="${pathOf(edpvr,X,Y)}"/><text class="sim-t" x="${X(edpvr[edpvr.length-1][0])-4}" y="${Y(edpvr[edpvr.length-1][1])-4}" text-anchor="end">EDPVR</text>
  <path class="sim-ax sim-dash" d="${pathOf(eaL,X,Y)}"/><text class="sim-tm" x="${X(M.edv)+3}" y="${Y(4)}">Ea</text>
  <path class="sim-l1" d="${pathOf(loopPts,X,Y)}Z"/>
  <circle class="sim-dot" cx="${X(cur.v)}" cy="${Y(cur.p)}" r="6"/>`;
  // Wiggers
  const W=480,mL=46,mR=12,Tx=scale(0,M.rr,mL,W-mR);const rows=[[10,150,"Pressure (mmHg)"],[170,80,"LV volume"],[260,40,"ECG"],[310,95,"Valve Doppler (m/s)"]];
  let s="";const pMax=maxP;const Yp=scale(0,pMax,rows[0][0]+rows[0][1],rows[0][0]);
  const vmin=Math.min(...M.W.map(w=>w.vol)),vmax=Math.max(...M.W.map(w=>w.vol));const Yv=scale(vmin-5,vmax+5,rows[1][0]+rows[1][1],rows[1][0]);
  const dmax=Math.max(1.5,...M.W.map(w=>Math.max(Math.abs(w.mv),Math.abs(w.av))));const Yd=scale(-dmax,dmax,rows[3][0]+rows[3][1],rows[3][0]);
  rows.forEach(r=>{s+=`<text class="sim-tm" x="4" y="${r[0]+10}">${r[2]}</text><line class="sim-grid-l" x1="${mL}" x2="${W-mR}" y1="${r[0]+r[1]}" y2="${r[0]+r[1]}"/>`});
  [0,50,100,150].filter(v=>v<pMax).forEach(v=>{s+=`<text class="sim-tm" x="${mL-4}" y="${Yp(v)+3}" text-anchor="end">${v}</text>`});
  // phase shading labels
  let prev=null;M.W.forEach(w=>{if(w.ph!==prev){s+=`<line class="sim-grid-l" x1="${Tx(w.t)}" x2="${Tx(w.t)}" y1="10" y2="405"/>`;prev=w.ph}});
  const P=(k,Yf)=>M.W.map(w=>[w.t,w[k]]).map(q=>`${Tx(q[0]).toFixed(1)},${Yf(q[1]).toFixed(1)}`).join(" ");
  s+=`<polyline class="sim-l1" points="${P("lv",Yp)}"/><polyline class="sim-l2" points="${P("ao",Yp)}"/><polyline class="sim-l4" points="${P("la",Yp)}"/>`;
  s+=`<text class="sim-t" x="${W-mR}" y="22" text-anchor="end"><tspan fill="var(--away)">— LV</tspan>  <tspan fill="var(--toward)">— Aorta</tspan>  <tspan fill="var(--ok)">— LA</tspan></text>`;
  s+=`<polyline class="sim-l3" points="${P("vol",Yv)}"/>`;
  // ECG schematic
  const e0=rows[2][0]+28,et=M.et,rr=M.rr;const ecg=[];for(let i=0;i<=200;i++){const t=i/200*rr;let y=0;const g=(c,w,a)=>a*Math.exp(-(((t-c)/w)**2));
   y+=g(0.012,0.006,-3)+g(0.025,0.008,22)+g(0.04,0.007,-5)+g(0.05+et*0.85,0.04,6)+g(rr-0.12,0.025,4);ecg.push(`${Tx(t).toFixed(1)},${(e0-y).toFixed(1)}`)}
  s+=`<polyline class="sim-ax" style="stroke:var(--fg);stroke-width:1.6" points="${ecg.join(" ")}"/>`;
  s+=`<line class="sim-grid-l" x1="${mL}" x2="${W-mR}" y1="${Yd(0)}" y2="${Yd(0)}"/><polyline class="sim-l2" points="${P("mv",Yd)}"/><polyline class="sim-l1" points="${P("av",Yd)}"/>`;
  s+=`<text class="sim-t" x="${W-mR}" y="${rows[3][0]+10}" text-anchor="end"><tspan fill="var(--toward)">— Mitral</tspan>  <tspan fill="var(--away)">— Aortic</tspan></text>`;
  s+=`<text class="sim-tm" x="${(mL+W-mR)/2}" y="418" text-anchor="middle">Time (s) · RR ${fx(M.rr,2)} s</text>`;
  s+=`<line class="sim-cur" x1="${Tx(tc)}" x2="${Tx(tc)}" y1="10" y2="405"/>`;
  $("#pv-wig",el).innerHTML=`<title id="pv-wig-t">Wiggers diagram at ${fx(tc,2)} s: ${PHASE[cur.ph][0]}. LV ${fx(cur.p,0)} mmHg.</title>`+s;
  const ph=PHASE[cur.ph];$("#pv-phase",el).innerHTML=`Phase: <b>${ph[0]}</b> ${zh(ph[1])}`;
  setOut(el,"pv-o-edv",fx(M.edv,0));setOut(el,"pv-o-esv",fx(M.esv,0));setOut(el,"pv-o-sv",fx(M.sv,0));setOut(el,"pv-o-fsv",fx(M.fsv,0));setOut(el,"pv-o-ef",fx(M.ef,0));setOut(el,"pv-o-pes",fx(M.pes,0));setOut(el,"pv-o-edp",fx(M.edp,0));setOut(el,"pv-o-cp",fx(M.ea/M.ees,2));
  let en,z;if(M.les==="mr"){en=`EF ${fx(M.ef,0)}% looks fine, but ${Math.round(M.rf*100)}% of the stroke volume goes back to the LA — forward SV is only ${fx(M.fsv,0)} mL. Note the big LA v wave.`;z="EF 看似正常，但部分血液倒流左房，前向 SV 偏低；留意左房大 v 波。"}
  else if(M.les==="ar"){en="Volume overload: EDV is large and aortic diastolic pressure is low (wide pulse pressure). No true isovolumic relaxation because the leak starts at once.";z="容量負荷：EDV 大、主動脈舒張壓低；因反流即時開始，無真正等容舒張。"}
  else if(M.les==="as"){en="Pressure overload: LV systolic pressure rises well above the aortic curve — that gap is the transvalvular gradient.";z="壓力負荷：左室收縮壓明顯高於主動脈壓，差距即跨瓣壓差。"}
  else if(M.edp>18){en=`LVEDP is ${fx(M.edp,0)} mmHg — a stiff or overfilled LV. Echo clue: raised E/e′ and a big LA.`;z="LVEDP 高：心室僵硬或過度充盈，超聲見 E/e′ 升高、左房擴大。"}
  else if(M.ef<40){en=`Low Ees (flat ESPVR) → ESV rises and EF falls to ${fx(M.ef,0)}%. The LV dilates to keep SV up (Frank–Starling).`;z="Ees 低 → ESV 增加、EF 下降；心室擴大以維持 SV（Frank–Starling）。"}
  else{en="Raise Ea (afterload): ESV rises and SV falls. Raise Ees: the loop widens to the left.";z="提高 Ea：ESV 增加、SV 減少；提高 Ees：環向左擴闊。"}
  setTutor(el,en,z);
  $("#pv-table",el).innerHTML=dataTable([["Phase now",ph[0]],["EDV / ESV",`${fx(M.edv,0)} / ${fx(M.esv,0)} mL`],["SV (total / forward)",`${fx(M.sv,0)} / ${fx(M.fsv,0)} mL`],["EF",fx(M.ef,0)+" %"],["LV end-systolic pressure",fx(M.pes,0)+" mmHg"],["Aortic diastolic pressure",fx(M.pdia,0)+" mmHg"],["LVEDP",fx(M.edp,0)+" mmHg"],["Ejection time",fx(M.et*1000,0)+" ms"]]);
 };
 $$("[data-pre]",el).forEach(b=>b.addEventListener("click",()=>{preset=b.dataset.pre;const P=PV_PRESETS[preset];$$("[data-pre]",el).forEach(x=>x.setAttribute("aria-pressed",x===b));setVal(el,"pv-edv",P.edv);setVal(el,"pv-ees",P.ees);setVal(el,"pv-ea",P.ea);setVal(el,"pv-k",P.k);setVal(el,"pv-hr",P.hr);$("#pv-edv",el).dispatchEvent(new Event("input",{bubbles:true}))}));
 const play=$("#pv-play",el);
 play.addEventListener("click",()=>{const ti=$("#pv-t",el);
  if(RM()){ti.value=(+ti.value+12.5)%100;ti.dispatchEvent(new Event("input",{bubbles:true}));return}
  playing=!playing;play.setAttribute("aria-pressed",playing);play.textContent=playing?"⏸ Pause":"▶ Play cycle";
  const step=ts=>{if(!playing||!el.isConnected){playing=false;return}if(!t0)t0=ts;const dt=ts-t0;t0=ts;ti.value=(+ti.value+dt/(M.rr*1000)*100*0.5)%100;ti.dispatchEvent(new Event("input",{bubbles:true}));raf=requestAnimationFrame(step)};t0=0;if(playing)raf=requestAnimationFrame(step)});
 if(RM())play.textContent="⏭ Next step";
 bindSliders(el,draw);
}

/* ================= Module 2: PISA / EROA ================= */
function modPISA(el){
 el.innerHTML=`<div class="sim-mod">
 <div class="ctrl">${slider("pi-va","Aliasing velocity Va (after baseline shift)","混疊速度","20","70","1",40,"cm/s")}${slider("pi-eroa","True EROA","真實有效反流口面積","0.05","0.8","0.01",0.35,"cm²")}${slider("pi-dp","LV–LA systolic gradient","左室–左房收縮期壓差","50","160","1",100,"mmHg")}${slider("pi-vti","MR VTI","MR 速度時間積分","80","220","1",150,"cm")}${slider("pi-err","Radius measuring error","半徑量度誤差","-2","2","0.5",0,"mm")}</div>
 <div class="sim-grid"><figure class="sim-fig"><svg id="pi-fig" viewBox="0 0 360 260" role="img" aria-labelledby="pi-fig-t"><title id="pi-fig-t">PISA hemisphere</title></svg><figcaption>Colour flow converging on the regurgitant orifice: the first aliasing shell has radius r. ${zh("血流向反流口匯聚，第一個混疊半球的半徑為 r。")}</figcaption></figure>
 <figure class="sim-fig"><svg id="pi-err-fig" viewBox="0 0 420 260" role="img" aria-labelledby="pi-err-t"><title id="pi-err-t">EROA error vs radius error</title></svg><figcaption>Because EROA ∝ r², a 1 mm radius error changes EROA a lot. ${zh("EROA 與 r² 成正比，1 mm 誤差影響很大。")}</figcaption></figure></div>
 <div class="sim-eq" id="pi-eq" aria-live="polite"></div>
 <div><span class="label">Severity (primary MR, ASE 2017)</span><div class="sim-sev" aria-hidden="true"><i style="width:25%;background:var(--ok-soft)"></i><i style="width:25%;background:var(--warn-soft)"></i><i style="width:50%;background:var(--toward-soft)"></i></div><div id="pi-mark" class="sim-note"></div></div>
 ${outs([["pi-o-r","Measured r (cm)"],["pi-o-flow","Flow (mL/s)"],["pi-o-vmax","MR Vmax (m/s)"],["pi-o-eroa","EROA (cm²)"],["pi-o-rv","RVol (mL)"],["pi-o-g","Grade"]])}
 ${tutor("dudu","Dudu says · 一二話你知","Lower the aliasing velocity (baseline shift toward the jet): the shell grows, so r is easier to measure — but EROA stays the same.","降低混疊速度（基線向射流方向移）：半球變大、r 較易量度，但 EROA 不變。")}
 <div class="panel sim-explain"><h3>Key ideas</h3><ul>
 <li>Flow is conserved: all blood crossing the hemisphere (2πr² × Va) must pass through the orifice (EROA × Vmax). ${zh("流量守恆：通過半球的流量等於通過反流口的流量。")}</li>
 <li>Measure r at mid-systole, from the first aliasing line to the orifice, zoomed, with baseline shifted toward the jet (Va ≈ 30–40 cm/s). ${zh("收縮中期量度，放大影像並把基線移向射流方向。")}</li>
 <li>Pitfalls: non-hemispheric (flattened) shells, eccentric jets, constrained by walls, mid/late-systolic MR (use the same frame for r and Vmax). ${zh("陷阱：半球扁平、偏心射流、受壁限制、收縮中晚期 MR。")}</li>
 <li>Primary MR (ASE 2017): EROA ≥0.40 cm² or RVol ≥60 mL = severe; EROA &lt;0.20 or RVol &lt;30 = mild. Secondary MR: ASE 2017 uses the same cut-offs; some guidelines (ESC) use EROA ≥0.20 / RVol ≥30 — <span class="sim-warn">待核實 local lab</span> ${zh("原發性 MR：EROA ≥0.40 或 RVol ≥60 為嚴重。繼發性 MR 各指引閾值不同，請按所屬化驗室標準。")}</li></ul>
 <p class="sim-note">Teaching illustration: idealised hemispheric convergence, no angle correction. ${zh("教學示意：理想半球匯聚模型。")}</p></div>
 <details class="sim-data"><summary>Data table (text alternative) ${zh("數據表（文字版）")}</summary><div id="pi-table"></div></details></div>`;
 const draw=()=>{const va=val(el,"pi-va"),eroaT=val(el,"pi-eroa"),dp=val(el,"pi-dp"),vti=val(el,"pi-vti"),err=val(el,"pi-err");
  const vmax=F.velFromGradient(dp)*100;const r=F.pisaRadius(eroaT,vmax,va);const rm=Math.max(0.05,r+err/10);const flow=F.pisaFlow(rm,va);const e=F.eroa(rm,va,vmax);const rv=F.rvol(e,vti);const g=F.mrGrade(e);
  // hemisphere drawing: orifice at (180,215); px per cm
  const cx=180,cy=215,ppc=100;let s=`<line x1="20" x2="340" y1="${cy}" y2="${cy}" stroke="var(--fg)" stroke-width="4"/><text class="sim-tm" x="24" y="${cy+16}">Mitral leaflets (LV side above) · 二尖瓣</text>`;
  for(let k=4;k>=1;k--){const vk=va*k*0.5;const rk=Math.sqrt(flow/(2*Math.PI*vk))*ppc;if(rk>170)continue;s+=`<path d="M${cx-rk} ${cy}A${rk} ${rk} 0 0 1 ${cx+rk} ${cy}" fill="${k%2?"var(--toward-soft)":"var(--away-soft)"}" stroke="${k===2?"var(--away)":"var(--line)"}" stroke-width="${k===2?3:1}"/>`}
  const rp=r*ppc;s+=`<path d="M${cx-rp} ${cy}A${rp} ${rp} 0 0 1 ${cx+rp} ${cy}" fill="none" stroke="var(--away)" stroke-width="3"/>`;
  s+=`<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-rm*ppc}" stroke="var(--toward)" stroke-width="2.5"/><circle cx="${cx}" cy="${cy-rm*ppc}" r="4" fill="var(--toward)"/><text class="sim-t" x="${cx+6}" y="${cy-rm*ppc/2}">r = ${fx(rm,2)} cm${err?" (measured)":""}</text>`;
  s+=`<rect x="${cx-4}" y="${cy-3}" width="8" height="6" fill="var(--fg)"/><path d="M${cx} ${cy+4}V${cy+40}" stroke="var(--toward)" stroke-width="5" marker-end=""/><text class="sim-tm" x="${cx+8}" y="${cy+36}">jet to LA, Vmax ${fx(vmax/100,1)} m/s</text>`;
  $("#pi-fig",el).innerHTML=`<title id="pi-fig-t">PISA radius ${fx(rm,2)} cm at aliasing velocity ${va} cm/s; EROA ${fx(e,2)} cm², ${g}.</title>`+s;
  // error chart
  const ax=axes({x0:-2,x1:2,y0:0,y1:Math.max(1,eroaT*2.2),W:420,H:260,m:[12,12,32,42],xt:[-2,-1,0,1,2],yt:[0,.2,.4,.6,.8,1,1.2,1.4,1.6].filter(v=>v<=Math.max(1,eroaT*2.2)),xl:"Radius error (mm)",yl:"Calculated EROA (cm²)"});
  const pts=[];for(let x=-2;x<=2.001;x+=0.1){pts.push([x,F.eroa(Math.max(0.05,r+x/10),va,vmax)])}
  let s2=ax.svg+`<line class="sim-l2 sim-dash" x1="${ax.X(-2)}" x2="${ax.X(2)}" y1="${ax.Y(0.4)}" y2="${ax.Y(0.4)}"/><text class="sim-t" x="${ax.X(-1.95)}" y="${ax.Y(0.4)-4}">severe ≥0.40</text><line class="sim-l4 sim-dash" x1="${ax.X(-2)}" x2="${ax.X(2)}" y1="${ax.Y(0.2)}" y2="${ax.Y(0.2)}"/><text class="sim-t" x="${ax.X(-1.95)}" y="${ax.Y(0.2)-4}">mild &lt;0.20</text>`;
  s2+=`<path class="sim-l1" d="${pathOf(pts,ax.X,ax.Y)}"/><circle class="sim-dot" cx="${ax.X(err)}" cy="${ax.Y(e)}" r="6"/>`;
  $("#pi-err-fig",el).innerHTML=`<title id="pi-err-t">At ${err} mm radius error, EROA reads ${fx(e,2)} versus true ${fx(eroaT,2)} cm² (${fx((e/eroaT-1)*100,0)}%).</title>`+s2;
  $("#pi-eq",el).innerHTML=`Flow = 2π × r² × Va = 2π × ${fx(rm,2)}² × ${va} = <b>${fx(flow,0)} mL/s</b><br>EROA = Flow ÷ Vmax = ${fx(flow,0)} ÷ ${fx(vmax,0)} cm/s = <b>${fx(e,2)} cm²</b><br>RVol = EROA × VTI = ${fx(e,2)} × ${vti} = <b>${fx(rv,0)} mL</b><br>Vmax = √(ΔP ÷ 4) = √(${dp} ÷ 4) = ${fx(vmax/100,2)} m/s`;
  $("#pi-mark",el).textContent=`EROA ${fx(e,2)} cm² → ${g} (bar: mild <0.20 | moderate | severe ≥0.40)`;
  setOut(el,"pi-o-r",fx(rm,2));setOut(el,"pi-o-flow",fx(flow,0));setOut(el,"pi-o-vmax",fx(vmax/100,2));setOut(el,"pi-o-eroa",fx(e,2));setOut(el,"pi-o-rv",fx(rv,0));setOut(el,"pi-o-g",g+" / RVol "+F.mrGradeRVol(rv));
  if(err)setTutor(el,`A ${err>0?"+":""}${err} mm error in r changes EROA by ${fx((e/eroaT-1)*100,0)}% — always zoom and measure carefully.`,"r 的少量誤差會令 EROA 大幅偏差——必須放大影像小心量度。");
  else if(F.mrGrade(e)!==F.mrGradeRVol(rv))setTutor(el,"EROA and RVol disagree here — integrate other signs (vena contracta, pulmonary vein flow, LA/LV size).","EROA 與 RVol 分級不一致——要綜合其他指標（vena contracta、肺靜脈血流、心腔大小）。");
  else setTutor(el,`r = ${fx(rm,2)} cm at Va ${va} cm/s. Lower Va and r grows, yet EROA stays ${fx(e,2)} cm².`,"降低 Va，r 變大，但 EROA 不變。");
  $("#pi-table",el).innerHTML=dataTable([["Aliasing velocity",va+" cm/s"],["Measured r",fx(rm,2)+" cm"],["Flow",fx(flow,0)+" mL/s"],["Vmax",fx(vmax/100,2)+" m/s"],["EROA",fx(e,2)+" cm²"],["RVol",fx(rv,0)+" mL"],["Grade (EROA / RVol)",g+" / "+F.mrGradeRVol(rv)]]);
 };bindSliders(el,draw)}

/* ================= Module 3: Doppler studio ================= */
function modDoppler(el){
 el.innerHTML=`<div class="sim-mod">
 <div class="row" role="group" aria-label="Doppler mode"><button class="chip" data-mode="pw" aria-pressed="true">PW</button><button class="chip" data-mode="hprf" aria-pressed="false">HPRF</button><button class="chip" data-mode="cw" aria-pressed="false">CW</button></div>
 <div class="ctrl">${slider("dp-v","True peak velocity","真實峰值速度","0.2","5","0.05",1.5,"m/s")}${slider("dp-th","Insonation angle θ","聲束與血流夾角","0","90","1",20,"°")}${slider("dp-f","Transmit frequency f₀","發射頻率","1.5","7","0.1",2.5,"MHz")}${slider("dp-d","Sample-gate depth","取樣深度","2","20","0.5",12,"cm")}${slider("dp-prf","PRF (scale)","脈衝重複頻率","1","15","0.1",5,"kHz")}${slider("dp-b","Baseline shift","基線移動","-50","50","5",0,"%")}</div>
 <div class="sim-grid"><figure class="sim-fig"><svg id="dp-cos" viewBox="0 0 360 250" role="img" aria-labelledby="dp-cos-t"><title id="dp-cos-t">Angle error</title></svg><figcaption>Displayed velocity = true × cos θ. Error is small below 20° and climbs fast after 30°. ${zh("顯示速度＝真實速度 × cos θ，20° 以下誤差小，30° 後急升。")}</figcaption></figure>
 <figure class="sim-fig"><svg id="dp-spec" viewBox="0 0 460 250" role="img" aria-labelledby="dp-spec-t"><title id="dp-spec-t">Spectral display</title></svg><figcaption>Simulated spectral display with Nyquist limits (dashed). ${zh("模擬頻譜，虛線為 Nyquist 極限。")}</figcaption></figure></div>
 <div class="sim-eq" id="dp-eq" aria-live="polite"></div>
 ${outs([["dp-o-fd","Doppler shift (kHz)"],["dp-o-vm","Displayed v (m/s)"],["dp-o-err","Underestimate %"],["dp-o-ny","Nyquist (m/s)"],["dp-o-prfmax","Max PRF at depth (kHz)"],["dp-o-al","Aliasing?"]])}
 ${tutor("bubu","Bubu says · 布布話你知","Aliasing? Try: lower the baseline, raise the scale (PRF), lower f₀, reduce depth, or switch to CW.","出現混疊？試：移動基線、提高 PRF、降低發射頻率、減少深度或改用 CW。")}
 <div class="panel sim-explain"><h3>Key ideas</h3><ul>
 <li>Doppler equation: f<sub>D</sub> = 2 f₀ v cos θ / c. Doubling f₀ doubles the shift — and halves the Nyquist velocity. ${zh("多普勒方程：f₀ 加倍，頻移加倍，Nyquist 速度減半。")}</li>
 <li>Nyquist limit = PRF ÷ 2. Deeper gates force a lower PRF (≈77 ÷ depth kHz), so deep high velocities alias. ${zh("Nyquist ＝ PRF ÷ 2；越深 PRF 越低，越易混疊。")}</li>
 <li><b>PW</b>: range-specific but aliases. <b>HPRF</b>: several gates in flight → higher limit but range ambiguity. <b>CW</b>: no aliasing, no range resolution. ${zh("PW 有深度定位但會混疊；HPRF 提高極限但有深度模糊；CW 不混疊但無深度定位。")}</li>
 <li>Angle errors always <b>underestimate</b> velocity (cos θ ≤1): 20° ≈ 6%, 30° ≈ 13%, 60° = 50%. Cardiac Doppler is normally not angle-corrected; align parallel to flow. ${zh("角度誤差只會低估；心臟多普勒一般不作角度校正，應與血流平行。")}</li></ul>
 <p class="sim-note">Teaching illustration: idealised waveform; HPRF modelled as 2× the depth-limited PRF. ${zh("教學示意：理想化波形，HPRF 以兩倍 PRF 模擬。")}</p></div>
 <details class="sim-data"><summary>Data table (text alternative) ${zh("數據表（文字版）")}</summary><div id="dp-table"></div></details></div>`;
 let mode="pw";
 const draw=()=>{const v=val(el,"dp-v"),th=val(el,"dp-th"),f0=val(el,"dp-f"),d=val(el,"dp-d"),b=val(el,"dp-b")/100;const pmax=F.maxPRFkHz(d);
  const pi=$("#dp-prf",el);const lim=mode==="hprf"?pmax*2:pmax;pi.max=Math.min(15,lim*1).toFixed(1);if(+pi.value>+pi.max){pi.value=pi.max;$("#dp-prf-o",el).textContent=pi.value+" kHz";pi.setAttribute("aria-valuetext",pi.value+" kHz")}
  const prf=+pi.value;const fd=F.dopplerShiftKHz(f0,v,th),vm=F.measuredVel(v,th),ny=F.nyquistVel(prf,f0),er=F.underestimatePct(th);
  const al=mode!=="cw"&&(vm>ny*(1+b));
  // cos chart
  const ax=axes({x0:0,x1:90,y0:0,y1:100,W:360,H:250,m:[12,12,32,42],xt:[0,15,30,45,60,75,90],yt:[0,25,50,75,100],xl:"Angle θ (°)",yl:"Displayed / true (%)"});
  const pts=[];for(let a=0;a<=90;a+=1)pts.push([a,Math.cos(a*Math.PI/180)*100]);
  $("#dp-cos",el).innerHTML=`<title id="dp-cos-t">At ${th} degrees the display shows ${fx(100-er,0)}% of the true velocity.</title>${ax.svg}<rect x="${ax.X(20)}" y="${ax.Y(100)}" width="${ax.X(90)-ax.X(20)}" height="${ax.Y(0)-ax.Y(100)}" fill="var(--toward-soft)" opacity=".5"/><text class="sim-tm" x="${ax.X(55)}" y="${ax.Y(92)}" text-anchor="middle">error &gt;6%</text><path class="sim-l1" d="${pathOf(pts,ax.X,ax.Y)}"/><circle class="sim-dot" cx="${ax.X(th)}" cy="${ax.Y(100-er)}" r="6"/><text class="sim-t" x="${ax.X(th)+8}" y="${ax.Y(100-er)-8}">${fx(100-er,0)}%</text>`;
  // spectral display
  const W=460,H=250,mL=40,mR=10,mT=12,mB=28;const vr=Math.max(ny*(1+Math.abs(b))*1.15,mode==="cw"?vm*1.2:0,1);const Y=scale(-vr,vr,H-mB,mT);const Tt=scale(0,2,mL,W-mR);
  const base=Y(0);let s=`<rect x="${mL}" y="${mT}" width="${W-mL-mR}" height="${H-mT-mB}" fill="var(--panel-2)"/>`;
  const step=2/220;for(let t=0;t<2;t+=step){const ph=t%1;const sys=ph<0.35?Math.sin(Math.PI*ph/0.35):0;const vt=vm*Math.pow(sys,0.8);if(vt<=0.01)continue;
   let segs=[];if(mode==="cw"){segs=[[0,vt]]}else{const top=ny*(1+b);if(vt<=top)segs=[[0,vt]];else{segs=[[0,top],[-ny*(1-b),-ny*(1-b)+(vt-top)]]}}
   segs.forEach(([a,c])=>{s+=`<line x1="${Tt(t)}" x2="${Tt(t)}" y1="${Y(a)}" y2="${Y(c)}" stroke="var(--fg)" stroke-width="2.2" opacity=".85"/>`})}
  if(mode!=="cw"){s+=`<line class="sim-l2 sim-dash" x1="${mL}" x2="${W-mR}" y1="${Y(ny*(1+b))}" y2="${Y(ny*(1+b))}"/><line class="sim-l2 sim-dash" x1="${mL}" x2="${W-mR}" y1="${Y(-ny*(1-b))}" y2="${Y(-ny*(1-b))}"/><text class="sim-t" x="${W-mR-2}" y="${Y(ny*(1+b))-4}" text-anchor="end">+Nyquist ${fx(ny*(1+b),2)} m/s</text>`}
  s+=`<line class="sim-ax" x1="${mL}" x2="${W-mR}" y1="${base}" y2="${base}"/>`;
  const ticks=[];const st=vr>3?1:0.5;for(let q=-Math.floor(vr/st)*st;q<=vr;q+=st)ticks.push(q);ticks.forEach(q=>{s+=`<text class="sim-tm" x="${mL-4}" y="${Y(q)+3}" text-anchor="end">${fx(q,1)}</text>`});
  s+=`<text class="sim-t" transform="translate(11 ${H/2}) rotate(-90)" text-anchor="middle">Velocity (m/s)</text><text class="sim-tm" x="${W/2}" y="${H-8}" text-anchor="middle">${mode.toUpperCase()} · gate ${d} cm${mode==="hprf"?` · extra gate at ${fx(d/2,1)} cm (range ambiguity)`:mode==="cw"?" · whole beam (no range resolution)":""}</text>`;
  if(al)s+=`<text class="sim-t" x="${mL+6}" y="${H-mB-6}" style="font-weight:700">ALIASING · 混疊</text>`;
  $("#dp-spec",el).innerHTML=`<title id="dp-spec-t">${mode.toUpperCase()} spectrum: displayed peak ${fx(vm,2)} m/s, Nyquist ${fx(ny,2)} m/s, ${al?"aliasing present":"no aliasing"}.</title>`+s;
  $("#dp-eq",el).innerHTML=`f<sub>D</sub> = 2 × f₀ × v × cos θ ÷ c = 2 × ${f0} MHz × ${v} m/s × cos ${th}° ÷ 1540 = <b>${fx(fd,2)} kHz</b><br>Nyquist (velocity) = (PRF ÷ 2) × c ÷ (2 f₀) = (${prf} ÷ 2 kHz) × 1540 ÷ (2 × ${f0} MHz) = <b>${fx(ny,2)} m/s</b><br>Max PRF at ${d} cm ≈ 77 ÷ ${d} = ${fx(pmax,2)} kHz · Bernoulli at displayed v: 4 × ${fx(vm,2)}² = ${fx(F.bernoulli(vm),0)} mmHg (true ${fx(F.bernoulli(v),0)})`;
  setOut(el,"dp-o-fd",fx(fd,2));setOut(el,"dp-o-vm",fx(vm,2));setOut(el,"dp-o-err",fx(er,1));setOut(el,"dp-o-ny",mode==="cw"?"n/a":fx(ny,2));setOut(el,"dp-o-prfmax",fx(pmax,2));setOut(el,"dp-o-al",al?"Yes · 有":"No · 無");
  if(al)setTutor(el,`Peak ${fx(vm,2)} m/s exceeds the Nyquist limit ${fx(ny*(1+b),2)} m/s — the top wraps to the other side. Fix: baseline shift, higher PRF, lower f₀, shallower gate, or CW.`,"峰值超過 Nyquist 極限，頂部折返至另一側。方法：移基線、提高 PRF、降低 f₀、減淺取樣或用 CW。");
  else if(th>=20)setTutor(el,`At ${th}° you under-read by ${fx(er,0)}%: Bernoulli gradient ${fx(F.bernoulli(vm),0)} instead of ${fx(F.bernoulli(v),0)} mmHg (the error is squared!).`,"角度令速度低估，壓差誤差更被平方放大！");
  else setTutor(el,mode==="cw"?"CW never aliases, but you cannot tell where along the beam the peak velocity came from.":"Clean signal. Now push depth to 18 cm and watch the max PRF drop.","CW 不會混疊，但無法知道最高速度來自哪個深度。");
  $("#dp-table",el).innerHTML=dataTable([["Mode",mode.toUpperCase()],["Doppler shift",fx(fd,2)+" kHz"],["Displayed velocity",fx(vm,2)+" m/s"],["Angle underestimate",fx(er,1)+" %"],["Nyquist",mode==="cw"?"n/a":fx(ny,2)+" m/s"],["Max PRF",fx(pmax,2)+" kHz"],["Aliasing",al?"yes":"no"]]);
 };
 $$("[data-mode]",el).forEach(bn=>bn.addEventListener("click",()=>{mode=bn.dataset.mode;$$("[data-mode]",el).forEach(x=>x.setAttribute("aria-pressed",x===bn));draw()}));
 bindSliders(el,draw)}

/* ================= Module 4: AS flow-dependence ================= */
function modAS(el){
 el.innerHTML=`<div class="sim-mod">
 <div class="row" role="group" aria-label="Valve behaviour"><button class="chip" data-valve="fixed" aria-pressed="true">Fixed orifice (true severe) ${zh("固定瓣口")}</button><button class="chip" data-valve="flex" aria-pressed="false">Opens with flow (pseudo-severe) ${zh("隨流量張開")}</button><button class="btn" id="as-dob" aria-pressed="false">💉 Low-dose dobutamine</button></div>
 <div class="ctrl">${slider("as-sv","Stroke volume (rest)","每搏量","30","110","1",50,"mL")}${slider("as-ava","Resting AVA (EOA)","靜息主動脈瓣面積","0.5","2","0.05",0.9,"cm²")}${slider("as-lvot","LVOT diameter","LVOT 直徑","1.6","2.6","0.05",2.0,"cm")}${slider("as-et","Ejection time","射血時間","200","400","5",300,"ms")}${slider("as-bsa","BSA","體表面積","1.4","2.4","0.05",1.8,"m²")}</div>
 <div class="sim-grid"><figure class="sim-fig"><svg id="as-fig" viewBox="0 0 420 300" role="img" aria-labelledby="as-fig-t"><title id="as-fig-t">Mean gradient vs stroke volume</title></svg><figcaption>Mean gradient rises with the square of flow for a given orifice. Dashed lines: mean 40 mmHg and the low-flow SV (SVi 35 × BSA). ${zh("同一瓣口下，平均壓差隨流量平方上升。")}</figcaption></figure>
 <figure class="sim-fig"><svg id="as-cont" viewBox="0 0 360 300" role="img" aria-labelledby="as-cont-t"><title id="as-cont-t">Continuity equation</title></svg><figcaption>Continuity: what flows through the LVOT must flow through the valve. ${zh("連續方程：通過 LVOT 的血流必須通過瓣口。")}</figcaption></figure></div>
 <div class="sim-eq" id="as-eq" aria-live="polite"></div>
 ${outs([["as-o-sv","SV (mL)"],["as-o-svi","SVi (mL/m²)"],["as-o-vmax","AV Vmax (m/s)"],["as-o-mg","Mean gradient"],["as-o-ava","AVA (cm²)"],["as-o-dvi","DVI"],["as-o-cls","Category"]])}
 ${tutor("dudu","Dudu says · 一二話你知","Low SV hides a tight valve: the gradient can look 'moderate'. Press dobutamine to see whether AVA stays small.","低每搏量會掩蓋嚴重狹窄，壓差看似中度。按多巴酚丁胺看看 AVA 是否仍細小。")}
 <div class="panel sim-explain"><h3>Key ideas</h3><ul>
 <li>Velocity and gradient depend on flow; AVA (continuity) describes the orifice. Discordance (AVA ≤1.0 but mean &lt;40 mmHg) → check flow: SVi &lt;35 mL/m² = low flow. ${zh("壓差受流量影響；AVA 描述瓣口。AVA ≤1.0 但平均壓差 &lt;40 → 檢查流量，SVi &lt;35 為低流量。")}</li>
 <li>Classical low-flow, low-gradient AS with low EF → low-dose DSE: true severe if AVA stays ≤1.0 cm² with mean ≥40 mmHg (or Vmax ≥4 m/s); pseudo-severe if AVA rises &gt;1.0. Flow reserve = SV ↑ ≥20%. ${zh("低流量低壓差 AS（EF 低）做低劑量 DSE：AVA 仍 ≤1.0 且平均 ≥40 為真嚴重；AVA &gt;1.0 為假性嚴重。")}</li>
 <li>Severe AS (ASE/EACVI 2017; ACC/AHA 2020): Vmax ≥4 m/s, mean ≥40 mmHg, AVA ≤1.0 cm² (AVAi ≤0.6 cm²/m²), DVI ≤0.25. ${zh("嚴重 AS：Vmax ≥4、平均 ≥40、AVA ≤1.0、DVI ≤0.25。")}</li>
 <li>Biggest error source: LVOT diameter (squared). A 1 mm error ≈ 10% AVA error at 2 cm. ${zh("最大誤差來源：LVOT 直徑（平方）。")}</li></ul>
 <p class="sim-note">Teaching illustration. Model: VTI<sub>AV</sub> = SV/EOA; Vmax ≈ VTI ÷ (0.6 × ET); mean ≈ 2.4 × Vmax² <span class="sim-warn">近似值 · 待核實</span>. The flexible-valve response (EOA +0.6 × relative SV rise) is invented for illustration only. ${zh("教學示意：近似公式，靈活瓣口反應僅作說明用途。")}</p></div>
 <details class="sim-data"><summary>Data table (text alternative) ${zh("數據表（文字版）")}</summary><div id="as-table"></div></details></div>`;
 let valve="fixed",dob=false;
 const calc=(sv,ava0,isDob)=>{const svd=isDob?sv*1.3:sv;const ava=valve==="flex"&&isDob?ava0*(1+0.6*(svd/sv-1))*1.6:ava0;const lv=val(el,"as-lvot"),et=val(el,"as-et")/1000;const la=F.circArea(lv);
  const vmax=F.asVmax(svd,ava,et),mg=F.meanFromVmax(vmax),vtiL=svd/la,vtiA=F.asVTI(svd,ava);return {sv:svd,ava:F.continuityAVA(lv,vtiL,vtiA),vmax,mg,vtiL,vtiA,dvi:F.dvi(vtiL,vtiA),la}};
 const draw=()=>{const sv=val(el,"as-sv"),ava0=val(el,"as-ava"),bsa=val(el,"as-bsa");const R=calc(sv,ava0,false),D=dob?calc(sv,ava0,true):null,X0=D||R;const svi=X0.sv/bsa;
  let cls;const sev=X0.vmax>=4||X0.mg>=40;if(X0.ava<=1.0&&sev)cls="High-gradient severe AS · 高壓差嚴重";else if(X0.ava<=1.0&&!sev)cls=F.lowFlow(svi)?"Low-flow, low-gradient (discordant) · 低流量低壓差":"Normal-flow low-gradient (check measurements) · 正常流量低壓差";else if(sev)cls="High gradient with AVA >1.0 (high flow?) · 高流量？";else cls="Not severe · 非嚴重";
  if(D)cls=(D.ava<=1.0&&(D.mg>=40||D.vmax>=4))?"DSE: true severe AS · 真嚴重":(D.ava>1.0?"DSE: pseudo-severe AS · 假性嚴重":"DSE: indeterminate · 未能確定");
  // chart
  const ax=axes({x0:20,x1:130,y0:0,y1:100,W:420,H:300,m:[12,40,34,42],xt:[20,40,60,80,100,120],yt:[0,20,40,60,80,100],xl:"Stroke volume (mL)",yl:"Mean gradient (mmHg)"});
  let s=ax.svg;const et=val(el,"as-et")/1000;[0.6,0.8,1.0,1.2,1.5].forEach(a=>{const pts=[];for(let q=20;q<=130;q+=2){const g=F.meanFromVmax(F.asVmax(q,a,et));if(g>100)break;pts.push([q,g])}if(pts.length>1){s+=`<path class="${a===1.0?"sim-l3":"sim-ax"}" d="${pathOf(pts,ax.X,ax.Y)}"/>`;const l=pts[pts.length-1];s+=`<text class="sim-tm" x="${ax.X(l[0])+3}" y="${ax.Y(l[1])+3}">AVA ${a}</text>`}});
  s+=`<line class="sim-l2 sim-dash" x1="${ax.X(20)}" x2="${ax.X(130)}" y1="${ax.Y(40)}" y2="${ax.Y(40)}"/><text class="sim-t" x="${ax.X(22)}" y="${ax.Y(40)-4}">mean 40</text>`;
  const lf=35*bsa;if(lf>=20&&lf<=130)s+=`<line class="sim-l4 sim-dash" x1="${ax.X(lf)}" x2="${ax.X(lf)}" y1="${ax.Y(0)}" y2="${ax.Y(100)}"/><text class="sim-t" x="${ax.X(lf)+3}" y="${ax.Y(4)}">low flow &lt;${fx(lf,0)} mL</text>`;
  const pt=(o)=>[ax.X(Math.min(130,o.sv)),ax.Y(Math.min(100,o.mg))];const p0=pt(R);s+=`<circle class="sim-dot" cx="${p0[0]}" cy="${p0[1]}" r="6"/><text class="sim-t" x="${p0[0]+8}" y="${p0[1]+4}">rest</text>`;
  if(D){const p1=pt(D);s+=`<line x1="${p0[0]}" y1="${p0[1]}" x2="${p1[0]}" y2="${p1[1]}" stroke="var(--fg)" stroke-width="2"/><circle cx="${p1[0]}" cy="${p1[1]}" r="6" fill="var(--away)" stroke="var(--panel)" stroke-width="2"/><text class="sim-t" x="${p1[0]+8}" y="${p1[1]+4}">DSE</text>`}
  $("#as-fig",el).innerHTML=`<title id="as-fig-t">Rest: SV ${fx(R.sv,0)} mL, mean ${fx(R.mg,0)} mmHg${D?`; dobutamine: SV ${fx(D.sv,0)} mL, mean ${fx(D.mg,0)} mmHg, AVA ${fx(D.ava,2)}`:""}. ${cls}.</title>`+s;
  // continuity diagram
  const lvw=Math.sqrt(X0.la)*55,avw=Math.sqrt(X0.ava)*55;let c=`<rect x="${180-lvw/2}" y="190" width="${lvw}" height="90" rx="10" fill="var(--away-soft)" stroke="var(--away)" stroke-width="2"/><text class="sim-t" x="180" y="290" text-anchor="middle">LVOT ${fx(X0.la,2)} cm²</text>`;
  c+=`<path d="M${180-lvw/2} 190 L${180-avw/2} 120 M${180+lvw/2} 190 L${180+avw/2} 120" stroke="var(--fg)" stroke-width="3"/><rect x="${180-avw/2}" y="20" width="${avw}" height="100" fill="var(--toward-soft)" stroke="var(--toward)" stroke-width="2"/><text class="sim-t" x="180" y="14" text-anchor="middle">AV ${fx(X0.ava,2)} cm²</text>`;
  const bh=v=>Math.min(v,250)/250*80;c+=`<rect x="20" y="${280-bh(X0.vtiL)}" width="34" height="${bh(X0.vtiL)}" fill="var(--away)"/><text class="sim-tm" x="37" y="${275-bh(X0.vtiL)}" text-anchor="middle">${fx(X0.vtiL,0)}</text><text class="sim-tm" x="37" y="294" text-anchor="middle">VTI LVOT</text>`;
  c+=`<rect x="300" y="${120-bh(X0.vtiA)}" width="34" height="${bh(X0.vtiA)}" fill="var(--toward)"/><text class="sim-tm" x="317" y="${115-bh(X0.vtiA)}" text-anchor="middle">${fx(X0.vtiA,0)}</text><text class="sim-tm" x="317" y="134" text-anchor="middle">VTI AV</text>`;
  $("#as-cont",el).innerHTML=`<title id="as-cont-t">Continuity: LVOT area ${fx(X0.la,2)} times VTI ${fx(X0.vtiL,0)} equals AVA ${fx(X0.ava,2)} times VTI ${fx(X0.vtiA,0)}.</title>`+c;
  $("#as-eq",el).innerHTML=`AVA = π(${val(el,"as-lvot")}/2)² × VTI<sub>LVOT</sub> ÷ VTI<sub>AV</sub> = ${fx(X0.la,2)} × ${fx(X0.vtiL,1)} ÷ ${fx(X0.vtiA,1)} = <b>${fx(X0.ava,2)} cm²</b> · DVI = ${fx(X0.dvi,2)}<br>Vmax ≈ VTI<sub>AV</sub> ÷ (0.6 × ET) = ${fx(X0.vmax,2)} m/s · mean ≈ 2.4 × Vmax² = ${fx(X0.mg,0)} mmHg <span class="sim-warn">approx.</span>`;
  setOut(el,"as-o-sv",fx(X0.sv,0));setOut(el,"as-o-svi",fx(svi,0));setOut(el,"as-o-vmax",fx(X0.vmax,2));setOut(el,"as-o-mg",fx(X0.mg,0)+" mmHg");setOut(el,"as-o-ava",fx(X0.ava,2));setOut(el,"as-o-dvi",fx(X0.dvi,2));setOut(el,"as-o-cls",cls);
  if(D)setTutor(el,D.ava>1.0?`With more flow the valve opened to ${fx(D.ava,2)} cm² — pseudo-severe: the weak LV could not open a moderately diseased valve.`:`Flow rose ${fx((D.sv/R.sv-1)*100,0)}% and AVA stayed ${fx(D.ava,2)} cm² while the gradient climbed to ${fx(D.mg,0)} mmHg — true severe AS.`,D.ava>1.0?"流量增加後瓣口張開——假性嚴重。":"流量增加而 AVA 不變、壓差上升——真嚴重 AS。");
  else if(X0.ava<=1&&X0.mg<40)setTutor(el,`AVA ${fx(X0.ava,2)} cm² says severe, but mean gradient ${fx(X0.mg,0)} mmHg says moderate. SVi ${fx(svi,0)} mL/m² — ${F.lowFlow(svi)?"low flow explains it.":"flow is normal, so re-check the LVOT diameter first."}`,"AVA 與壓差不一致：先看流量（SVi）及重新量 LVOT。");
  else setTutor(el,"Drag SV up and down: the dot slides along one AVA curve — the valve is the same, only the gradient changes.","拉動 SV：點沿同一條 AVA 曲線移動——瓣口未變，只是壓差改變。");
  $("#as-table",el).innerHTML=dataTable([["Category",cls],["SV / SVi",`${fx(X0.sv,0)} mL / ${fx(svi,0)} mL/m²`],["Vmax",fx(X0.vmax,2)+" m/s"],["Mean gradient",fx(X0.mg,0)+" mmHg"],["AVA (continuity)",fx(X0.ava,2)+" cm²"],["AVAi",fx(X0.ava/bsa,2)+" cm²/m²"],["DVI",fx(X0.dvi,2)]]);
 };
 $$("[data-valve]",el).forEach(b=>b.addEventListener("click",()=>{valve=b.dataset.valve;$$("[data-valve]",el).forEach(x=>x.setAttribute("aria-pressed",x===b));draw()}));
 $("#as-dob",el).addEventListener("click",e=>{dob=!dob;e.currentTarget.setAttribute("aria-pressed",dob);draw()});
 bindSliders(el,draw)}

const MODS=[
 {id:"pvloop",ico:"❤️",en:"PV loop + Wiggers",zh:"壓力–容積環＋Wiggers 圖",d:"D",fn:modPV,sub:"Load, contractility & valve lesions",subz:"負荷、收縮力與瓣膜病"},
 {id:"pisa",ico:"🌀",en:"PISA / EROA",zh:"PISA／有效反流口面積",d:"C",fn:modPISA,sub:"Flow convergence & measurement error",subz:"血流匯聚與量度誤差"},
 {id:"doppler",ico:"📡",en:"Doppler studio",zh:"多普勒工作室",d:"E",fn:modDoppler,sub:"Angle, Nyquist, PW/HPRF/CW",subz:"角度、Nyquist、PW/HPRF/CW"},
 {id:"asflow",ico:"🫀",en:"AS flow-dependence",zh:"主動脈瓣狹窄與流量",d:"C",fn:modAS,sub:"Continuity, low-flow AS & DSE",subz:"連續方程、低流量 AS 與 DSE"}];

function render(main,hash){injectCSS();const sub=(hash||"sim").split("-")[1];const mod=MODS.find(m=>m.id===sub)||MODS[0];
 main.innerHTML=`<section class="view" style="max-width:1100px"><div class="view-head"><span class="label">Sim Lab · interactive principles</span><h1>Principles in motion</h1><p>Drag the controls and watch the physiology and physics respond. Every chart has a text version underneath. ${zh("模擬實驗室：拉動控制，即時看到生理與物理變化；每幅圖下方都有文字版。")}</p></div>
 <nav class="sim-hub" aria-label="Simulations">${MODS.map(m=>`<a class="sim-card" href="#sim-${m.id}" aria-current="${m===mod}"><span class="ico" aria-hidden="true">${m.ico}</span><span><b>${m.en}</b><small>${m.sub} · Domain ${m.d}</small>${zh(m.zh)}</span></a>`).join("")}</nav>
 <div class="panel"><h2 id="sim-h">${mod.en} ${zh(mod.zh)}</h2><div id="sim-body" style="margin-top:12px"></div></div>
 <p class="sim-note" style="margin-top:12px">All simulations are teaching illustrations, not clinical calculators. Formulas: <code>formulas.js</code>, unit-tested. Cut-offs: ASE 2017 native regurgitation, ASE/EACVI 2017 AS, ACC/AHA 2020 valve guideline, Kremkau/Edelman physics. ${zh("全部屬教學示意，非臨床計算工具。")}</p></section>`;
 mod.fn($("#sim-body",main))}
window.RCSSim={render,MODS};
})();
