// Small toy models share meshes and bake their soft, upper-left light into vertex colors.
export function installAssets(P3) {
  const material = new P3.FlatMaterial({vertexColors: true});
  const cache = new Map();
  const tau = Math.PI * 2;
  const unit = ([x, y, z]) => {
    const length = Math.hypot(x, y, z) || 1;
    return [x / length, y / length, z / length];
  };

  function model(key, draw) {
    if (!cache.has(key)) {
      const positions = [], colors = [], indices = [];
      function vertex(point, normal, hex) {
        const amount = Math.max(0, normal[0] * -0.48 + normal[1] * 0.77 + normal[2] * 0.42);
        const light = 0.78 + amount * 0.24;
        positions.push(...point);
        colors.push(...[16, 8, 0].map((shift, i) =>
          Math.min(1, ((hex >> shift) & 255) / 255 * light + (1 - amount) * [0, 0.006, 0.018][i])
        ), 1);
        return positions.length / 3 - 1;
      }
      function triangle(a, b, c, color) {
        const u = b.map((v, i) => v - a[i]), v = c.map((n, i) => n - a[i]);
        const n = unit([u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]);
        indices.push(vertex(a, n, color), vertex(b, n, color), vertex(c, n, color));
      }
      // Rings run from bottom to top. A ring is [height, radius, offsetX, offsetZ].
      function rings(x,y,z,rx,ry,rz,profile,color,segments=12,tilt=0) {
        const start = positions.length / 3, cs = Math.cos(tilt), sn = Math.sin(tilt);
        /** @returns {[number, number, number]} */
        function rotate(px,py,pz) { return [cs*px-sn*py, sn*px+cs*py, pz]; }
        profile.forEach(([h,r,dx=0,dz=0],i) => {
          const lo=profile[Math.max(0,i-1)], hi=profile[Math.min(profile.length-1,i+1)];
          const dh=hi[0]-lo[0], dr=hi[1]-lo[1];
          for(let j=0;j<segments;j++) {
            const c=Math.cos(tau*j/segments), s=Math.sin(tau*j/segments);
            const p=rotate(rx*(r*c+dx),ry*h,rz*(r*s+dz));
            const n=unit(rotate(c*dh/rx,-dr/ry,s*dh/rz));
            vertex([p[0]+x,p[1]+y,p[2]+z],n,color);
          }
        });
        for(let i=0;i<profile.length-1;i++) for(let j=0;j<segments;j++) {
          const a=start+i*segments+j, b=start+i*segments+(j+1)%segments;
          indices.push(a,a+segments,b,b,a+segments,b+segments);
        }
      }
      function oval(x,y,z,rx,ry,rz,color,tilt=0,segments=12) {
        const profile=Array.from({length:9},(_,i)=>[-Math.cos(i*Math.PI/8),Math.sin(i*Math.PI/8)]);
        rings(x,y,z,rx,ry,rz,profile,color,segments,tilt);
      }
      function rod(x,y,z,rx,height,rz,color,tilt=0) {
        rings(x,y,z,rx,height,rz,[[-.5,0],[-.5,.91],[-.46,1],[.46,1],[.5,.91],[.5,0]],color,12,tilt);
      }
      // The outline is counterclockwise and visible from +Z.
      function badge(points,x,y,z,depth,color,center=[0,0],bevel=0) {
        const front=[x+center[0],y+center[1],z+depth/2+bevel];
        const back=[front[0],front[1],z-depth/2];
        points.forEach(([px,py],i) => {
          const [qx,qy]=points[(i+1)%points.length];
          const a=[x+px,y+py,z+depth/2], b=[x+qx,y+qy,z+depth/2];
          const c=[a[0],a[1],z-depth/2],d=[b[0],b[1],z-depth/2];
          triangle(front,a,b,color); triangle(back,d,c,color);
          triangle(a,c,d,color); triangle(a,d,b,color);
        });
      }
      draw({oval,rod,rings,badge});
      const geometry = new P3.Geometry3D({
        positions: new Float32Array(positions),
        colors: new Float32Array(colors),
        indices: new Uint16Array(indices)
      });
      cache.set(key,geometry);
    }
    return new P3.Mesh3D({geometry: cache.get(key), material});
  }

  function tree(variant=0) {
    const style=Math.abs(Math.floor(Number(variant)||0))%3;
    const foliage=[0x67cb5f,0x47c69b,0xa3d963][style];
    return model('tree'+style,({oval,rod,rings})=>{
      rod(0,.60,0,.17,1.18,.16,0xa77149);
      rod(-.17,.86,.02,.085,.55,.085,0xb67d53,.67);
      rod(.14,.96,-.02,.085,.47,.085,0xb67d53,-.76);
      if(style===1) {
        const tier=[[-.47,0],[-.44,.66],[-.36,.97],[-.16,1],[.48,.13],[.51,0]];
        rings(0,1.53,0,.89,1.32,.82,tier,0x3db595,12);
        rings(.03,2.15,0,.62,1.08,.60,tier,foliage,12);
      } else {
        oval(-.22,1.62,.03,.66,.70,.65,foliage,-.12);
        oval(.36,1.72,-.10,.60,.64,.58,foliage,.22);
        oval(.02,2.08,.02,.68,.70,.61,foliage,.09);
        if(style===2) for(const [x,y,z] of [[-.53,1.73,.48],[.29,2.1,.55],[.54,1.59,.29]]) {
          oval(x,y,z,.109,.115,.105,0xff8563);
        }
      }
    });
  }
  function flowers(variant=0) {
    const color=variant>255?variant:[0xff76a8,0xffe478,0xfff4d9][Math.abs(Number(variant)||0)%3]||0xff76a8;
    return model('flowers'+color,({oval,rod})=>{
      for(const [x,y,z,size] of [[-.14,.34,0,.86],[.12,.47,-.04,1],[.29,.28,.05,.70]]) {
        rod(x,y/2,z,.017,y,.017,0x529952);
        oval(x-.055,y*.45,z,.085,.036,.04,0x6cc656,-.48);
        for(let i=0;i<5;i++) {
          const a=tau*i/5;
          oval(x+Math.sin(a)*.066*size,y+Math.cos(a)*.066*size,z,.055*size,.06*size,.047*size,color);
        }
        oval(x,y,z+.04,.043*size,.046*size,.034*size,0xffc13b);
      }
    });
  }
  function hero() {
    const root=new P3.Container3D();
    const orange=0xf18b3d, cream=0xffe3b2, dark=0x44394a, scarf=0x31bdad;
    const body=model('fox',({oval,rod,badge})=>{
      oval(.11,.37,-.21,.15,.29,.14,orange,-.55);
      oval(.21,.55,-.24,.11,.15,.12,cream,-.60);
      oval(0,.36,0,.20,.24,.15,orange);
      oval(0,.34,.117,.135,.165,.062,cream);
      oval(0,.68,.01,.292,.245,.215,orange);
      for(const d of [-1,1]) {
        const x=d*.186;
        badge([[-.10,-.07],[.10,-.07],[d*.05,.14]],x,.865,.006,.12,orange);
        badge([[-.055,-.035],[.055,-.035],[d*.032,.081]],x,.877,.073,.012,0x934d43);
        oval(d*.116,.633,.157,.132,.086,.083,cream,d*.33);
        oval(d*.115,.72,.192,.031,.044,.023,dark);
        oval(d*.120,.736,.212,.009,.011,.006,0xfff8df);
      }
      oval(0,.622,.214,.072,.050,.050,cream);
      oval(0,.641,.257,.041,.029,.026,dark);
      rod(0,.524,0,.209,.078,.157,scarf);
      badge([[-.055,.11],[.02,-.03],[.055,.11]],-.096,.36,.154,.025,scarf);
    });
    root.addChild(body);
    const feet=[], arms=[];
    for(const d of [-1,1]) {
      const foot=model('fox-foot',({oval})=>{
        oval(0,-.044,0,.082,.074,.085,orange);
        oval(0,-.085,.020,.083,.063,.11,0x68474a);
      });
      foot.position.set(d*.108,.15,.01); root.addChild(foot); feet.push(foot);
      const arm=model('fox-arm'+d,({oval})=>{
        oval(d*.027,-.067,0,.062,.099,.061,orange,d*.23);
        oval(d*.045,-.130,.014,.050,.058,.053,0xad5b3b);
      });
      arm.position.set(d*.163,.443,0); root.addChild(arm); arms.push(arm);
    }
    root.animate=(time,move=0,airborne=false)=>{
      const swing=airborne?22:Math.sin(time*13)*move*33;
      for(let i=0;i<2;i++){
        const phase=i===0?1:-1;
        feet[i].angle.set(swing*phase,0,0);
        arms[i].angle.set(-swing*phase,0,airborne?phase*-42:0);
      }
      body.y=airborne?0:Math.abs(Math.sin(time*13))*.024*move;
    };
    return root;
  }
  const starPoints=Array.from({length:10},(_,i)=>{
    const a=Math.PI*.5+i*Math.PI/5,r=i%2?.51:1;
    return [Math.cos(a)*r,Math.sin(a)*r];
  });
  function star() {
    return model('star',({badge,oval})=>{
      badge(starPoints.map(([x,y])=>[x*.35,y*.35]),0,0,0,.11,0xffce42,[0,0],.059);
      for(const d of [-1,1]) oval(d*.059,.014,.112,.018,.039,.012,0x735034);
    });
  }
  function coin(){
    const disc=Array.from({length:20},(_,i)=>[.145*Math.cos(tau*i/20),.185*Math.sin(tau*i/20)]);
    return model('coin',({badge,oval})=>{
      badge(disc,0,0,0,.065,0xe89b31);
      badge(disc.map(([x,y])=>[x*.86,y*.86]),0,0,.038,.02,0xffcf48);
      oval(-.005,0,.055,.026,.096,.012,0xffef90);
    });
  }
  function flag(){
    return model('flag',({rod,oval,badge})=>{
      rod(0,.09,0,.28,.18,.28,0xb28767);
      rod(0,1.32,0,.050,2.48,.05,0xf5ddab);
      oval(0,2.63,0,.107,.109,.107,0xffce46);
      badge([[0,-.16],[.39,-.14],[.68,.01],[.39,.11],[0,.22]],.04,2.28,0,.034,0xfb675e,[.25,.02],.025);
      badge(starPoints.map(([x,y])=>[x*.083,y*.083]),.28,2.32,.045,.009,0xfff2c6);
    });
  }
  function sign(){
    return model('sign',({rod,badge})=>{
      rod(0,.34,0,.07,.68,.065,0xa57655);
      badge([[-.37,-.14],[.23,-.14],[.42,0],[.23,.14],[-.37,.14]],0,.66,0,.12,0xd8995b);
      badge([[-.20,-.036],[.07,-.036],[.07,-.081],[.20,0],[.07,.081],[.07,.036],[-.20,.036]],0,.66,.067,.01,0xffe9ac);
    });
  }
  function cloud() {
    return model('cloud',({oval})=>{
      for(const [x,y,z,rx,ry,rz] of [[-.65,.32,.03,.59,.31,.49],[-.23,.53,-.01,.62,.52,.54],[.27,.38,.04,.65,.38,.54],[.74,.29,-.03,.49,.26,.42]]) {
        oval(x,y,z,rx,ry,rz,0xfffcf2);
      }
    });
  }
  function rock() {
    return model('rock',({rings})=>{
      rings(0,0,0,.39,.49,.32,[[0,.82],[.17,1],[.63,.85,-.07],[.86,.43,-.18],[.89,0,-.18]],0xa2b4aa,7);
    });
  }
  return {tree, flowers, hero, flag, star, coin, sign, cloud, rock};
}
