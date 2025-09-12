#!/usr/bin/env node
const fs=require('fs'),path=require('path');
let routers=0,bad=[];

function walk(d){
  for(const f of fs.readdirSync(d)){
    const p=path.join(d,f),s=fs.statSync(p);
    if(s.isDirectory()) {
      walk(p); 
    } else if(/\.(ts|tsx|jsx)$/.test(f)){
      const t=fs.readFileSync(p,'utf8');
      if(/<BrowserRouter|createBrowserRouter/.test(t)) routers++;
      (t.match(/from ['"]@\/([^'"]+)['"]/g)||[]).forEach(m=>{
        const rel=m.match(/@\/([^'"]+)/)[1];
        const fp=path.join(process.cwd(),'src',rel);
        const ok=[fp,fp+'.ts',fp+'.tsx',path.join(fp,'index.tsx')].some(fs.existsSync);
        if(!ok) bad.push(`${p} -> @/${rel}`);
      });
    }
  }
}

if(fs.existsSync('src')) walk('src');
if(routers>1){
  console.error(`Found ${routers} routers. Only one allowed.`);
  process.exit(1);
}
if(bad.length){
  console.error('Bad/missing imports (check casing/paths):\n'+bad.map(x=>' - '+x).join('\n'));
  process.exit(1);
}
console.log('OK: Router/import checks passed.');