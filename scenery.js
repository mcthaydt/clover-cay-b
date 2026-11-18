import {Geometry3D,Mesh3D,FlatMaterial} from '@pixi/3d';
import {islands,stones,bridge,goal} from './course.js';

export function buildScenery(root,assets){
  let positions=[],colors=[],indices=[];
  function flush(){
    const geometry=new Geometry3D({positions:new Float32Array(positions),colors:new Float32Array(colors),indices:new Uint32Array(indices)});
    const mesh=new Mesh3D({geometry,material});
    root.addChild(mesh);
    positions=[];colors=[];indices=[];
    return mesh;
  }
  let seed=5821;
  const random=()=>((seed=seed*16807%2147483647)/2147483647);
  const material=new FlatMaterial({vertexColors:true});
  function face(points,hex,light=1){
    const start=positions.length/3;
    const color=[16,8,0].map(bit=>Math.pow(Math.min(1,((hex>>bit)&255)/255*light),2.2));
    for(const point of points){positions.push(...point);colors.push(...color,1)}
    for(let j=2;j<points.length;j++)indices.push(start,start+j-1,start+j);
  }
  function band(x,y,z,outline,layers){
    for(let k=1;k<layers.length;k++){
      const [a,sa]=layers[k-1],[b,sb,color]=layers[k];
      for(let i=0;i<outline.length;i++){
        const [u,v]=outline[i],[n,m]=outline[(i+1)%outline.length];
        const shade=.81+.15*(v-m)/Math.max(.1,Math.hypot(u-n,v-m))+.12*(n-u)/Math.max(.1,Math.hypot(u-n,v-m));
        face([[x+u*sa,y+a,z+v*sa],[x+n*sa,y+a,z+m*sa],[x+n*sb,y+b,z+m*sb],[x+u*sb,y+b,z+v*sb]],color,shade);
      }
    }
    const [height,scale,color]=layers.at(-1);
    face(outline.map(([u,v])=>[x+u*scale,y+height,z+v*scale]),color);
  }
  function rect(w,d,cut=0){
    const a=w/2,b=d/2,k=Math.min(cut,a*.4,b*.4);
    return [[-a+k,b],[a-k,b],[a,b-k],[a,-b+k],[a-k,-b],[-a+k,-b],[-a,-b+k],[-a,b-k]];
  }
  function slab(x,y,z,w,h,d,col,cut=.02){
    band(x,y,z,rect(w,d,cut),[[-h,1],[0,1,col]]);
  }
  function disk(x,y,z,rx,rz,color){
    const loop=Array.from({length:16},(_,j)=>[x+rx*Math.cos(-j*Math.PI/8),y,z+rz*Math.sin(-j*Math.PI/8)]);
    face(loop,color);
  }
  function place(obj,x,y,z,s=1){obj.position.set(x,y,z);obj.scale.set(s,s,s);root.addChild(obj);return obj}
  function tree(x,y,z,v,s){
    disk(x+.12*s,y+.022,z+.12*s,.66*s,.44*s,0x73983e);
    place(assets.tree(v),x,y,z,s);
  }
  function island([x,z,y,w,d,h],i){
    const outline=rect(w,d,.37);
    band(x,y,z,outline,[[-h-.3,.69],[-h+.05,.84,0x526784],[-h*.56,.96,0x78738a],[-h*.48,.97,0xaaa094],[-h*.43,.98,0x8c858e],[-.32,1,0xc98a65],[-.24,1.018,0x9a6255],[-.13,1.022,0x488738],[-.045,1.026,0x79b93e],[0,1.013,0x9bce55]]);
    // Moss breaks the straight cliff lip while the walkable top keeps its full footprint.
    for(let n=0;n<Math.ceil(w*1.8);n++){
      const xx=x-w*.42+(n+.35)*w*.84/Math.ceil(w*1.8),zz=z+d*.51+.016;
      const width=.13+random()*.18,depth=.17+random()*.14;
      face([[xx-width,y-.07,zz],[xx-width*.79,y-depth+.025,zz],[xx-width*.34,y-depth-.02,zz],[xx+.04,y-depth+.035,zz],[xx+width,y-.13,zz],[xx+width,y-.07,zz]],n%3?0x6dac46:0x82bc48);
    }
    // The upper stratum fractures into broad, irregular faces; ochre and mauve carry the footwall.
    const count=Math.ceil(w*1.25);
    for(let n=0;n<count;n++){
      const xx=x-w*.43+(n+.5)*w*.86/count,half=w*.43/count,zz=z+d*.50+.018;
      const dent=.08+random()*.21,offset=(random()-.5)*half;
      const crown=[xx+offset,y-.32,zz],low=[xx+offset*.5,y-.66-dent,zz-.005];
      const left=[xx-half,y-.51,zz],right=[xx+half,y-.51,zz];
      face([left,low,crown],n%3?0xc48764:0xcb906e);
      face([crown,low,right],n%2?0xc08a6a:0xbd8261);
    }
    // Small trailing plants emphasize the drop below the turf.
    for(const t of [-.29,.37]){
      const xx=x+w*t,zz=z+d*.515+.025;
      const depth=.23+random()*.34;
      face([[xx-.014,y-.12,zz],[xx-.004,y-.12-depth,zz],[xx+.022,y-.12-depth,zz],[xx+.026,y-.12,zz]],0x59853b);
      for(let k=0;k<4;k++){
        const yy=y-.19-k*depth/4,dir=k%2?1:-1;
        const leaf=[[xx,yy,zz+.007],[xx+.13*dir,yy+.037,zz+.007],[xx+.097*dir,yy-.063,zz+.007],[xx+.035*dir,yy-.077,zz+.007]];
        if(dir===1)leaf.reverse();
        face(leaf,k%2?0x83b946:0xa3c856);
      }
    }
    for(let n=0;n<Math.floor(w*d*.8);n++){
      const xx=x+(random()-.5)*(w-.4),zz=z+(random()-.5)*(d-.4);
      disk(xx,y+.006,zz,.06+random()*.07,.028+random()*.04,n%4?0x93ca55:0xb5e276);
    }
    // Dense, seeded flecks stay in the terrain batch, keeping the meadow to one draw call.
    const bladeColors=[0x95c651,0xa5d76c,0xb4dd71,0x91c54f,0xa9d860];
    for(let n=0;n<Math.floor(w*d*80);n++){
      const xx=x+(random()-.5)*(w-.20),zz=z+(random()-.5)*(d-.20);
      if(Math.abs(xx-x)>w/2-.36 && Math.abs(zz-z)>d/2-.36)continue;
      const len=.017+random()*.045,shade=bladeColors[n%bladeColors.length];
      face([[xx-len*.6,y+.009,zz+.009],[xx+len,y+.016,zz-.008],[xx-len*.1,y+.011,zz-.026]],shade);
    }
    for(let n=0;n<3;n++){
      const side=n%2?-1:1,xx=x+side*w*.38,zz=z+(n-1)*d*.28;
      place(assets.flowers(i%3),xx,y,zz,.92);
      if(n===0)place(assets.rock(),xx+.19,y,zz+.12,.69);
    }
  }
  islands.forEach(island);
  for(const [x,z,y,w,d] of stones){
    band(x,y,z,rect(w,d,.18),[[-1.24,.48],[-.75,.81,0x647282],[-.2,1,0xa59085],[-.07,1.05,0x5b913f],[0,1.01,0xb7dd69]]);
  }
  const [bx,bz,by,bw,bd]=bridge;
  for(let j=0;j<8;j++)slab(bx-bw/2+(j+.5)*bw/8,by,bz,bw/8-.012,.14,bd,j%2?0xe8b475:0xc58a55);
  for(const side of [-1,1]){
    const zz=bz+side*bd*.51;
    for(const end of [-1,1])slab(bx+end*bw*.48,by+.42,zz,.10,.56,.1,0x98624c);
    for(let j=0;j<8;j++){
      const center=bx+((j+.5)/8-.5)*bw,height=by+.30-.10*Math.sin(Math.PI*(j+.5)/8);
      slab(center,height,zz,bw/8+.003,.04,.04,0xffdaa0);
    }
  }
  // Each route has one landmark visible above its tree line.
  const [landing,fork,summit,grove,sky,blossom]=islands;
  function at(i,u,v){return [i[0]+u*i[3],i[2],i[1]+v*i[4]]}
  tree(...at(landing,-.39,-.36),0,.88);
  tree(...at(landing,-.40,.29),1,.43);
  tree(...at(grove,-.36,-.29),0,.78);
  tree(...at(grove,.35,-.29),1,.61);
  tree(...at(blossom,-.34,-.27),2,.94);
  tree(...at(blossom,.30,-.33),2,.60);
  tree(...at(sky,.36,-.31),1,.79);
  tree(...at(summit,.40,.27),1,.54);
  const [sx,sy,sz]=at(fork,-.33,-.34);
  place(assets.sign(),sx,sy,sz,1.17);
  place(assets.flag(),...goal,1.18);
  // A coral-roofed mill and cream sail wheel form the summit silhouette.
  const [mx,my,mz]=at(summit,-.26,-.28);
  const octagon=Array.from({length:10},(_,i)=>[.54*Math.cos(-i*Math.PI/5),.54*Math.sin(-i*Math.PI/5)]);
  band(mx,my,mz,octagon,[[0,1],[.18,1,0xe3b67f],[1.16,.77,0xffe8af],[1.30,.77,0xbd6148],[1.38,1.02,0xfc8659],[1.46,1.02,0xe35447],[2.12,.08,0xe75b49]]);
  flush();
  const hub=[mx,my+1.12,mz+.48];
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2+.52,c=Math.cos(a),s=Math.sin(a);
    const sail=(r,t,depth)=>[c*r-s*t,s*r+c*t,depth];
    face([sail(0,-.026,0),sail(1.06,-.026,0),sail(1.06,.026,0),sail(0,.026,0)],0x834c42);
    face([sail(.30,.015,.007),sail(1.03,.015,.007),sail(.98,.23,.007),sail(.38,.19,.007)],0xffe7a1);
    for(const r of [.50,.72,.92])face([sail(r,.015,.012),sail(r+.022,.015,.012),sail(r+.022,.18,.012),sail(r,.18,.012)],0xc49664);
  }
  const wheel=flush();
  wheel.position.set(...hub);
  // The blue stream reaches the edge and fans into a pair of lips at its foot.
  const [fx,fy,fz]=at(fork,.14,.50);
  slab(fx,fy+.047,fz-.38,.85,.052,.85,0x31ced1);
  for(let k=0;k<4;k++)disk(fx+(k%2?.14:-.20),fy+.052,fz-.15-k*.14,.105,.018,0x9ceddc);
  const water=[0x94faf3,0x38c5d0,0x51dbe4,0xb2fff1,0x32b9cd,0x69e2e4];
  for(let j=0;j<6;j++){
    const xx=fx-.42+j*.14,drop=fork[5]+.35+random()*.32;
    face([[xx-.027,fy-drop+.1,fz+.20],[xx+.17,fy-drop,fz+.20],[xx+.145,fy+.023,fz+.073],[xx,fy+.023,fz+.073]],water[j]);
  }
  for(let n=0;n<7;n++)place(assets.cloud(),fx+(n%3-1)*.24,fy-fork[5]-.43+random()*.17,fz+.21+random()*.22,.22+random()*.22);
  for(const i of [landing,fork,summit]){
    const [x,z,y,w]=i;
    for(let j=0;j<6;j++){
      const center=x+(j-2.5)*w*.147,offset=Math.sin(j*.92)*.16;
      const p=rect(.46+random()*.11,.32+random()*.08,.12);
      band(center,y+.016,z+offset,p,[[-.013,1],[0,1,j%3?0xd8ca8b:0xe0ce91]]);
    }
  }
  flush();
  for(let j=0;j<9;j++){
    const xx=fx-.34+(j%5)*.16,yy=fy-.28-.32*j;
    face([[xx,yy-.17,fz+.25],[xx+.022,yy-.10,fz+.25],[xx+.025,yy+.10,fz+.25],[xx+.012,yy+.14,fz+.25]],0xb7fff4);
  }
  const foam=flush();
  return time=>{
    wheel.rotation.z=time*.42;
    foam.y=-.24*(1-Math.cos(time*3.2));
  };
}
