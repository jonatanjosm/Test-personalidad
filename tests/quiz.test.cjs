const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { createServer } = require('node:http');
const { readFileSync } = require('node:fs');
const path = require('node:path');
let browser, server, base;
before(async () => {
  server = createServer((req, res) => { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(readFileSync(path.join(__dirname, '../index.html'))); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ channel: 'chrome', headless: true });
});
after(async () => { await browser?.close(); server?.close(); });
async function pageFor(t, saved, key='temperamentos_grupal_v2') {
  const context = await browser.newContext();
  t.after(() => context.close());
  if (saved) await context.addInitScript(({key,saved}) => localStorage.setItem(key, JSON.stringify(saved)), {key,saved});
  const page = await context.newPage(); page.setDefaultTimeout(2000); await page.goto(base); return page;
}
async function register(page, count=6) {
  await page.locator('#begin').click();
  while (await page.locator('#namefields input').count() < count) await page.locator('#addperson').click();
  while (await page.locator('#namefields input').count() > count) await page.locator('[data-remove]').last().click();
  for (let i=0;i<count;i++) await page.locator(`#nm${i}`).fill(`Persona ${i+1}`);
  await page.locator('#start').click();
}
async function answer(page, i, value=3) { await page.locator(`input[name="person${i}"][value="${value}"]`).check(); }
test('agrega más de seis personas y permite quitar hasta una, conservando los nombres', async t => {
  const page=await pageFor(t); await page.locator('#begin').click();
  assert.equal(await page.locator('#namefields input').count(),1);
  await page.locator('#nm0').fill('Ana');
  for(let i=0;i<6;i++) await page.locator('#addperson').click({timeout:2000});
  assert.equal(await page.locator('#namefields input').count(),7);
  await page.locator('[data-remove="1"]').click(); assert.equal(await page.locator('#nm0').inputValue(),'Ana');
  while(await page.locator('#namefields input').count()>1) await page.locator('[data-remove]').last().click();
  assert.equal(await page.locator('[data-remove]').isDisabled(),true);
});
test('exige nombres completos y distintos para cualquier tamaño de grupo', async t => {
  const page=await pageFor(t); await page.locator('#begin').click(); await page.locator('#start').click();
  assert.match(await page.locator('#nameerror').innerText(),/nombre/i);
  await page.locator('#addperson').click();
  for(let i=0;i<2;i++) await page.locator(`#nm${i}`).fill(' Ana ');
  await page.locator('#start').click(); assert.match(await page.locator('#nameerror').innerText(),/distint/i);
});
test('todos responden una pregunta, no se avanza con pendientes y se conservan respuestas al volver y recargar',async t=>{
  const page=await pageFor(t); await register(page,7);
  assert.match(await page.locator('#quiztitle').innerText(),/Pregunta 1 de 48/);
  assert.equal(await page.locator('#questions [role="radiogroup"]').count(),7);
  await answer(page,0,5); await page.locator('#next').click();
  assert.match(await page.locator('#quizerror').innerText(),/Persona 2/);
  for(let i=1;i<7;i++) await answer(page,i,2);
  await page.locator('#next').click(); assert.match(await page.locator('#quiztitle').innerText(),/Pregunta 2 de 48/);
  await answer(page,0,4); await page.locator('#prev').click();
  assert.equal(await page.locator('input[name="person0"][value="5"]').isChecked(),true);
  await page.reload(); await page.getByRole('button',{name:'Continuar donde quedamos'}).click();
  assert.match(await page.locator('#quiztitle').innerText(),/Pregunta 1 de 48/);
  assert.equal(await page.locator('input[name="person0"][value="5"]').isChecked(),true);
});
test('completa 48 rondas con resultados y exportación de todas las personas',async t=>{
  const page=await pageFor(t); await register(page,2);
  const descriptions=new Set(), examples=new Set();
  for(let q=0;q<48;q++){
    const description=page.locator('#questiondescription'), example=page.locator('#questionexample');
    assert.equal(await description.isVisible(),true,`Descripción visible en pregunta ${q+1}`);
    assert.equal(await example.isVisible(),true,`Ejemplo visible en pregunta ${q+1}`);
    const detail=await description.innerText(), scenario=await example.innerText();
    assert.ok(detail.trim().length>80,`Descripción desarrollada en pregunta ${q+1}`);
    assert.ok(scenario.trim().length>80,`Escenario desarrollado en pregunta ${q+1}`);
    descriptions.add(detail); examples.add(scenario);
    await answer(page,0,5); await answer(page,1,1); await page.locator('#next').click();
  }
  assert.equal(descriptions.size,48); assert.equal(examples.size,48);
  assert.equal(await page.locator('#resultlist .result').count(),2);
  assert.match(await page.locator('#results h2').first().innerText(),/2 personas/);
  assert.equal(await page.locator('#resultlist .result').first().locator('.barline').last().innerText().then(x=>x.includes('100%')),true);
  const downloadPromise=page.waitForEvent('download'); await page.locator('#json').click(); const download=await downloadPromise;
  const data=JSON.parse(readFileSync(await download.path(),'utf8'));
  assert.equal(data.personas.length,2); assert.equal(data.personas[1].respuestas.length,48);
  assert.ok(data.personas[1].puntuaciones.every(s=>s.pct===0));
});
test('recupera avances antiguos en la primera pregunta pendiente sin perder respuestas',async t=>{
  const saved={names:Array.from({length:6},(_,i)=>`Persona ${i+1}`),answers:Array.from({length:6},(_,i)=>Array(48).fill(i===0?5:null)),person:1,page:2};
  const page=await pageFor(t,saved,'temperamentos6_v1'); await page.getByRole('button',{name:'Continuar donde quedamos'}).click();
  assert.match(await page.locator('#quiztitle').innerText(),/Pregunta 1 de 48/);
  assert.equal(await page.locator('input[name="person0"][value="5"]').isChecked(),true);
  assert.equal(await page.locator('#questions [role="radiogroup"]').count(),6);
});
test('ignora avances dañados sin romper el registro',async t=>{
  const page=await pageFor(t,{names:['Ana'],answers:[[99]],question:-1});
  await page.locator('#begin').click(); assert.equal(await page.locator('#namefields input').count(),1);
});
test('un grupo de 25 personas cabe en móvil y muestra los nombres como texto',async t=>{
  const names=Array.from({length:25},(_,i)=>i===0?'<img src=x onerror="window.injected=true">':`Participante ${i} ${'Apellido '.repeat(5)}`);
  const page=await pageFor(t,{names,answers:names.map(()=>Array(48).fill(null)),question:0,stage:'quiz'});
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Continuar donde quedamos'}).click();
  assert.equal(await page.locator('#questions [role="radiogroup"]').count(),25);
  assert.equal(await page.locator('#personlabel0').innerText(),names[0]);
  assert.equal(await page.locator('#questions img').count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('input[name="person24"][value="4"]').check();
  assert.match(await page.locator('#globalprogress').innerText(),/1 de 25/);
});
test('si el almacenamiento falla permite responder y explica que el avance no se guardó',async t=>{
  const page=await pageFor(t);
  await page.evaluate(()=>Storage.prototype.setItem=function(){throw new Error('blocked')});
  await page.locator('#begin').click(); await page.locator('#nm0').fill('Ana');
  assert.equal(await page.locator('#savestatus').isVisible(),true);
  while(await page.locator('#namefields input').count()>1) await page.locator('[data-remove]').last().click();
  await page.locator('#start').click(); await answer(page,0,4); await page.locator('#save').click();
  assert.match(await page.locator('#savestatus').innerText(),/No se pudo guardar/);
  await page.locator('#next').click(); assert.match(await page.locator('#quiztitle').innerText(),/Pregunta 2/);
});
test('recupera resultados de ocho personas, exporta CSV y borra ambos formatos al reiniciar',async t=>{
  const names=Array.from({length:8},(_,i)=>`Persona ${i+1}`);
  const page=await pageFor(t,{names,answers:names.map(()=>Array(48).fill(4)),question:47,stage:'results'});
  await page.getByRole('button',{name:'Volver a los resultados'}).click();
  assert.equal(await page.locator('#resultlist .result').count(),8);
  const downloadPromise=page.waitForEvent('download'); await page.locator('#csv').click(); const download=await downloadPromise;
  const csv=readFileSync(await download.path(),'utf8'); assert.equal(csv.split('\r\n').length,9);
  assert.match(csv, /"Persona 8","75","75","75","75"/);
  // Install the stale key after page startup to ensure reset removes it as well.
  await page.evaluate(()=>localStorage.setItem('temperamentos6_v1','{}'));
  page.once('dialog',dialog=>dialog.accept()); await page.locator('#reset').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('temperamentos_grupal_v2')),null);
  assert.equal(await page.evaluate(()=>localStorage.getItem('temperamentos6_v1')),null);
  assert.equal(await page.locator('#intro').isVisible(),true);
});
test('registro y pregunta se adaptan a escritorio y móvil',async t=>{
  const page=await pageFor(t); await register(page,6);
  for(const size of [{width:1280,height:1000},{width:390,height:844}]){
    await page.setViewportSize(size);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    if(process.env.CAPTURE_SCREENSHOTS){
      const fs=require('node:fs'); fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});
      await page.screenshot({path:path.join(__dirname,`../test-results/quiz-${size.width}.png`),fullPage:false});
    }
  }
});
