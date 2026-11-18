import {expect,test} from '@playwright/test';

test('the opening field and its controls fit the device',async({page},info)=>{
  await page.addInitScript(()=>{
    globalThis.cloverClock=frame=>{for(let i=0;i<120;i++)frame(1/60)};
  });
  await page.goto('/');
  await expect(page.locator('#loading')).toBeHidden();
  const field=await page.locator('#scene').boundingBox();
  const hud=await page.locator('.hud').boundingBox();
  expect(hud.y).toBeGreaterThanOrEqual(field.y);
  expect(hud.x+hud.width).toBeLessThanOrEqual(field.x+field.width);
  if(info.project.name==='desktop'){
    expect(field.width/field.height).toBeGreaterThan(2);
  }else{
    const left=await page.getByRole('button',{name:'Move right'}).boundingBox();
    const jump=await page.getByRole('button',{name:'Jump',exact:true}).boundingBox();
    const run=await page.locator('[data-key="ShiftLeft"]').boundingBox();
    for(const button of [left,jump,run]){
      expect(button.width).toBeGreaterThanOrEqual(44);
      expect(button.height).toBeGreaterThanOrEqual(44);
      expect(button.y+button.height).toBeLessThan(field.y+field.height);
    }
    expect(left.x+left.width).toBeLessThan(run.x);
    if(info.project.name==='phone')expect(field.height).toBeGreaterThan(field.width);
  }
});
