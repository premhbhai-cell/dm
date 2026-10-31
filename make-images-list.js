// Chalao:  node make-images-list.js          -> ek baar list bana deta hai
//          node make-images-list.js --watch  -> chalta rahta hai, folder me photo add/hatate hi list apne aap update
// (Windows: update-images.bat par double-click bhi kar sakte ho)
const fs=require('fs'),p=require('path');
const CATS=['hero','newborn','kids','maternity','outdoor','gallery'];
function build(){const out={};
 for(const c of CATS){const d=p.join(__dirname,'images',c);
  out[c]=fs.existsSync(d)?fs.readdirSync(d).filter(f=>/\.(jpe?g|png|webp|gif|avif)$/i.test(f)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})):[]}
 const s='window.FILES='+JSON.stringify(out,null,1)+';';
 const f=p.join(__dirname,'images.js');
 if(!fs.existsSync(f)||fs.readFileSync(f,'utf8')!==s){fs.writeFileSync(f,s);
  console.log(new Date().toLocaleTimeString(),'images.js update:',Object.entries(out).map(([k,v])=>k+'='+v.length).join(', '))}}
build();
if(process.argv.includes('--watch')){
 console.log('Watching images folder... (band karne ke liye Ctrl+C)');let t;
 fs.watch(p.join(__dirname,'images'),{recursive:true},()=>{clearTimeout(t);t=setTimeout(build,300)})}
