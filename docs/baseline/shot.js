const puppeteer=require('/Users/paulbridges/Desktop/drinkss/pley-clone/node_modules/puppeteer');
(async()=>{
const b=await puppeteer.launch({args:['--no-sandbox']});
const out='/private/tmp/claude-501/-Users-paulbridges-Desktop-drinkss/413508c6-5018-4660-b389-25dfa165b3b4/scratchpad/';
for(const [name,w,h] of [['desk',1440,900],['mob',390,844]]){
  const p=await b.newPage();
  await p.setViewport({width:w,height:h,deviceScaleFactor:1});
  await p.goto('http://localhost:8777/index.html',{waitUntil:'networkidle2',timeout:60000});
  await new Promise(r=>setTimeout(r,6000));
  const H=await p.evaluate(()=>document.body.scrollHeight);
  console.log(name,'height',H);
  for(let i=0;i<8;i++){
    await p.evaluate(y=>window.scrollTo(0,y),i*h*1.2);
    await new Promise(r=>setTimeout(r,1800));
    await p.screenshot({path:`${out}${name}-${i}.png`});
  }
  await p.close();
}
await b.close();
})();
