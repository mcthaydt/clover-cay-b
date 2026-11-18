// Platforms use [x, z, top, width, depth, thickness]. The summit is east.
export const islands = [
  [-5, 1, 0, 4.4, 3.8, 2.3],
  [0, 1, 0, 4.5, 3.8, 2.7],
  [5, 1, 0, 4.6, 3.8, 3],
  [0, -3.4, .2, 3.6, 2.8, 2.2],
  [4.5, -3.4, .45, 3.4, 2.5, 2.6],
  [-4.5, -3.2, .3, 3.2, 2.7, 2.3],
];
export const bridge = [-2.55, 1, 0, 1.5, 1.3];
export const stones = [[2.5, 1, 0, .95, 1.4], [0,-1.45,.08,.95,.55],
  [2.3,-3.4,.33,.65,.85], [4.6,-1.55,.2,1,.65], [-4.55,-1.4,.12,.8,.55]];
export const stars = [[-.1,.92,-3.4],[4.5,1.15,-3.4],[-4.5,1,-3.2]];
export const coins = [[-5,.6,1],[-4,.6,1],[-3,.6,1],[-2,.6,1],[-1,.6,1],
  [0,.6,.25],[0,.75,-1.45],[2.3,.93,-3.4],[4.6,.8,-1.55],[3.6,.6,1],[4.6,.6,1]];
/** @type {[number, number, number]} */
export const spawn = [-5.65,.65,1];
export const goal = [5.8,0,1];
const ground = [...islands,bridge,...stones];
export function groundAt(x,z) {
  let top = -20;
  for (const [a,b,y,w,d] of ground) {
    if (Math.abs(x-a)<=w/2 && Math.abs(z-b)<=d/2) top = Math.max(top,y);
  }
  return top;
}
export function locationAt(x,z) {
  if(z < -1.8) return x < -2.5 ? 'Blossom Isle' : x > 2.6 ? 'Sky Lookout' : 'Clover Grove';
  return x < -2.3 ? 'Meadow Landing' : x < 2.7 ? 'Waterfall Fork' : 'Summit Ridge';
}
