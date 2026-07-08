import { World as LifeWorld } from './engine.js';
import { RULES } from './rules.js';
import { PATTERNS } from './patterns.js';
import { MatterWorld, MATERIALS } from './matter.js';
import { SlimeWorld } from './slime.js';
import { EcosystemWorld } from './ecosystem.js';

const $ = id => document.getElementById(id);
const canvas = $('world');
const ctx = canvas.getContext('2d');
const chart = $('chart');
const chartCtx = chart.getContext('2d');

let cellSize = 5;
let running = true;
let speed = 13;
let stampMode = false;
let drawing = false;
let experiment = 'life';
let world;
let history = [];
let cursor = {x:0,y:0,show:false};

const EXPERIMENTS = { life:'Cellular Life', matter:'Falling Matter', slime:'Slime Trails', ecosystem:'Ecosystem' };
const PRESETS = {
  life:[['classic','Classic chaos'],['glidergun','Glider gun lab'],['maze','Maze growth'],['seeds','Seeds explosion']],
  matter:[['dune','Sand dune'],['aquifer','Aquifer'],['garden','Wet garden'],['dam','Stone dam']],
  slime:[['veins','Vein network'],['storm','Agent storm'],['minimal','Minimal scouts']],
  ecosystem:[['balanced','Balanced biosphere'],['prairie','Herbivore prairie'],['predator','Predator pressure'],['forest','Plant recovery test']]
};

function colsRows(){ return [Math.max(10, Math.floor(canvas.width / cellSize)), Math.max(10, Math.floor(canvas.height / cellSize))]; }

function makeWorld(kind){
  const [cols, rows] = colsRows();
  if(kind === 'matter') { const w = new MatterWorld(cols, rows); w.randomize(); return w; }
  if(kind === 'slime') { const w = new SlimeWorld(cols, rows, +$('agents').value); w.randomize(); return w; }
  if(kind === 'ecosystem') return new EcosystemWorld(cols, rows);
  const w = new LifeWorld(cols, rows, RULES.Life); w.randomize(.18); return w;
}

function fit(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width); canvas.height = Math.floor(rect.height);
  const [cols, rows] = colsRows();
  if(!world) world = makeWorld(experiment); else world.resize(cols, rows);
}

function drawLife(){
  for(let y=0;y<world.rows;y++) for(let x=0;x<world.cols;x++){
    const i = world.index(x,y);
    if(world.grid[i]){ const age = Math.min(world.ages[i],50); ctx.fillStyle = `rgb(${24+age*3}, ${195+age}, ${128+age})`; ctx.fillRect(x*cellSize,y*cellSize,Math.max(1,cellSize-1),Math.max(1,cellSize-1)); }
  }
}

function drawMatter(){
  const colours = { [MATERIALS.sand]:'#d7a84f', [MATERIALS.water]:'#45a6ff', [MATERIALS.plant]:'#21d07a', [MATERIALS.stone]:'#7b8797' };
  for(let y=0;y<world.rows;y++) for(let x=0;x<world.cols;x++){ const v = world.get(x,y); if(v){ ctx.fillStyle = colours[v]; ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize); } }
}

function drawEcosystem(){
  const image = ctx.createImageData(world.cols, world.rows);
  for(let i=0;i<world.plants.length;i++){
    const p = Math.min(1, world.plants[i]); const n = Math.min(1, world.nutrients[i] || 0);
    image.data[i*4] = 8 + n*50; image.data[i*4+1] = 18 + p*185 + n*35; image.data[i*4+2] = 18 + p*45; image.data[i*4+3] = p>0.03 || n>0.2 ? 255 : 90;
  }
  const off = document.createElement('canvas'); off.width = world.cols; off.height = world.rows; off.getContext('2d').putImageData(image,0,0);
  ctx.imageSmoothingEnabled = false; ctx.drawImage(off,0,0,world.cols*cellSize,world.rows*cellSize);
  ctx.fillStyle = '#d8f7ff'; for(const h of world.herbivores) ctx.fillRect(h.x*cellSize,h.y*cellSize,Math.max(2,cellSize),Math.max(2,cellSize));
  ctx.fillStyle = '#ff5f6d'; for(const p of world.predators) ctx.fillRect(p.x*cellSize,p.y*cellSize,Math.max(2,cellSize+1),Math.max(2,cellSize+1));
}

function drawSlime(){
  const image = ctx.createImageData(world.cols, world.rows);
  for(let i=0;i<world.trail.length;i++){ const v = Math.min(255, world.trail[i]*255); image.data[i*4] = 20; image.data[i*4+1] = v; image.data[i*4+2] = 140 + v*.35; image.data[i*4+3] = v; }
  const off = document.createElement('canvas'); off.width = world.cols; off.height = world.rows; off.getContext('2d').putImageData(image,0,0);
  ctx.imageSmoothingEnabled = false; ctx.drawImage(off,0,0,world.cols*cellSize,world.rows*cellSize);
  ctx.fillStyle = '#f2fff8'; for(let i=0;i<Math.min(160,world.agents.length);i++){ const a = world.agents[i]; ctx.fillRect(a.x*cellSize,a.y*cellSize,Math.max(1,cellSize-1),Math.max(1,cellSize-1)); }
}

function setMetrics(items){
  [['metricA','metricALabel'],['metricB','metricBLabel'],['metricC','metricCLabel'],['metricD','metricDLabel']].forEach((ids,i)=>{ $(ids[0]).textContent = items[i]?.[0] ?? '—'; $(ids[1]).textContent = items[i]?.[1] ?? 'metric'; });
}

function updateMetrics(){
  if(experiment==='ecosystem'){ const s=world.stats(); setMetrics([[s.plants,'plants'],[s.herbivores,'herbivores'],[s.predators,'predators'],[s.rain.toFixed(2),'rain']]); return; }
  if(experiment==='slime') { setMetrics([[world.agents.length,'agents'],[world.decay?.toFixed?.(3) ?? '—','decay'],[world.generation,'ticks'],[world.population(),'trail mass']]); return; }
  if(experiment==='matter') setMetrics([[world.population(),'particles'],[$('materialSelect').value,'material'],[$('brush').value,'brush'],[world.generation,'ticks']]);
  else setMetrics([[world.population(),'living'],[world.rule?.code || 'B3/S23','rule'],[Object.keys(PATTERNS).length,'patterns'],[world.generation,'ticks']]);
}

function drawChart(){
  chartCtx.clearRect(0,0,chart.width,chart.height); chartCtx.fillStyle='rgba(5,8,13,.72)'; chartCtx.fillRect(0,0,chart.width,chart.height);
  chartCtx.strokeStyle='rgba(143,164,194,.22)'; chartCtx.lineWidth=1; for(let y=20;y<80;y+=20){ chartCtx.beginPath(); chartCtx.moveTo(0,y); chartCtx.lineTo(chart.width,y); chartCtx.stroke(); }
  const data = experiment==='ecosystem' ? world.history.map(h=>h.herbivores+h.predators) : history;
  if(data.length<2) return;
  const max=Math.max(...data,1), step=chart.width/(data.length-1);
  chartCtx.strokeStyle='#17f0a0'; chartCtx.lineWidth=2; chartCtx.beginPath();
  data.forEach((v,i)=>{ const x=i*step, y=chart.height-(v/max)*(chart.height-10)-5; if(i===0) chartCtx.moveTo(x,y); else chartCtx.lineTo(x,y); }); chartCtx.stroke();
}

function fieldNote(){
  const pop = world.population();
  if(experiment === 'life'){
    if(pop === 0) return 'Field note: extinction event. Seed the world or stamp a pattern.';
    if(world.generation < 40) return 'Field note: initial chaos. Stable structures may emerge after the first collapse.';
    return 'Field note: watch for oscillators, gliders, still lifes, and explosive rule behaviour.';
  }
  if(experiment === 'matter') return 'Field note: sand piles, water seeks gaps, plants climb when matter supports them. Try stone dams and aquifers.';
  if(experiment === 'slime') return 'Field note: agents reinforce trails. Dense paths can self-organise into vein-like networks.';
  const s=world.stats();
  if(s.herbivores===0 && s.predators===0) return 'Field note: animal extinction. Seed the world to restart the biosphere.';
  if(s.predators===0) return `Field note: predators are extinct. Herbivores ${s.herbivores}; plants ${s.plants}.`;
  if(s.herbivores<8) return `Field note: prey bottleneck. Predators ${s.predators}; herbivores ${s.herbivores}.`;
  return `Field note: ecosystem running. Plants ${s.plants}, herbivores ${s.herbivores}, predators ${s.predators}, rain ${s.rain.toFixed(2)}.`;
}

function drawCursor(){
  const ring=$('cursorRing'); if(!cursor.show){ ring.style.display='none'; return; }
  const size = experiment==='matter' ? (+$('brush').value*2+1)*cellSize : Math.max(10,cellSize*5);
  ring.style.display='block'; ring.style.width=size+'px'; ring.style.height=size+'px'; ring.style.left=(cursor.x-size/2)+'px'; ring.style.top=(cursor.y-size/2)+'px';
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle = '#020408'; ctx.fillRect(0,0,canvas.width,canvas.height);
  if(experiment === 'matter') drawMatter(); else if(experiment === 'slime') drawSlime(); else if(experiment === 'ecosystem') drawEcosystem(); else drawLife();
  $('generation').textContent = world.generation; $('population').textContent = world.population(); $('fieldNote').textContent = fieldNote();
  updateMetrics(); drawChart(); drawCursor();
}

function pointer(e){ const r = canvas.getBoundingClientRect(); cursor.x=e.clientX-r.left; cursor.y=e.clientY-r.top; return [Math.floor(cursor.x/cellSize), Math.floor(cursor.y/cellSize)]; }

function place(e){
  const [x,y] = pointer(e);
  if(experiment === 'matter') world.brush(x,y,$('materialSelect').value,+$('brush').value);
  else if(experiment === 'slime') for(let i=0;i<40;i++) world.agents.push({x:x+(Math.random()-.5)*8,y:y+(Math.random()-.5)*8,a:Math.random()*Math.PI*2});
  else if(experiment === 'ecosystem'){
    for(let yy=-4;yy<=4;yy++) for(let xx=-4;xx<=4;xx++) world.plants[world.index(x+xx,y+yy)] = Math.min(1.3, world.plants[world.index(x+xx,y+yy)]+.45);
    if(Math.random()<.65) world.herbivores.push(world.makeAnimal('herbivore',{x,y,dna:{speed:.82,vision:7,metabolism:.42,breed:.55,turn:.45}}));
  } else if(stampMode) world.stamp(PATTERNS[$('patternSelect').value],x,y); else world.set(x,y,1);
  draw();
}

function updatePresets(){ $('presetSelect').innerHTML=''; for(const [value,label] of PRESETS[experiment]) $('presetSelect').append(new Option(label,value)); }
function switchExperiment(kind){
  experiment = kind; history=[]; world = makeWorld(kind); $('modeLabel').textContent = EXPERIMENTS[kind]; updatePresets();
  $('lifeControls').classList.toggle('hidden', kind !== 'life'); $('matterControls').classList.toggle('hidden', kind !== 'matter'); $('slimeControls').classList.toggle('hidden', kind !== 'slime'); $('ecosystemControls').classList.toggle('hidden', kind !== 'ecosystem');
  $('hint').textContent = kind === 'matter' ? 'Click or drag to pour material. Switch material to build tiny physics worlds.' : kind === 'slime' ? 'Click to inject more agents. Trails emerge from movement and reinforcement.' : kind === 'ecosystem' ? 'Click to add plant biomass and occasional herbivores. Use events to stress the ecosystem.' : 'Click or drag to draw. Toggle stamp mode to place patterns.';
  draw();
}

function applyPreset(){
  const p=$('presetSelect').value;
  if(experiment==='life'){
    world.clear();
    if(p==='maze') { world.rule=RULES.Maze; world.randomize(.27); }
    else if(p==='seeds') { world.rule=RULES.Seeds; world.randomize(.12); }
    else if(p==='glidergun') { world.rule=RULES.Life; world.stamp(PATTERNS['Gosper Glider Gun'] || PATTERNS.Glider, Math.floor(world.cols*.18), Math.floor(world.rows*.35)); }
    else { world.rule=RULES.Life; world.randomize(.18); }
  }
  if(experiment==='matter'){
    world.clear();
    if(p==='dam'){ for(let y=Math.floor(world.rows*.45);y<world.rows;y++) world.set(Math.floor(world.cols*.5),y,MATERIALS.stone); for(let x=0;x<world.cols;x++) world.set(x,world.rows-1,MATERIALS.stone); world.brush(Math.floor(world.cols*.25),20,'water',16); world.brush(Math.floor(world.cols*.75),20,'sand',14); }
    else if(p==='aquifer'){ for(let x=0;x<world.cols;x++) world.set(x,world.rows-1,MATERIALS.stone); world.brush(Math.floor(world.cols*.5),Math.floor(world.rows*.25),'water',20); world.brush(Math.floor(world.cols*.5),Math.floor(world.rows*.35),'sand',22); }
    else if(p==='garden'){ world.randomize(); world.brush(Math.floor(world.cols*.5),Math.floor(world.rows*.35),'water',14); world.brush(Math.floor(world.cols*.5),Math.floor(world.rows*.6),'plant',10); }
    else world.randomize();
  }
  if(experiment==='slime'){
    world.clear(); const n=p==='storm'?2600:p==='minimal'?220:900; $('agents').value=n; $('agentsText').textContent=n; world.setAgents(n); if(p==='veins') world.decay=.975; if(p==='storm') world.decay=.94; if(p==='minimal') world.decay=.99; $('decay').value=world.decay; $('decayText').textContent=world.decay;
  }
  if(experiment==='ecosystem'){
    world.randomize();
    if(p==='prairie'){ world.predators=[]; for(let i=0;i<90;i++) world.herbivores.push(world.makeAnimal('herbivore')); }
    if(p==='predator'){ for(let i=0;i<35;i++) world.predators.push(world.makeAnimal('predator')); }
    if(p==='forest'){ world.herbivores=[]; world.predators=[]; world.climate.rain=.82; for(let i=0;i<world.plants.length;i++) world.plants[i]=Math.max(world.plants[i],Math.random()*.9); }
  }
  draw();
}

function exportWorld(){ return experiment === 'life' ? world.toRLE() : world.export(); }
function screenshot(){ const a=document.createElement('a'); a.download=`emergence-${experiment}-${Date.now()}.png`; a.href=canvas.toDataURL('image/png'); a.click(); }
function save(){ localStorage.setItem(`emergence-${experiment}`,world.serialize()); $('exportBox').value=`Saved ${EXPERIMENTS[experiment]} locally at tick ${world.generation}.`; }
function load(){ const s=localStorage.getItem(`emergence-${experiment}`); if(s){ world.load(s); $('exportBox').value=`Loaded saved ${EXPERIMENTS[experiment]}.`; draw(); } }

function loop(){
  if(running) { world.step(); if(world.generation%10===0){ history.push(world.population()); if(history.length>240) history.shift(); } }
  draw(); setTimeout(()=>requestAnimationFrame(loop),1000/speed);
}

function initUI(){
  for(const name of Object.keys(RULES)) $('ruleSelect').append(new Option(`${name} (${RULES[name].code})`,name));
  for(const name of Object.keys(PATTERNS)) $('patternSelect').append(new Option(name,name));
  updatePresets();
  $('experimentSelect').onchange = e => switchExperiment(e.target.value); $('applyPreset').onclick = applyPreset;
  $('playPause').onclick = () => { running=!running; $('playPause').textContent=running?'Pause':'Play'; };
  $('step').onclick = () => { world.step(); draw(); }; $('randomize').onclick = () => { world.randomize(experiment === 'life' ? .18 : undefined); draw(); }; $('clear').onclick = () => { world.clear(); draw(); };
  $('ruleSelect').onchange = e => { if(experiment === 'life') world.rule=RULES[e.target.value]; };
  $('speed').oninput = e => { speed=+e.target.value; $('speedText').textContent=speed; }; $('cellSize').oninput = e => { cellSize=+e.target.value; $('cellSizeText').textContent=cellSize; fit(); draw(); };
  $('brush').oninput = e => $('brushText').textContent=e.target.value; $('agents').oninput = e => { $('agentsText').textContent=e.target.value; if(experiment==='slime') world.setAgents(+e.target.value); };
  $('decay').oninput = e => { $('decayText').textContent=e.target.value; if(experiment==='slime') world.decay=+e.target.value; };
  $('triggerEvent').onclick = () => { if(experiment==='ecosystem') { world.disaster($('eventSelect').value); draw(); } };
  $('stampMode').onclick = () => { stampMode=!stampMode; $('stampMode').textContent=`Stamp: ${stampMode?'On':'Off'}`; };
  $('save').onclick = save; $('load').onclick = load; $('exportRle').onclick = () => $('exportBox').value = exportWorld(); $('screenshot').onclick=screenshot;
  canvas.addEventListener('pointerdown',e=>{ drawing=true; cursor.show=true; place(e); }); canvas.addEventListener('pointermove',e=>{ pointer(e); cursor.show=true; if(drawing) place(e); else drawCursor(); });
  canvas.addEventListener('pointerleave',()=>{ cursor.show=false; drawCursor(); }); window.addEventListener('pointerup',()=>drawing=false); window.addEventListener('resize',()=>{fit(); draw();});
  window.addEventListener('keydown',e=>{ if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)) return; if(e.code==='Space'){e.preventDefault(); $('playPause').click();} if(e.key==='r') $('randomize').click(); if(e.key==='c') $('clear').click(); if(e.key==='s') save(); if(e.key==='l') load(); if(e.key==='e') $('exportRle').click(); if(['1','2','3','4'].includes(e.key)){ const k=Object.keys(EXPERIMENTS)[+e.key-1]; $('experimentSelect').value=k; switchExperiment(k); } });
}

fit(); initUI(); draw(); loop();
