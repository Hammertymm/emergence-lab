export class World {
  constructor(cols, rows, rule){ this.cols=cols; this.rows=rows; this.rule=rule; this.generation=0; this.grid=new Uint8Array(cols*rows); this.ages=new Uint8Array(cols*rows); }
  index(x,y){ return ((y+this.rows)%this.rows)*this.cols+((x+this.cols)%this.cols); }
  get(x,y){ return this.grid[this.index(x,y)]; }
  set(x,y,v=1){ const i=this.index(x,y); this.grid[i]=v; this.ages[i]=v?Math.max(this.ages[i],1):0; }
  toggle(x,y){ this.set(x,y,this.get(x,y)?0:1); }
  clear(){ this.grid.fill(0); this.ages.fill(0); this.generation=0; }
  randomize(d=.18){ this.clear(); for(let i=0;i<this.grid.length;i++){ if(Math.random()<d){this.grid[i]=1;this.ages[i]=1;} } }
  countNeighbours(x,y){ let n=0; for(let yy=-1;yy<=1;yy++) for(let xx=-1;xx<=1;xx++) if(xx||yy) n+=this.get(x+xx,y+yy); return n; }
  step(){ const next=new Uint8Array(this.grid.length); const nextAges=new Uint8Array(this.grid.length); for(let y=0;y<this.rows;y++) for(let x=0;x<this.cols;x++){ const i=this.index(x,y), alive=this.grid[i], n=this.countNeighbours(x,y); const will=alive?this.rule.survive.includes(n):this.rule.birth.includes(n); if(will){next[i]=1; nextAges[i]=Math.min(255,(alive?this.ages[i]:0)+1);} } this.grid=next; this.ages=nextAges; this.generation++; }
  population(){ return this.grid.reduce((a,b)=>a+b,0); }
  resize(cols,rows){ const old=this; this.cols=cols; this.rows=rows; this.grid=new Uint8Array(cols*rows); this.ages=new Uint8Array(cols*rows); for(let y=0;y<Math.min(rows,old.rows);y++) for(let x=0;x<Math.min(cols,old.cols);x++){ const oi=old.index(x,y), ni=this.index(x,y); this.grid[ni]=old.grid[oi]; this.ages[ni]=old.ages[oi]; } }
  stamp(pattern,x,y){ for(const [px,py] of pattern) this.set(x+px,y+py,1); }
  serialize(){ return JSON.stringify({cols:this.cols,rows:this.rows,generation:this.generation,grid:Array.from(this.grid),ages:Array.from(this.ages)}); }
  load(json){ const d=JSON.parse(json); this.cols=d.cols; this.rows=d.rows; this.generation=d.generation||0; this.grid=Uint8Array.from(d.grid); this.ages=Uint8Array.from(d.ages||d.grid); }
  toRLE(){ let lines=[]; for(let y=0;y<this.rows;y++){ let row='',run=1,prev=this.get(0,y); for(let x=1;x<this.cols;x++){ const v=this.get(x,y); if(v===prev) run++; else { row+=(run>1?run:'')+(prev?'o':'b'); run=1; prev=v; } } row+=(run>1?run:'')+(prev?'o':'b'); lines.push(row); } return `x = ${this.cols}, y = ${this.rows}, rule = custom\n`+lines.join('$')+'!'; }
}
