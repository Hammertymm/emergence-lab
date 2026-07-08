export class SlimeWorld {
  constructor(cols, rows, count=800){ this.kind='slime'; this.cols=cols; this.rows=rows; this.generation=0; this.decay=.96; this.trail=new Float32Array(cols*rows); this.agents=[]; this.setAgents(count); }
  index(x,y){ return ((Math.floor(y)+this.rows)%this.rows)*this.cols+((Math.floor(x)+this.cols)%this.cols); }
  setAgents(count){ this.agents=[]; for(let i=0;i<count;i++) this.agents.push({x:Math.random()*this.cols,y:Math.random()*this.rows,a:Math.random()*Math.PI*2}); }
  clear(){ this.trail.fill(0); this.generation=0; }
  randomize(){ this.clear(); this.setAgents(this.agents.length||800); }
  population(){ return this.agents.length; }
  resize(cols,rows){ this.cols=cols; this.rows=rows; this.trail=new Float32Array(cols*rows); this.randomize(); }
  sense(agent, offset){ const dist=9, angle=agent.a+offset; const x=agent.x+Math.cos(angle)*dist, y=agent.y+Math.sin(angle)*dist; return this.trail[this.index(x,y)]; }
  step(){ for(let i=0;i<this.trail.length;i++) this.trail[i]*=this.decay; for(const a of this.agents){ const left=this.sense(a,-.55), front=this.sense(a,0), right=this.sense(a,.55); if(left>front && left>right) a.a-=.22; else if(right>front && right>left) a.a+=.22; else a.a+=(Math.random()-.5)*.08; a.x=(a.x+Math.cos(a.a)*1.35+this.cols)%this.cols; a.y=(a.y+Math.sin(a.a)*1.35+this.rows)%this.rows; this.trail[this.index(a.x,a.y)]=1; } this.generation++; }
  serialize(){ return JSON.stringify({kind:this.kind,cols:this.cols,rows:this.rows,generation:this.generation,decay:this.decay,agents:this.agents,trail:Array.from(this.trail)}); }
  load(json){ const d=JSON.parse(json); this.cols=d.cols; this.rows=d.rows; this.generation=d.generation||0; this.decay=d.decay||.96; this.agents=d.agents||[]; this.trail=Float32Array.from(d.trail||[]); }
  export(){ return this.serialize(); }
}
