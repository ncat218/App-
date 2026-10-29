// API-only governance checks with a dedicated local fixture; no file upload/download.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8787';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Local test server required.');
const headers={'oai-authenticated-user-id':'gsync-governance-test','content-type':'application/json'};
const checks=[];
let s=await(await fetch(base+'/api/demo',{headers})).json();
async function call(action,payload={},role='ops',expected=200,extra={}){
    const response=await fetch(base+'/api/demo',{method:'POST',headers:{...headers,...extra.headers},body:JSON.stringify({revision:extra.revision??s.revision,role,action,payload})});
    const data=await response.json();assert.equal(response.status,expected,JSON.stringify(data));
    checks.push({action,role,expectedStatus:expected,actualStatus:response.status,result:'PASS',error:expected!==200?data.error:undefined});
    if(response.ok)s=data;return data;
}
const c=(p={})=>({caseId:'EX-0041',...p});
await call('reset');await call('run');assert.equal(s.balances[0].firm,-120);
await call('proposal',c({proposal:{option:'B',qty:0,demand:170,readyAt:'2026-10-26T06:00',source:'KH-TEST-B',note:'GIẢ LẬP',stages:[{id:'DOT-1',qty:80,at:'2026-10-24T07:00',sources:['OPENING']},{id:'DOT-2',qty:90,at:'2026-10-26T06:00',sources:['SHIP-90']}],carry:{qty:50,planId:'KH-NEXT',owner:'Phân xưởng test',approval:'PD-NEXT'}}}));
await call('confirm_proposal',c(),'director',400);
await call('confirm_proposal',c(),'workshop');await call('confirm_proposal',c(),'supply');
await call('narrative',c());for(const claim of s.cases[0].claims)await call('review_claim',c({claimId:claim.id,status:'accepted'}));
for(const kind of ['inventory','quality','plan'])await call('evidence',c({kind,reference:'TEST-'+kind}));
await call('submit',c());await call('run',{},'ops',409,{revision:s.revision-1});
await call('forward',c(),'director');await call('approve',c(),'ceo');
await call('stage_execution',c({stage:{id:'DOT-2',qty:90,at:'2026-10-26T06:00',reference:'TH-DOT2'}}));
await call('evidence',c({kind:'execution',reference:'TH-DOT2',executionId:'DOT-2'}),'workshop');
const blocked=await call('confirm_stage',c({stageId:'DOT-2'}),'workshop',400);assert.match(blocked.error,/chưa thực sự sẵn sàng/);
await call('close',c(),'director',400);
const inputs=structuredClone(s.inputs);inputs.stocks.find(x=>x.id==='UREA').qty++;
await call('save_inputs',{inputs,reason:'API test: chỉ thay urê'});assert.equal(s.cases[0].status,'executing');assert.equal(s.cases[0].approvedVersion,1);
await call('run',{},'invalid-role',400);await call('run',{},'ops',403,{headers:{origin:'http://different.invalid'}});
const result={at:new Date().toISOString(),scope:'API governance, dedicated synthetic owner; no browser/file download',base,checks,summary:{pass:checks.length,fail:0}};
fs.writeFileSync('docs/acceptance/api-final.json',JSON.stringify(result,null,2));
console.log(`API governance PASS: ${checks.length} checks; role, staged B, source hold, scoped invalidation, conflict, origin.`);
