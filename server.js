// Chhota local server (koi install nahi chahiye). Chalao:  node server.js   (ya start.bat par double-click)
// Folder (images/newborn, kids, maternity, outdoor, gallery) me photo daalo -> page refresh karo -> apne aap dikhegi.
const http=require('http'),fs=require('fs'),p=require('path'),{exec}=require('child_process');
const ROOT=__dirname,CATS=['hero','newborn','kids','maternity','outdoor','gallery'],IMG=/\.(jpe?g|png|webp|gif|avif)$/i;
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain'};
const nat=(a,b)=>a.localeCompare(b,undefined,{numeric:true});
const srv=http.createServer((req,res)=>{
 let u;try{u=decodeURIComponent(req.url.split('?')[0])}catch(e){res.writeHead(400);return res.end()}
 const m=u.match(/^\/__list\/(\w+)$/);
 if(m){const d=p.join(ROOT,'images',m[1]);let a=[];
  if(CATS.includes(m[1])&&fs.existsSync(d))a=fs.readdirSync(d).filter(f=>IMG.test(f)).sort(nat);
  res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify(a))}
 if(u.endsWith('/'))u+='index.html';
 const f=p.normalize(p.join(ROOT,u));
 if(!f.startsWith(ROOT)){res.writeHead(403);return res.end()}
 fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end('Not found')}
  res.writeHead(200,{'Content-Type':MIME[p.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});res.end(b)})});
let port=+process.env.PORT||3000;
srv.on('error',e=>{if(e.code=='EADDRINUSE'&&port<3030){port++;srv.listen(port)}else console.log(e.message)});
srv.on('listening',()=>{const url='http://localhost:'+port+'/index.html';console.log('Site chal rahi hai: '+url+'\n(band karne ke liye Ctrl+C)');
 if(!process.argv.includes('--no-open'))exec((process.platform=='win32'?'start ""':process.platform=='darwin'?'open':'xdg-open')+' '+url)});
srv.listen(port);
