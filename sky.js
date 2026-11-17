// The painted horizon sits behind the live 3D diorama.
export function paintSky(canvas){
  const w=1400,h=620;canvas.width=w;canvas.height=h;
  const c=canvas.getContext('2d'),gradient=c.createLinearGradient(0,0,0,h);
  gradient.addColorStop(0,'#64b9ef');gradient.addColorStop(.55,'#a5e2f3');gradient.addColorStop(1,'#def8ef');
  c.fillStyle=gradient;c.fillRect(0,0,w,h);
  function oval(x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
  function cloud(x,y,s,alpha){
    c.save();c.globalAlpha=alpha;c.translate(x,y);c.scale(s,s);
    const p=new Path2D('M-94 12 Q-101 -4 -79 -8 Q-84 -27 -56 -28 Q-44 -52 -20 -37 Q-4 -70 23 -50 Q39 -54 52 -27 Q79 -34 85 -13 Q109 -13 111 6 Q101 19 68 18 L-65 19 Q-84 20 -94 12');
    c.fillStyle='#ccf1f8';c.fill(p);c.translate(-3,-5);c.fillStyle='#f5ffff';c.fill(p);c.restore();
  }
  [[38,120,.78,.88],[248,68,.46,.82],[584,101,.55,.92],[869,56,.4,.80],[1205,103,.95,.95],[1392,165,.65,.9],[335,225,.55,.50],[980,190,.68,.66]].forEach(a=>cloud(...a));
  function distant(x,y,s){
    c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#8ccdd5';c.beginPath();c.moveTo(-87,0);c.lineTo(81,0);c.lineTo(55,26);c.lineTo(35,30);c.lineTo(18,51);c.lineTo(-3,38);c.lineTo(-25,46);c.lineTo(-47,22);c.lineTo(-67,20);c.closePath();c.fill();oval(-3,-1,87,14,'#a7dfd7');
    for(const [x,h] of [[-40,25],[-23,40],[17,35],[37,22]]){c.fillStyle='#87d0cf';c.beginPath();c.moveTo(x-8,-5);c.lineTo(x,-h);c.lineTo(x+8,-5);c.fill()}c.restore();
  }
  distant(115,260,.83);distant(913,187,.46);distant(1270,294,1.12);distant(442,203,.42);
  function bank(y,amp,col,offset){c.fillStyle=col;c.beginPath();c.moveTo(-80,h);c.lineTo(-80,y);for(let x=-80;x<w+90;x+=63){const a=y+Math.sin(x*.014+offset)*amp;c.quadraticCurveTo(x+31,a-27,x+63,y+Math.sin((x+63)*.014+offset)*amp)}c.lineTo(w+90,h);c.fill()}
  bank(460,35,'#b9e8ed',.4);bank(500,27,'#cceff0',2);bank(552,25,'#e1f7f4',3);
  cloud(78,478,1.45,.68);cloud(1370,429,1.32,.7);cloud(1103,535,.95,.64);
}
