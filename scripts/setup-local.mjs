import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const major=Number(process.versions.node.split('.')[0]);
if(major<22){console.error('Cần Node.js 22.13 trở lên; khuyến nghị Node.js 24 LTS.');process.exit(1);}
function run(args){const r=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);}
console.log('1/2 · Build app và cấu hình database local…');run(['scripts/run-framework.mjs','build']);
console.log('2/2 · Áp dụng migration local (giữ nguyên dữ liệu đang có)…');
const built=JSON.parse(readFileSync('dist/server/wrangler.json','utf8'));
mkdirSync('.sites-runtime',{recursive:true});
writeFileSync('.sites-runtime/migrate.json',JSON.stringify({name:'gsync-local-migrations',compatibility_date:'2026-05-15',d1_databases:built.d1_databases.map(d=>({...d,migrations_dir:resolve('drizzle')}))},null,2));
run(['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','migrations','apply','DB','--local','--config','.sites-runtime/migrate.json','--persist-to','.wrangler/state']);
console.log('\nĐã sẵn sàng. Chạy npm run dev rồi mở http://localhost:5173\nHoặc npm start để chạy bản build.');
