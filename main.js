import { Application } from 'pixi.js';
import * as P3 from '@pixi/3d';
import R from '@dimforge/rapier3d-compat';
import { createWorld, trait } from 'koota';
import { Effect } from 'effect';
import { Klipp, VirtualCamera, FollowBody, HardLookAtAim, targetPose } from '@pmndrs/klipp';
import { clamp, lerp } from 'math';
import { installAssets } from './assets.js';
import { buildScenery } from './scenery.js';
import { paintSky } from './sky.js';
import { islands, stones, bridge, groundAt, stars, coins, spawn, goal, locationAt } from './course.js';
import { icon } from './ui.js';

const $=id=>document.getElementById(id);
paintSky($('sky'));
const objects=installAssets(P3),scene=$('scene'),render=$('render'),keys=new Set();
const ecs=createWorld(),Pickup=trait({x:0,y:0,z:0,kind:'coin',index:0}),Collected=trait(),Visual=trait(()=>null);
const app=new Application();
let mode='loading',sound=true,audio,started=false,elapsed=0,coinCount=0,starCount=0,toastUntil=0,guideReturn='play';
let body,physics,hero,shadow,view,camRig,shotTarget,accumulator=0,coyote=0,jumpBuffer=0,lastGround=0,passed=false;
let falls=0,clock=0,checkpoint=spawn,moveAmount=0,heading=0;
const timeText=t=>[Math.floor(t/60),Math.floor(t%60)].map(n=>String(n).padStart(2,'0')).join(':');
function note(freq,length=.12,delay=0,type='sine'){
  if(!audio||!sound)return;
  const osc=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+delay;
  osc.type=type;osc.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+length);osc.connect(g);g.connect(audio.destination);osc.start(t);osc.stop(t+length+.02);
}
function unlock(){if(!audio&&sound){try{audio=new AudioContext()}catch{/* Browsers without Web Audio can still play. */}}if(audio?.state==='suspended')audio.resume().catch(()=>{})}
function toast(msg){$('toast').textContent=msg;$('toast').style.opacity='1';toastUntil=clock+1.8}
function updateHud(){
  $('coins').textContent=String(coinCount).padStart(2,'0');$('stars').innerHTML=starCount+'<small>/3</small>';
  const collected=new Set(ecs.query(Pickup,Collected).map(e=>e.get(Pickup)).filter(p=>p.kind==='star').map(p=>p.index));
  document.querySelectorAll('.slots span').forEach((s,i)=>s.classList.toggle('found',collected.has(i)));
}
function play(){mode='play';$('overlay').hidden=true;scene.focus({preventScroll:true})}
function dialog(state,title,html,actions,symbol){
  mode=state;$('overlay').dataset.state=state;keys.clear();jumpBuffer=0;$('dialog-title').textContent=title;$('dialogBody').innerHTML=html;$('dialogIcon').textContent=symbol;$('actions').replaceChildren();
  for(const [name,fn] of actions){const b=document.createElement('button');b.textContent=name;b.onclick=fn;$('actions').append(b)}
  $('overlay').hidden=false;$('actions').querySelector('button').focus({preventScroll:true});
}
function pause(){if(mode==='play')dialog('pause','Taking a breather','<p>Your expedition is paused.</p>',[['Resume',play],['Restart course',restart]],'Ⅱ');else if(mode==='pause')play()}
function guide(){if(mode!=='play'&&mode!=='pause')return;guideReturn=mode;dialog('guide','Field guide','<p>Three stars lie off the main trail.</p><div class="hint"><b>Grove star</b> · Jump north from the waterfall fork.</div><div class="hint"><b>Sky star</b> · Head right from the grove, then return to the flag.</div><div class="hint"><b>Blossom star</b> · Look north of Meadow Landing.</div>',[['Back to course',()=>{play();if(guideReturn==='pause')pause()}]],'✦')}
function respawn(){body.setTranslation({x:checkpoint[0],y:checkpoint[1],z:checkpoint[2]},true);body.setLinvel({x:0,y:0,z:0},true);jumpBuffer=0;coyote=0}
function restart(){for(const e of ecs.query(Collected)){e.remove(Collected);e.get(Visual).visible=true}checkpoint=spawn;falls=0;clock=0;accumulator=0;toastUntil=0;$('toast').style.opacity='0';coinCount=starCount=elapsed=0;started=passed=false;respawn();updateHud();$('time').textContent='00:00';play()}
function win(){passed=true;note(523);note(659,.16,.12);note(784,.3,.24);dialog('won','Summit reached!','<p>'+starCount+' of 3 stars · '+coinCount+' coins · '+timeText(elapsed)+'</p>',[['Play again',restart],['Keep exploring',play]],'★ ⚑ ★')}
$('guide').onclick=guide;$('pause').onclick=pause;
$('sound').onclick=()=>{sound=!sound;if(sound){unlock();note(660)}$('sound').innerHTML=icon(sound?'volume':'muted')+'<span>Sound '+(sound?'on':'off')+'</span>';$('sound').setAttribute('aria-pressed',String(sound))};
$('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await scene.requestFullscreen()}catch{toast('Fullscreen is unavailable in this view')}};
const controls=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Space','ShiftLeft','ShiftRight'];
function down(key){if(mode!=='play')return;unlock();started=true;if(key==='Space'&&!keys.has(key))jumpBuffer=.16;keys.add(key)}
window.addEventListener('keydown',e=>{
  if(e.code==='Escape'&&!e.repeat){if(mode==='guide')$('actions').querySelector('button').click();else pause();return}
  if(controls.includes(e.code)&&mode==='play'&&!(e.code==='Space'&&(e.target instanceof Element && e.target.closest('button')))){e.preventDefault();down(e.code)}
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();if(started&&mode==='play')pause()});
document.querySelectorAll('[data-key]').forEach(b=>{if (!(b instanceof HTMLButtonElement)) return; b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);down(b.dataset.key)};b.onlostpointercapture=()=>keys.delete(b.dataset.key)});
scene.addEventListener('pointerdown',e=>{if(!(e.target instanceof Element && e.target.closest('button')))scene.focus({preventScroll:true})});
function pick(kind,list){
  list.forEach(([x,y,z],index)=>{const m=objects[kind]();m.position.set(x,y,z);const s=kind==='star'?1.25:1.65;m.scale.set(s,s,s);view.root.addChild(m);ecs.spawn(Pickup({x,y,z,kind,index}),Visual(m))});
}
function fixedStep(){
  const dt=1/60,held=(...k)=>k.some(v=>keys.has(v))?1:0;
  const right=held('KeyD','ArrowRight')-held('KeyA','ArrowLeft'),down=held('KeyS','ArrowDown')-held('KeyW','ArrowUp'),len=Math.hypot(right,down);
  // World-space basis matches the elevated three-quarter camera.
  const dx=right/(len||1),dz=down/(len||1);
  const p=body.translation(),v=body.linvel(),surface=groundAt(p.x,p.z),feet=p.y-.47;
  const grounded=v.y<=.15&&feet>=surface-.12&&feet<=surface+.09;
  coyote=grounded?.105:Math.max(0,coyote-dt);jumpBuffer=Math.max(0,jumpBuffer-dt);
  let vy=v.y;if(coyote>0&&jumpBuffer>0){vy=7.5;coyote=jumpBuffer=0;note(325,.08,0,'triangle')}
  const speed=held('ShiftLeft','ShiftRight')?6.5:4.25;
  body.setLinvel({x:lerp(v.x,dx*speed,grounded?.42:.21),y:vy,z:lerp(v.z,dz*speed,grounded?.42:.21)},true);
  physics.step();moveAmount=len?1:0;if(len)heading=Math.atan2(dx,dz);
  if(grounded)lastGround=surface;
  if(p.y < -6){falls++;respawn();toast(starCount ? 'Back on the trail · stars kept!' : 'Back on the trail');return}
  if(Math.abs(p.x)<1.6&&Math.abs(p.z-1)<1.5&&grounded&&checkpoint===spawn){checkpoint=[0,.65,1];toast('Waterfall Fork · jump up for a star!')}
  if(!passed&&Math.hypot(p.x-goal[0],p.z-goal[2])<.8&&Math.abs(feet-goal[1])<1.0)win();
}
function frame(dt){
  if(mode==='play'){
    clock+=dt;if(toastUntil && clock>=toastUntil){$('toast').style.opacity='0';toastUntil=0}if(started)elapsed+=dt;accumulator+=dt;while(accumulator+1e-10>=1/60&&mode==='play'){fixedStep();accumulator-=1/60}
    const p=body.translation();hero.position.set(p.x,p.y-.47,p.z);hero.rotation.y=heading;hero.animate(clock,moveAmount,Math.abs(body.linvel().y)>.4);
    const floor=groundAt(p.x,p.z);shadow.visible=floor>-10;shadow.position.set(p.x,floor+.032,p.z);const ss=clamp(1-(p.y-.47-floor)*.18,.5,1);shadow.scale.set(ss,1,ss);
    for(const e of ecs.query(Pickup)){
      if(e.has(Collected))continue;
      const data=e.get(Pickup),m=e.get(Visual);m.position.y=data.y+Math.sin(clock*2.5+data.index)*.075;m.rotation.y=.4+Math.sin(clock*1.9+data.index*.25)*.7;
      if(Math.hypot(p.x-data.x,p.y-data.y,p.z-data.z)<(data.kind==='star'?.85:.64)){
        e.add(Collected);m.visible=false;if(data.kind==='star'){starCount++;toast(['Grove star found!','Sky star found!','Blossom star found!'][data.index]);note(784);note(1046,.22,.11)}else{coinCount++;note(980,.09)}updateHud()
      }
    }
    $('time').textContent=timeText(elapsed);$('location').textContent=locationAt(p.x,p.z);
    const compact=render.clientWidth/render.clientHeight<1.55;
    const follow=compact?.87:started?.18:0;
    shotTarget.position[0]=lerp(0,p.x,follow);shotTarget.position[1]=lerp(.3,lastGround+.4,follow);shotTarget.position[2]=lerp(-1.15,p.z,follow);
    camRig.update(dt);view.camera.position.set(...camRig.shot.position);view.camera.quaternion.set(...camRig.shot.quaternion);
    const desired=compact?6.4:Math.max(9.4,18.8*render.clientHeight/render.clientWidth);
    view.camera.orthographicSize=lerp(view.camera.orthographicSize,desired,1-Math.exp(-3*dt));
  }
}
function makeShadow(){
  const pts=[0,0,0],idx=[];for(let i=0;i<20;i++){const a=i*Math.PI/10;pts.push(.4*Math.cos(a),0,.24*Math.sin(a));idx.push(0,(i+1)%20+1,i+1)}
  return new P3.Mesh3D({geometry:new P3.Geometry3D({positions:new Float32Array(pts),indices:new Uint16Array(idx)}),material:new P3.FlatMaterial({baseColor:0x769b45})});
}
const boot=Effect.gen(function*(){
  yield* Effect.promise(()=>R.init());
  yield* Effect.promise(()=>app.init({preference:'webgl',preferWebGLVersion:2,backgroundAlpha:0,antialias:true,resolution:Math.min(devicePixelRatio,1.5),autoDensity:true,resizeTo:render}));
  render.append(app.canvas);view=new P3.View3D({autoResize:true,toneMapping:'none'});app.stage.addChild(view);
  view.camera.mode='orthographic';view.camera.orthographicSize=render.clientWidth/render.clientHeight<1.55?6.4:Math.max(9.4,18.8*render.clientHeight/render.clientWidth);
  shotTarget=targetPose.create();camRig=new Klipp();const camera=new VirtualCamera('Explore',{priority:10});camRig.add(camera);
  camera.body=new FollowBody(shotTarget,{offset:[0,14,18],damping:.25});camera.aim=new HardLookAtAim(shotTarget);
  physics=new R.World({x:0,y:-20,z:0});physics.timestep=1/60;
  for(const [x,z,y,w,d] of [...islands,bridge,...stones])physics.createCollider(R.ColliderDesc.cuboid(w/2,.65,d/2).setTranslation(x,y-.65,z).setFriction(0));
  body=physics.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(...spawn).lockRotations().setCcdEnabled(true));
  physics.createCollider(R.ColliderDesc.capsule(.21,.26).setFriction(0).setRestitution(0),body);
  buildScenery(view.root,objects);hero=objects.hero();hero.scale.set(1.32,1.32,1.32);view.root.addChild(hero);shadow=makeShadow();view.root.addChild(shadow);pick('coin',coins);pick('star',stars);
  mode='play';frame(1/60);
  Object.defineProperty(window,'cloverExpedition',{value:()=>Object.freeze({
    mode, stars:starCount, coins:coinCount, falls, elapsed,
    x:body.translation().x, y:body.translation().y, z:body.translation().z,
    location:locationAt(body.translation().x,body.translation().z),
    checkpoint:checkpoint===spawn?'Meadow Landing':'Waterfall Fork'
  })});
  const injectedClock=Reflect.get(window,'cloverClock');
  if(typeof injectedClock==='function') injectedClock(frame);
  else app.ticker.add(ticker=>frame(Math.min(ticker.deltaMS/1000,.09)));
  $('loading').hidden=true;
});
Effect.runPromise(boot).catch(error=>{$('loading').textContent='Clover Cay could not start. '+String(error.message||error).slice(0,150);console.error(error)});
