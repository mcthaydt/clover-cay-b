// Distant ridges share the hue of the sky so the playable ledges retain the strongest contrast.
export function paintSky(canvas) {
  const w=1600,h=850;
  canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext('2d');
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#568fdb'); sky.addColorStop(.46,'#8bd6ed'); sky.addColorStop(.73,'#bce8e4'); sky.addColorStop(1,'#87c8d5');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  function silhouette(points,color){
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...points[0]);
    for(const [x,y] of points.slice(1))ctx.lineTo(x,y);
    ctx.closePath();ctx.fill();
  }
  function cloud(x,y,s,alpha){
    ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=alpha;
    const puff=new Path2D('M-117 16 Q-126 4 -101 0 Q-100 -18 -80 -16 Q-76 -45 -50 -35 Q-36 -81 1 -65 Q22 -58 29 -36 Q58 -52 76 -23 Q100 -28 105 -10 Q140 -10 145 9 Q143 18 102 17 L-117 17Z');
    ctx.fillStyle='#c4e9ee';ctx.fill(puff);ctx.translate(-4,-7);ctx.fillStyle='#f3faf0';ctx.fill(puff);ctx.restore();
  }
  for(const args of [[105,168,1.6,.85],[398,88,.49,.8],[758,142,.74,.67],[1094,56,.61,.79],[1465,176,1.7,.89]])cloud(...args);
  function peak(x,y,s,color,shadow){
    silhouette([[x-185*s,h],[x-174*s,y+123*s],[x-112*s,y+59*s],[x-88*s,y+66*s],[x-34*s,y+5*s],[x-12*s,y],[x+14*s,y+10*s],[x+38*s,y+50*s],[x+73*s,y+38*s],[x+147*s,y+119*s],[x+192*s,h]],color);
    silhouette([[x-14*s,y+3*s],[x+14*s,y+10*s],[x+38*s,y+50*s],[x+73*s,y+38*s],[x+118*s,y+98*s],[x+78*s,y+76*s],[x+56*s,y+86*s],[x+19*s,y+55*s]],shadow);
  }
  for(const [x,y,s] of [[-20,318,1.8],[235,386,1.35],[520,411,1.3],[805,370,1.5],[1100,407,1.4],[1370,315,1.8],[1610,374,1.5]])peak(x,y,s,'#91c9d8','#82bccc');
  for(const a of [[-25,463,1.45,.82],[280,491,.8,.62],[731,474,1.1,.67],[1100,431,.8,.74],[1510,488,1.3,.87]])cloud(...a);
  for(const [x,y,s] of [[-50,560,1.8],[179,615,1.32],[505,688,1.2],[880,693,1.4],[1208,620,1.9],[1560,546,1.6]])peak(x,y,s,'#80b9c6','#74aebf');
  for(const a of [[24,755,2.2,.79],[528,833,2.1,.75],[1020,798,1.9,.59],[1540,751,2.3,.8]])cloud(...a);
}
