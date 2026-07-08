import { World as LifeWorld } from './engine.js';
import { RULES } from './rules.js';
import { PATTERNS } from './patterns.js';
import { MatterWorld, MATERIALS } from './matter.js';
import { SlimeWorld } from './slime.js';

const $ = id => document.getElementById(id);
const canvas = $('world');
const ctx = canvas.getContext('2d');

let cellSize = 5;
let running = true;
let speed = 13;
let stampMode = false;
let drawing = false;
let experiment = 'life';
let world;

const EXPERIMENTS = {
  life: 'Cellular Life',
  matter: 'Falling Matter',
  slime: 'Slime Trails'
};

function colsRows(){
  return [Math.max(10, Math.floor(canvas.width / cellSize)), Math.max(10, Math.floor(canvas.height / cellSize))];
}

function makeWorld(kind){
  const [cols, rows] = colsRows();
  if(kind === 'matter') { const w = new MatterWorld(cols, rows); w.randomize(); return w; }
  if(kind === 'slime') { const w = new SlimeWorld(cols, rows, +$('agents').value); w.randomize(); return w; }
  const w = new LifeWorld(cols, rows, RULES.Life); w.randomize(.18); return w;
}

function fit(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);
  const [cols, rows] = colsRows();
  if(!world) world = makeWorld(experiment);
  else world.resize(cols, rows);
}

function drawLife(){
  for(let y=0;y<world.rows;y++) for(let x=0;x<world.cols;x++){
    const i = world.index(x,y);
    if(world.grid[i]){
      const age = Math.min(world.ages[i],50);
      ctx.fillStyle = `rgb(${24+age*3}, ${195+age}, ${128+age})`;
      ctx.fillRect(x*cellSize,y*cellSize,cellSize-1,cellSize-1);
    }
  }
}

function drawMatter(){
  const colours = {
    [MATERIALS.sand]:'#d7a84f',
    [MATERIALS.water]:'#45a6ff',
    [MATERIALS.plant]:'#21d07a',
    [MATERIALS.stone]:'#7b8797'
  };
  for(let y=0;y<world.rows;y++) for(let x=0;x<world.cols;x++){
    const v = world.get(x,y);
    if(v){ ctx.fillStyle = colours[v]; ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize); }
  }
}

function drawSlime(){
  const image = ctx.createImageData(world.cols, world.rows);
  for(let i=0;i<world.trail.length;i++){
    const v = Math.min(255, world.trail[i]*255);
    image.data[i*4] = 20;
    image.data[i*4+1] = v;
    image.data[i*4+2] = 140 + v*.35;
    image.data[i*4+3] = v;
  }
  const off = document.createElement('canvas');
  off.width = world.cols; off.height = world.rows;
  off.getContext('2d').putImageData(image,0,0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off,0,0,world.cols*cellSize,world.rows*cellSize);
  ctx.fillStyle = '#f2fff8';
  for(let i=0;i<Math.min(120,world.agents.length);i++){
    const a = world.agents[i];
    ctx.fillRect(a.x*cellSize,a.y*cellSize,Math.max(1,cellSize-1),Math.max(1,cellSize-1));
  }
}

function fieldNote(){
  const pop = world.population();
  if(experiment === 'life'){
    if(pop === 0) return 'Field note: extinction event. Seed the world or stamp a pattern.';
    if(world.generation < 40) return 'Field note: initial chaos. Stable structures may emerge after the first collapse.';
    return 'Field note: watch for oscillators, gliders, still lifes, and explosive rule behaviour.';
  }
  if(experiment === 'matter') return 'Field note: sand piles, water seeks gaps, plants climb when matter supports them.';
  return 'Field note: agents reinforce trails. Dense paths can self-organise into vein-like networks.';
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#020408';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  if(experiment === 'matter') drawMatter();
  else if(experiment === 'slime') drawSlime();
  else drawLife();
  $('generation').textContent = world.generation;
  $('population').textContent = world.population();
  $('fieldNote').textContent = fieldNote();
}

function pointer(e){
  const r = canvas.getBoundingClientRect();
  return [Math.floor((e.clientX-r.left)/cellSize), Math.floor((e.clientY-r.top)/cellSize)];
}

function place(e){
  const [x,y] = pointer(e);
  if(experiment === 'matter') world.brush(x,y,$('materialSelect').value,+$('brush').value);
  else if(experiment === 'slime'){
    for(let i=0;i<40;i++) world.agents.push({x:x+(Math.random()-.5)*8,y:y+(Math.random()-.5)*8,a:Math.random()*Math.PI*2});
  } else if(stampMode) world.stamp(PATTERNS[$('patternSelect').value],x,y);
  else world.set(x,y,1);
  draw();
}

function switchExperiment(kind){
  experiment = kind;
  world = makeWorld(kind);
  $('modeLabel').textContent = EXPERIMENTS[kind];
  $('lifeControls').classList.toggle('hidden', kind !== 'life');
  $('matterControls').classList.toggle('hidden', kind !== 'matter');
  $('slimeControls').classList.toggle('hidden', kind !== 'slime');
  $('hint').textContent = kind === 'matter' ? 'Click or drag to pour material. Switch material to build tiny physics worlds.' : kind === 'slime' ? 'Click to inject more agents. Trails emerge from movement and reinforcement.' : 'Click or drag to draw. Toggle stamp mode to place patterns.';
  draw();
}

function exportWorld(){
  if(experiment === 'life') return world.toRLE();
  return world.export();
}

function loop(){
  if(running) world.step();
  draw();
  setTimeout(()=>requestAnimationFrame(loop),1000/speed);
}

function initUI(){
  for(const name of Object.keys(RULES)) $('ruleSelect').append(new Option(`${name} (${RULES[name].code})`,name));
  for(const name of Object.keys(PATTERNS)) $('patternSelect').append(new Option(name,name));

  $('experimentSelect').onchange = e => switchExperiment(e.target.value);
  $('playPause').onclick = () => { running=!running; $('playPause').textContent=running?'Pause':'Play'; };
  $('step').onclick = () => { world.step(); draw(); };
  $('randomize').onclick = () => { world.randomize(experiment === 'life' ? .18 : undefined); draw(); };
  $('clear').onclick = () => { world.clear(); draw(); };
  $('ruleSelect').onchange = e => { if(experiment === 'life') world.rule=RULES[e.target.value]; };
  $('speed').oninput = e => { speed=+e.target.value; $('speedText').textContent=speed; };
  $('cellSize').oninput = e => { cellSize=+e.target.value; $('cellSizeText').textContent=cellSize; fit(); draw(); };
  $('brush').oninput = e => $('brushText').textContent=e.target.value;
  $('agents').oninput = e => { $('agentsText').textContent=e.target.value; if(experiment==='slime') world.setAgents(+e.target.value); };
  $('decay').oninput = e => { $('decayText').textContent=e.target.value; if(experiment==='slime') world.decay=+e.target.value; };
  $('stampMode').onclick = () => { stampMode=!stampMode; $('stampMode').textContent=`Stamp: ${stampMode?'On':'Off'}`; };
  $('save').onclick = () => localStorage.setItem(`emergence-${experiment}`,world.serialize());
  $('load').onclick = () => { const s=localStorage.getItem(`emergence-${experiment}`); if(s){ world.load(s); draw(); } };
  $('exportRle').onclick = () => $('exportBox').value = exportWorld();

  canvas.addEventListener('pointerdown',e=>{ drawing=true; place(e); });
  canvas.addEventListener('pointermove',e=>{ if(drawing) place(e); });
  window.addEventListener('pointerup',()=>drawing=false);
  window.addEventListener('resize',()=>{fit(); draw();});
}

fit();
initUI();
draw();
loop();
