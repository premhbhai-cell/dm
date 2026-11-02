// DM Studio local server + admin API. Run: node server.js
const http=require('http'),fs=require('fs'),p=require('path'),crypto=require('crypto'),{exec}=require('child_process');
const ROOT=__dirname,CATS=['hero','newborn','kids','maternity','family','cake-smash','outdoor','gallery'],IMG=/\.(jpe?g|png|webp|gif|avif)$/i;
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon'};
const CREDS={email:'dmstudio7877@gmail.com',password:'dmstudio@3377'};
const DATA=p.join(ROOT,'site-data.json'),SESSIONS=new Set();
const authorized=req=>SESSIONS.has(String(req.headers.authorization||'').replace(/^Bearer\s+/i,''));
const send=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(obj))};
const read=(req)=>new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>18*1024*1024)reject(Error('File too large'))});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'))}catch(e){reject(e)}});req.on('error',reject)});
const safe=(s)=>String(s||'').replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,100);
const srv=http.createServer(async(req,res)=>{
 let u;try{u=decodeURIComponent(req.url.split('?')[0])}catch(e){res.writeHead(400);return res.end()}
 try{
  if(u==='/api/login'&&req.method==='POST'){const b=await read(req);if(b.email!==CREDS.email||b.password!==CREDS.password)return send(res,200,{ok:false});const token=crypto.randomBytes(32).toString('hex');SESSIONS.add(token);return send(res,200,{ok:true,token})}
  if(u==='/api/site-data'&&req.method==='GET'){let d={};try{d=JSON.parse(fs.readFileSync(DATA,'utf8'))}catch(e){}return send(res,200,d)}
  if(u==='/api/site-data'&&req.method==='POST'){if(!authorized(req))return send(res,401,{error:'Unauthorized'});const b=await read(req);fs.writeFileSync(DATA,JSON.stringify(b,null,2));return send(res,200,{ok:true})}
  if(u==='/api/upload'&&req.method==='POST'){if(!authorized(req))return send(res,401,{error:'Unauthorized'});const b=await read(req);if(!CATS.includes(b.category)||!/^data:image\/(jpeg|png|webp|gif|avif);base64,/.test(b.data||''))return send(res,400,{error:'Invalid image'});const ext=({jpeg:'jpg',png:'png',webp:'webp',gif:'gif',avif:'avif'})[(b.data.match(/^data:image\/([^;]+)/)||[])[1]]||'jpg';const dir=p.join(ROOT,'images',b.category);fs.mkdirSync(dir,{recursive:true});const name=Date.now()+'-'+safe(b.name||'photo')+'.'+ext;fs.writeFileSync(p.join(dir,name),Buffer.from(b.data.split(',')[1],'base64'));return send(res,200,{ok:true,file:name,url:'images/'+b.category+'/'+name})}
  const del=u.match(/^\/api\/image\/([a-z-]+)\/([^/]+)$/);if(del&&req.method==='DELETE'){if(!authorized(req))return send(res,401,{error:'Unauthorized'});if(!CATS.includes(del[1]))return send(res,400,{error:'Invalid category'});const f=p.join(ROOT,'images',del[1],safe(del[2]));if(!f.startsWith(p.join(ROOT,'images',del[1])))return send(res,400,{error:'Invalid path'});if(fs.existsSync(f))fs.unlinkSync(f);return send(res,200,{ok:true})}
  const m=u.match(/^\/__list\/([a-z-]+)$/);if(m){const d=p.join(ROOT,'images',m[1]);let a=[];if(CATS.includes(m[1])&&fs.existsSync(d))a=fs.readdirSync(d).filter(f=>IMG.test(f)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));return send(res,200,a)}
  if(['/server.js','/site-data.json','/README.md','/README.txt'].includes(u)){res.writeHead(404);return res.end('Not found')}if(u.endsWith('/'))u+='index.html';const f=p.normalize(p.join(ROOT,u));if(!f.startsWith(ROOT)){res.writeHead(403);return res.end()}
  fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':MIME[p.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});res.end(b)});
 }catch(e){send(res,500,{error:e.message})}
});
let port=+process.env.PORT||3000;srv.on('error',e=>{if(e.code==='EADDRINUSE'&&port<3030){port++;srv.listen(port)}else console.log(e.message)});
srv.on('listening',()=>{const url='http://localhost:'+port+'/index.html';console.log('DM Studio: '+url+' | Admin: http://localhost:'+port+'/admin.html');if(!process.argv.includes('--no-open'))exec((process.platform==='win32'?'start ""':process.platform==='darwin'?'open':'xdg-open')+' '+url)});srv.listen(port);
