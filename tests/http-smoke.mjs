// Chạy khi app local đã mở: npm run test:api
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8787';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Chỉ chạy smoke test với app local.');
const headers={'oai-authenticated-user-id':'gsync-http-test'};
async function request(path,init={}){const r=await fetch(base+path,{...init,headers:{...headers,...init.headers}});const text=await r.text();let data;try{data=JSON.parse(text);}catch{data=text;}return {r,data};}
let {data:s,r}=await request('/api/demo');assert.equal(r.status,200);
async function action(action,payload={},role='ops'){const out=await request('/api/demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({revision:s.revision,role,action,payload})});assert.equal(out.r.status,200,JSON.stringify(out.data));s=out.data;}
await action('reset');await action('run');assert.equal(s.balances[0].firm,-120);assert.equal(s.cases[0].id,'EX-0041');
const stale=await request('/api/demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({revision:s.revision-1,role:'ops',action:'run',payload:{}})});assert.equal(stale.r.status,409);
const denied=await request('/api/demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({revision:s.revision,role:'ceo',action:'approve',payload:{caseId:'EX-0041'}})});assert.equal(denied.r.status,400);
const form=new FormData();form.append('file',new File(['Chung tu gia lap G-Sync'],'evidence-demo.txt',{type:'text/plain'}));
const uploaded=await request('/api/files',{method:'POST',body:form});assert.equal(uploaded.r.status,200);assert.ok(uploaded.data.key.startsWith('gsync-http-test/'));
await action('evidence',{caseId:'EX-0041',kind:'inventory',reference:'HTTP-DEMO',...uploaded.data});
const file=await request('/api/files?key='+encodeURIComponent(uploaded.data.key));assert.equal(file.r.status,200);assert.equal(file.data,'Chung tu gia lap G-Sync');
const report=await request('/api/report?caseId=EX-0041');assert.equal(report.r.status,200);assert.ok(report.data.includes('HTTP-DEMO'));assert.ok(report.data.includes('-120'));
const persisted=await request('/api/demo');assert.equal(persisted.data.revision,s.revision);assert.equal(persisted.data.cases[0].evidence[0].filename,'evidence-demo.txt');
console.log('HTTP smoke PASS: API, database persistence, stale revision, invalid approval, file upload/download, full report.');
