import {Geometry3D,Mesh3D,FlatMaterial} from '@pixi/3d';
import {islands,stones,bridge,goal} from './course.js';

export function buildScenery(root,assets){
  const pos=[],rgb=[],idx=[];
  const tint=(col,k)=>[16,8,0].map(i=>Math.min(255,Math.round(((col>>i)&255)*k)));
  function face(a,b,c,d,col,k=1){
    const i=pos.length/3,color=tint(col,k);
    for(const v of [a,b,c,d]){pos.push(...v);rgb.push(...color,255)}
    idx.push(i,i+1,i+2,i,i+2,i+3);
  }
  function box(x,y,z,w,h,d,col){
    const l=x-w/2,r=x+w/2,b=y-h/2,t=y+h/2,f=z+d/2,n=z-d/2;
    face([l,t,f],[r,t,f],[r,t,n],[l,t,n],col);
    face([l,b,f],[r,b,f],[r,t,f],[l,t,f],col,.84);
    face([r,b,n],[l,b,n],[l,t,n],[r,t,n],col,.69);
    face([r,b,f],[r,b,n],[r,t,n],[r,t,f],col,.70);
    face([l,b,n],[l,b,f],[l,t,f],[l,t,n],col,.93);
    face([l,b,n],[r,b,n],[r,b,f],[l,b,f],col,.65);
  }
  let seed=929;function rand(){seed=seed*16807%2147483647;return seed/2147483647}
  const place=(obj,x,y,z,s=1)=>{obj.position.set(x,y,z);obj.scale.set(s,s,s);root.addChild(obj);return obj};
  function island([x,z,y,w,d,h],i){
    const nx=Math.max(2,Math.round(w/.83)),nz=Math.max(2,Math.round(d/.83)), rows=Math.round(h/.7);
    const soil=[0xcf8a4e,0xe2a062,0xd39355,0xe5a76a];
    for(let k=0;k<rows;k++){
      const by=y-.35-h+(k+.5)*h/rows, bh=h/rows;
      for(let j=0;j<nx;j++){
        box(x-w/2+(j+.5)*w/nx,by,z+d/2-.09,w/nx+.001,bh,.18,soil[(j+k)%4]);
        box(x-w/2+(j+.5)*w/nx,by,z-d/2+.09,w/nx+.001,bh,.18,soil[(j+k)%4]);
      }
      for(let j=0;j<nz;j++) for(const side of [-1,1])
        box(x+side*(w/2-.09),by,z-d/2+(j+.5)*d/nz,.18,bh,d/nz,soil[(j+k+1)%4]);
    }
    box(x,y-.20,z,w+.1,.40,d+.1,0x83bd43);
    box(x,y-.075,z,w+.15,.15,d+.15,0xafe264);
    for(let j=0;j<nx;j++)box(x-w/2+(j+.5)*w/nx,y-.39,z+d/2+.03,w/nx*.80,.11+rand()*.20,.10,0x89c44d);
    for(let j=0;j<w*d*.87;j++){
      const tx=x+(rand()-.5)*(w-.25),tz=z+(rand()-.5)*(d-.25);
      box(tx,y+.009,tz,.07+rand()*.17,.012,.045,rand()>.5?0xc6ee78:0x91cd51);
    }
    for(let j=0;j<3;j++)place(assets.flowers(j),x+(rand()-.5)*(w-.55),y,z+d/2-.25-rand()*.4,1.05);
    if(i===1||i===3){
      const wx=x-.5,wz=z+d/2+.10;
      box(wx,y-.045,wz-.45,.89,.10,1.1,0x6ad8e5);
      for(let j=0;j<5;j++)box(wx-.39+j*.19,y-h*.76,wz+.06,.198,h*1.54,.10,[0x96ecf1,0x73dcea,0x6bd2e9,0x9eeef3,0x65d6e4][j]);
    }
  }
  islands.forEach(island);
  stones.forEach(([x,z,y,w,d])=>{box(x,y-.48,z,w,.95,d,0xd49b66);box(x,y-.08,z,w+.05,.16,d+.05,0xb1df71)});
  const [bx,bz,by,bw,bd]=bridge;
  for(let i=0;i<9;i++)box(bx-bw/2+(i+.5)*bw/9,by-.10,bz,bw/9-.025,.20,bd,i%3?0xe6ae70:0xf4c489);
  for(const z of [bz-bd/2,bz+bd/2]){
    box(bx,by+.34,z,bw,.075,.08,0xc28d55);
    for(const t of [-.48,0,.48])box(bx+t*bw,by+.19,z,.12,.63,.12,0xcd9456);
  }
  function fence(x,y,z,n){box(x+(n-1)*.22,y+.24,z,(n-1)*.44,.085,.08,0xffe2a1);for(let i=0;i<n;i++)box(x+i*.44,y+.23,z,.13,.47,.12,0xffedba)}
  fence(-7.55,0,.26,5);fence(1.2,.55,-2.42,5);fence(4.25,1.35,-5.63,5);fence(3.48,.95,5.1,4);
  for(const [x,y,z,v,s] of [[-7.05,0,1.1,0,1.15],[-7.8,0,3.35,1,.65],[-4.8,.85,-4.5,0,1],[-6.8,.85,-4.25,1,.9],[.05,.55,-2.1,2,1.12],[3.3,.55,-2,1,.78],[4.45,1.35,-4.95,0,1.02],[7.9,1.35,-5.15,1,.85],[5.7,.95,3.15,2,.76]]){
    place(assets.tree(v),x,y,z,s);
    box(x,y+.012,z,.7*s,.014,.48*s,0x93c954);
  }
  place(assets.sign(),-3,0,3.4,1.2);place(assets.flag(),...goal,1.18);
  for(const [x,z,y,w,d] of islands){
    place(assets.rock(),x-w*.38,y,z+d*.27,.77);
    place(assets.flowers(2),x+w*.25,y,z-d*.37,1.15);
  }
  // A stepping trail winds through the meadow to its first bridge.
  for(let j=0;j<11;j++)box(-6.55+j*.47,.016,2.85-j*.13,.55,.018,.75, j%3===0?0xeccd8c:0xf1d697);
  const geo=new Geometry3D({positions:new Float32Array(pos),colors:new Uint8Array(rgb),indices:new Uint32Array(idx)});
  root.addChild(new Mesh3D({geometry:geo,material:new FlatMaterial({vertexColors:true})}));
}
