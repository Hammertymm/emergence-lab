import { World } from './engine.js';
import { RULES } from './rules.js';
import { PATTERNS } from './patterns.js';

const $ = id => document.getElementById(id);
const canvas = $('world'), ctx = canvas.getContext('2d');
let cellSize = 8, running = true, speed = 10, stampMode = false, drawing = false;
let world;

function fit(){ const rect=canvas.getBoundingClientRect(); canvas.width=Math.floor(rect.width); canvas.height=Math.floor(rect.height); const cols=Math.floor(canvas.width/cellSize); const rows=Math.floor(canvas.height/cellSize); if(!world){ world=new World(cols,rows,RULES.Life); world.randomize(.18); } else world.resize(cols,rows); }
function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); for(let y=0;y<world.rows;y++) for(let x=0;x<world.cols;x++){ const i=world.index(x,y); if(world.grid[i]){ const age=Math.min(world.ages[i],40); ctx.fillStyle=`rgb(${40+age*3}, ${180+age}, ${120+age})`; ctx.fillRect(x*cellSize,y*cellSize,cellSize-1,cellSize-1); } } $('generation').textContent=world.generation; $('population').textContent=world.population(); }
function pointer(e){ const r=canvas.getBoundingClientRect(); return [Math.floor((e.clientX-r.left)/cellSize), Math.floor((e.clientY-r.top)/cellSize)]; }
function place(e){ const [x,y]=pointer(e); if(stampMode) world.stamp(PATTERNS[$('patternSelect').value],x,y); else world.set(x,y,1); draw(); }
function loop(){ if(running) world.step(); draw(); setTimeout(()=>requestAnimationFrame(loop),1000/speed); }
function initUI(){ for(const name of Object.keys(RULES)) $('ruleSelect').append(new Option(`${name} (${RULES[name].code})`,name)); for(const name of Object.keys(PATTERNS)) $('patternSelect').append(new Option(name,name)); $('playPause').onclick=()=>{ running=!running; $('playPause').textContent=running?'Pause':'Play'; }; $('step').onclick=()=>{ world.step(); draw(); }; $('randomize').onclick=()=>{ world.randomize(.18); draw(); }; $('clear').onclick=()=>{ world.clear(); draw(); }; $('ruleSelect').onchange=e=>{ world.rule=RULES[e.target.value]; $('ruleLabel').textContent=e.target.value; }; $('speed').oninput=e=>{ speed=+e.target.value; $('speedText').textContent=speed; }; $('cellSize').oninput=e=>{ cellSize=+e.target.value; $('cellSizeText').textContent=cellSize; fit(); draw(); }; $('stampMode').onclick=()=>{ stampMode=!stampMode; $('stampMode').textContent=`Stamp: ${stampMode?'On':'Off'}`; }; $('save').onclick=()=>{ localStorage.setItem('emergence-world',world.serialize()); }; $('load').onclick=()=>{ const s=localStorage.getItem('emergence-world'); if(s){ world.load(s); draw(); } }; $('exportRle').onclick=()=>{ $('exportBox').value=world.toRLE(); };
canvas.addEventListener('pointerdown',e=>{drawing=true; place(e)}); canvas.addEventListener('pointermove',e=>{ if(drawing) place(e)}); window.addEventListener('pointerup',()=>drawing=false); window.addEventListener('resize',()=>{fit(); draw();}); }
fit(); initUI(); draw(); loop();
