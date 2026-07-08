export const MATERIALS = { empty:0, sand:1, water:2, plant:3, stone:4 };

export class MatterWorld {
  constructor(cols, rows){ this.kind='matter'; this.cols=cols; this.rows=rows; this.generation=0; this.grid=new Uint8Array(cols*rows); }
  index(x,y){ return y*this.cols+x; }
  inBounds(x,y){ return x>=0&&x<this.cols&&y>=0&&y<this.rows; }
  get(x,y){ return this.inBounds(x,y)?this.grid[this.index(x,y)]:MATERIALS.stone; }
  set(x,y,v){ if(this.inBounds(x,y)) this.grid[this.index(x,y)]=v; }
  clear(){ this.grid.fill(0); this.generation=0; }
  population(){ let n=0; for(const v of this.grid) if(v) n++; return n; }
  resize(cols,rows){ const old={cols:this.cols,rows:this.rows,grid:this.grid}; this.cols=cols; this.rows=rows; this.grid=new Uint8Array(cols*rows); for(let y=0;y<Math.min(rows,old.rows);y++) for(let x=0;x<Math.min(cols,old.cols);x++) this.grid[this.index(x,y)] = old.grid[y*old.cols+x]; }
  randomize(){ this.clear(); for(let x=0;x<this.cols;x++) this.set(x,this.rows-1,MATERIALS.stone); for(let i=0;i<this.cols*this.rows*.06;i++){ const x=Math.floor(Math.random()*this.cols), y=Math.floor(Math.random()*this.rows*.45); this.set(x,y,Math.random()<.72?MATERIALS.sand:MATERIALS.water); } for(let i=0;i<this.cols*.4;i++) this.set(Math.floor(Math.random()*this.cols),Math.floor(this.rows*.65+Math.random()*this.rows*.25),MATERIALS.plant); }
  brush(x,y,material,size){ const v=material==='eraser'?0:MATERIALS[material]; for(let yy=-size;yy<=size;yy++) for(let xx=-size;xx<=size;xx++) if(xx*xx+yy*yy<=size*size && Math.random()>.2) this.set(x+xx,y+yy,v); }
  swap(x1,y1,x2,y2){ const a=this.index(x1,y1), b=this.index(x2,y2); const t=this.grid[a]; this.grid[a]=this.grid[b]; this.grid[b]=t; }
  step(){ for(let y=this.rows-2;y>=0;y--) for(let x=(this.generation%2?0:this.cols-1); this.generation%2?x<this.cols:x>=0; this.generation%2?x++:x--){ const v=this.get(x,y); if(v===MATERIALS.sand){ const dir=Math.random()<.5?-1:1; if(this.get(x,y+1)===0||this.get(x,y+1)===MATERIALS.water) this.swap(x,y,x,y+1); else if(this.get(x+dir,y+1)===0||this.get(x+dir,y+1)===MATERIALS.water) this.swap(x,y,x+dir,y+1); else if(this.get(x-dir,y+1)===0||this.get(x-dir,y+1)===MATERIALS.water) this.swap(x,y,x-dir,y+1); }
      else if(v===MATERIALS.water){ const dir=Math.random()<.5?-1:1; if(this.get(x,y+1)===0) this.swap(x,y,x,y+1); else if(this.get(x+dir,y)===0) this.swap(x,y,x+dir,y); else if(this.get(x-dir,y)===0) this.swap(x,y,x-dir,y); }
      else if(v===MATERIALS.plant){ if(Math.random()<.006 && this.get(x,y-1)===0 && (this.get(x,y+1)===MATERIALS.plant || this.get(x,y+1)===MATERIALS.water || this.get(x,y+1)===MATERIALS.sand)) this.set(x,y-1,MATERIALS.plant); }
    } this.generation++; }
  serialize(){ return JSON.stringify({kind:this.kind,cols:this.cols,rows:this.rows,generation:this.generation,grid:Array.from(this.grid)}); }
  load(json){ const d=JSON.parse(json); this.cols=d.cols; this.rows=d.rows; this.generation=d.generation||0; this.grid=Uint8Array.from(d.grid); }
  export(){ return this.serialize(); }
}
