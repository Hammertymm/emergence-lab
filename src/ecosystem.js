export class EcosystemWorld {
  constructor(cols, rows){
    this.kind='ecosystem'; this.cols=cols; this.rows=rows; this.generation=0;
    this.plants=new Float32Array(cols*rows); this.nutrients=new Float32Array(cols*rows);
    this.herbivores=[]; this.predators=[]; this.climate={rain:.55, temperature:.62, mutation:.08};
    this.history=[]; this.randomize();
  }
  index(x,y){ return ((Math.floor(y)+this.rows)%this.rows)*this.cols+((Math.floor(x)+this.cols)%this.cols); }
  xy(i){ return [i%this.cols, Math.floor(i/this.cols)]; }
  randPos(){ return {x:Math.random()*this.cols,y:Math.random()*this.rows}; }
  clear(){ this.plants.fill(0); this.nutrients.fill(0); this.herbivores=[]; this.predators=[]; this.generation=0; this.history=[]; }
  randomize(){
    this.clear();
    for(let i=0;i<this.nutrients.length;i++){
      const y=Math.floor(i/this.cols)/this.rows;
      this.nutrients[i]=Math.max(0, Math.min(1, .25 + Math.random()*.55 + Math.sin(y*Math.PI*3)*.08));
      if(Math.random()<.18) this.plants[i]=Math.random()*.85;
    }
    for(let i=0;i<Math.max(30,Math.floor(this.cols*this.rows/650));i++) this.herbivores.push(this.makeAnimal('herbivore'));
    for(let i=0;i<Math.max(4,Math.floor(this.herbivores.length/8));i++) this.predators.push(this.makeAnimal('predator'));
  }
  makeAnimal(type, parent){
    const p=parent||this.randPos();
    const mutate=(v,spread=.08)=>Math.max(.05,Math.min(1.8,v+(Math.random()-.5)*spread*this.climate.mutation*8));
    const base=type==='predator'
      ? {speed:1.15,vision:8,metabolism:.78,breed:.68,turn:.32}
      : {speed:.82,vision:7,metabolism:.42,breed:.55,turn:.45};
    const dna=parent?.dna ? {
      speed:mutate(parent.dna.speed), vision:mutate(parent.dna.vision,.4), metabolism:mutate(parent.dna.metabolism), breed:mutate(parent.dna.breed), turn:mutate(parent.dna.turn)
    } : base;
    return {x:p.x,y:p.y,a:Math.random()*Math.PI*2,energy:type==='predator'?1.1:.9,age:0,dna,type};
  }
  resize(cols,rows){ this.cols=cols; this.rows=rows; this.plants=new Float32Array(cols*rows); this.nutrients=new Float32Array(cols*rows); this.randomize(); }
  population(){ return this.herbivores.length + this.predators.length + Math.floor(this.plantCount()); }
  plantCount(){ let n=0; for(const p of this.plants) if(p>.08) n++; return n; }
  stats(){
    const avg = arr => arr.length ? arr.reduce((s,a)=>s+a.dna.speed,0)/arr.length : 0;
    return {plants:this.plantCount(), herbivores:this.herbivores.length, predators:this.predators.length, avgHerbSpeed:avg(this.herbivores), avgPredSpeed:avg(this.predators), rain:this.climate.rain, temperature:this.climate.temperature};
  }
  nearestPlant(a){
    let best=null, bestD=1e9; const r=Math.ceil(a.dna.vision);
    for(let yy=-r;yy<=r;yy++) for(let xx=-r;xx<=r;xx++){
      const x=Math.floor(a.x+xx), y=Math.floor(a.y+yy), i=this.index(x,y), p=this.plants[i];
      if(p>.25){ const d=xx*xx+yy*yy; if(d<bestD){bestD=d; best={x,y,d};} }
    }
    return best;
  }
  nearestAnimal(a, list){
    let best=null, bestD=1e9; const r=a.dna.vision*1.35;
    for(const b of list){
      const dx=((b.x-a.x+this.cols/2)%this.cols)-this.cols/2, dy=((b.y-a.y+this.rows/2)%this.rows)-this.rows/2;
      const d=dx*dx+dy*dy; if(d<bestD && d<r*r){ bestD=d; best={animal:b,dx,dy,d}; }
    }
    return best;
  }
  moveToward(a, target, away=false){
    const dx=target.dx ?? (((target.x-a.x+this.cols/2)%this.cols)-this.cols/2);
    const dy=target.dy ?? (((target.y-a.y+this.rows/2)%this.rows)-this.rows/2);
    const desired=Math.atan2(dy,dx)+(away?Math.PI:0);
    let diff=Math.atan2(Math.sin(desired-a.a), Math.cos(desired-a.a));
    a.a += Math.max(-a.dna.turn, Math.min(a.dna.turn, diff));
  }
  stepPlants(){
    const rain=this.climate.rain, temp=this.climate.temperature;
    for(let i=0;i<this.plants.length;i++){
      const growth=this.nutrients[i]*rain*(1-Math.abs(temp-.58))*.035;
      this.plants[i]=Math.min(1.4,this.plants[i]+growth);
      this.nutrients[i]=Math.max(0,this.nutrients[i]-growth*.22+0.0015);
      if(this.plants[i]>.75 && Math.random()<.006){
        const [x,y]=this.xy(i); const j=this.index(x+Math.floor(Math.random()*7)-3,y+Math.floor(Math.random()*7)-3);
        if(this.plants[j]<.08) this.plants[j]=.12+Math.random()*.18;
      }
      if(Math.random()<.0009*(1-rain+.1)) this.plants[i]*=.6;
    }
  }
  stepHerbivores(){
    const born=[]; const survivors=[];
    for(const a of this.herbivores){
      a.age++; a.energy -= .004 + a.dna.metabolism*.008 + a.dna.speed*.002;
      const threat=this.nearestAnimal(a,this.predators);
      const food=this.nearestPlant(a);
      if(threat) this.moveToward(a,threat,true); else if(food) this.moveToward(a,food,false); else a.a+=(Math.random()-.5)*a.dna.turn;
      a.x=(a.x+Math.cos(a.a)*a.dna.speed+this.cols)%this.cols; a.y=(a.y+Math.sin(a.a)*a.dna.speed+this.rows)%this.rows;
      const i=this.index(a.x,a.y); if(this.plants[i]>.1){ const bite=Math.min(this.plants[i],.18); this.plants[i]-=bite; a.energy+=bite*.72; this.nutrients[i]+=bite*.05; }
      if(a.energy>1.55 && Math.random()<.018*a.dna.breed){ a.energy*=.55; born.push(this.makeAnimal('herbivore',a)); }
      if(a.energy>0 && a.age<1800) survivors.push(a); else this.nutrients[this.index(a.x,a.y)]=Math.min(1,this.nutrients[this.index(a.x,a.y)]+.25);
    }
    this.herbivores=survivors.concat(born).slice(0,1200);
  }
  stepPredators(){
    const born=[]; const survivors=[];
    for(const a of this.predators){
      a.age++; a.energy -= .009 + a.dna.metabolism*.014 + a.dna.speed*.004;
      const prey=this.nearestAnimal(a,this.herbivores);
      if(prey) this.moveToward(a,prey,false); else a.a+=(Math.random()-.5)*a.dna.turn;
      a.x=(a.x+Math.cos(a.a)*a.dna.speed+this.cols)%this.cols; a.y=(a.y+Math.sin(a.a)*a.dna.speed+this.rows)%this.rows;
      for(let i=this.herbivores.length-1;i>=0;i--){ const h=this.herbivores[i]; const dx=h.x-a.x, dy=h.y-a.y; if(dx*dx+dy*dy<2.2){ this.herbivores.splice(i,1); a.energy+=.72; break; } }
      if(a.energy>1.85 && Math.random()<.012*a.dna.breed){ a.energy*=.58; born.push(this.makeAnimal('predator',a)); }
      if(a.energy>0 && a.age<2200) survivors.push(a); else this.nutrients[this.index(a.x,a.y)]=Math.min(1,this.nutrients[this.index(a.x,a.y)]+.35);
    }
    this.predators=survivors.concat(born).slice(0,400);
  }
  disaster(kind){
    if(kind==='rain') this.climate.rain=Math.min(1,this.climate.rain+.18);
    if(kind==='drought') this.climate.rain=Math.max(.05,this.climate.rain-.22);
    if(kind==='mutation') this.climate.mutation=Math.min(.5,this.climate.mutation+.04);
    if(kind==='predators'){ for(let i=0;i<18;i++) this.predators.push(this.makeAnimal('predator')); }
    if(kind==='herbivores'){ for(let i=0;i<55;i++) this.herbivores.push(this.makeAnimal('herbivore')); }
    if(kind==='meteor'){
      const cx=Math.random()*this.cols, cy=Math.random()*this.rows, r=Math.min(this.cols,this.rows)*.12;
      for(let y=Math.floor(cy-r);y<cy+r;y++) for(let x=Math.floor(cx-r);x<cx+r;x++){ const dx=x-cx,dy=y-cy; if(dx*dx+dy*dy<r*r){ const i=this.index(x,y); this.plants[i]=0; this.nutrients[i]=Math.min(1,this.nutrients[i]+.55); } }
      this.herbivores=this.herbivores.filter(a=>(a.x-cx)**2+(a.y-cy)**2>r*r);
      this.predators=this.predators.filter(a=>(a.x-cx)**2+(a.y-cy)**2>r*r);
    }
  }
  step(){
    if(this.generation%420===0){ this.climate.rain=Math.max(.08,Math.min(1,this.climate.rain+(Math.random()-.5)*.18)); this.climate.temperature=Math.max(.1,Math.min(1,this.climate.temperature+(Math.random()-.5)*.12)); }
    this.stepPlants(); this.stepHerbivores(); this.stepPredators(); this.generation++;
    if(this.generation%30===0) this.history.push({...this.stats(), generation:this.generation});
    if(this.history.length>240) this.history.shift();
  }
  serialize(){ return JSON.stringify({kind:this.kind,cols:this.cols,rows:this.rows,generation:this.generation,plants:Array.from(this.plants),nutrients:Array.from(this.nutrients),herbivores:this.herbivores,predators:this.predators,climate:this.climate,history:this.history}); }
  load(json){ const d=JSON.parse(json); this.cols=d.cols; this.rows=d.rows; this.generation=d.generation||0; this.plants=Float32Array.from(d.plants||[]); this.nutrients=Float32Array.from(d.nutrients||[]); this.herbivores=d.herbivores||[]; this.predators=d.predators||[]; this.climate=d.climate||{rain:.55,temperature:.62,mutation:.08}; this.history=d.history||[]; }
  export(){ return this.serialize(); }
}
