import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seed, calculate, transition, proposalBalance, defaultB, checkRoles, actualSignature, closureIssues, upgrade, type State, type Role, type Inputs, type CheckKind } from '../lib/engine.ts';
import { importCsv, exportCsv } from '../lib/imports.ts';
import { renderReport } from '../lib/report.ts';
import { generateNarrative, lockedContext } from '../lib/narrative.ts';
const run = () => transition(seed(), 'ops', 'run', {});
function apply(s: State, a: string, p: any = {}, r: Role = 'ops') { return transition(s, r, a, { caseId: 'EX-0041', ...p }); }
function confirmAll(s: State) {
    for (const st of s.inputs.stocks)
        for (const k of Object.keys(checkRoles) as CheckKind[])
            s = apply(s, 'confirm_input', { material: st.id, kind: k, reference: 'TEST · đúng dữ liệu mới' }, checkRoles[k]);
    return s;
}
function formal(i: Inputs) { const s = seed(); s.inputs = i; return confirmAll(s).inputs; }
function released(i: Inputs) {
    const sh = i.shipments[0];
    sh.status = 'released';
    sh.actual = { eta: sh.readyAt, unloaded: sh.readyAt, received: sh.readyAt, quality: sh.readyAt };
    sh.actualReference = 'PN-TEST';
    sh.actualChecks = {};
    for (const r of ['ops', 'qa', 'supply'] as const)
        sh.actualChecks[r] = { by: r, at: '2026-10-24T00:00Z', reference: 'TEST', signature: actualSignature(sh) };
    return formal(i);
}
function ready(option: 'A' | 'B' = 'A') {
    let s = run();
    const c = s.cases[0];
    s = apply(s, 'proposal', { proposal: option === 'B' ? defaultB(c) : { option: 'A', qty: 140, demand: 220, readyAt: '2026-10-24T06:00', source: 'A-TEST', note: 'GIẢ LẬP' } });
    s = apply(s, 'narrative');
    for (const x of s.cases[0].claims)
        s = apply(s, 'review_claim', { claimId: x.id, status: 'accepted' });
    for (const kind of ['inventory', 'quality', 'plan'])
        s = apply(s, 'evidence', { kind, reference: 'TEST-' + kind });
    if (option === 'B')
        s = apply(s, 'confirm_proposal', {}, 'workshop');
    return apply(s, 'confirm_proposal', {}, 'supply');
}
function approved(option: 'A' | 'B' = 'A') { let s = apply(ready(option), 'submit'); s = apply(s, 'forward', {}, 'director'); return apply(s, 'approve', {}, 'ceo'); }
function receipt(s: State, id = 'PN-1', qty = 140) {
    s = apply(s, 'execution', { execution: { qty, at: '2026-10-24T06:00', receiptId: id } });
    for (const kind of ['order', 'receipt', 'release'])
        s = apply(s, 'evidence', { kind, reference: 'TEST-' + kind, executionId: id }, kind === 'release' ? 'qa' : 'ops');
    for (const r of ['ops', 'accounting', 'qa'] as Role[])
        s = apply(s, r === 'qa' ? 'release' : 'confirm_receipt', {}, r);
    return s;
}
function sourceActual(s: State) {
    const sh = s.cases[0].snapshot.shipments[0];
    s = apply(s, 'source_actual', { source: { id: sh.id, qty: 90, reference: 'PN-SHIP-90', milestones: sh.forecast } }, 'ops');
    for (const r of ['ops', 'qa', 'supply'] as Role[])
        s = apply(s, 'confirm_source', { shipmentId: sh.id }, r);
    return s;
}
function stageDone(s: State, id: string) { const st = s.cases[0].proposal!.stages!.find(x => x.id === id)!; s = apply(s, 'stage_execution', { stage: { id, qty: st.qty, at: st.at, reference: 'TH-' + id } }); s = apply(s, 'evidence', { kind: 'execution', reference: 'TH-' + id, executionId: id }, 'workshop'); return apply(s, 'confirm_stage', { stageId: id }, 'workshop'); }
function bDone() { let s = approved('B'); s = sourceActual(s); s = stageDone(s, 'DOT-1'); s = stageDone(s, 'DOT-2'); const p = s.cases[0].proposal!; s = apply(s, 'evidence', { kind: 'revised_plan', reference: p.source, executionId: p.source }, 'workshop'); return s; }
test('01 EX-0041: U=100, số dư -120, cần 140 để giữ dự trữ', () => { const b = run().balances[0]; assert.equal(b.available, 100); assert.equal(b.firm, -120); assert.equal(b.reserve - b.firm, 140); });
test('02 urê bình thường', () => assert.equal(run().balances.find(x => x.material === 'UREA')!.level, 0));
test('03 DAP dưới dự trữ cấp 1', () => assert.equal(run().balances.find(x => x.material === 'DAP')!.level, 1));
test('04 biên bằng dự trữ và bằng 0', () => { let i = seed().inputs; i.needs[0].qty = 80; assert.equal(calculate(formal(i)).rows[0].level, 0); i.needs[0].qty = 100; assert.equal(calculate(formal(i)).rows[0].level, 1); });
test('05 hàng trễ không cộng', () => assert.equal(run().balances[0].incoming, 0));
test('06 lịch kịp: kế hoạch -30; chắc chắn -120', () => { const i = seed().inputs; i.shipments[0].readyAt = '2026-10-24T06:00'; i.shipments[0].forecast = { eta: '2026-10-24T06:00', unloaded: '2026-10-24T06:00', received: '2026-10-24T06:00', quality: '2026-10-24T06:00' }; const b = calculate(formal(i)).rows[0]; assert.equal(b.planned, -30); assert.equal(b.firm, -120); });
test('07 nguồn thực tế đủ bốn mốc và ba vai trò được tính chắc chắn', () => { const i = seed().inputs; i.shipments[0].readyAt = '2026-10-24T06:00'; assert.equal(calculate(released(i)).rows[0].firm, -30); });
test('08 lịch chưa rõ giữ 90 tấn; không cộng', () => { const i = seed().inputs; i.shipments[0].status = 'unknown'; i.shipments[0].readyAt = ''; assert.equal(calculate(formal(i)).rows[0].planned, -120); assert.equal(i.shipments[0].qty, 90); });
test('09 hai ca không dùng lại tồn: 100-70-60=-30', () => { const i = seed().inputs; i.shipments = []; i.needs = [{ id: 'N1', material: 'KALI', qty: 70, at: '2026-10-23T07:00', source: 'KH1' }, { id: 'N2', material: 'KALI', qty: 60, at: '2026-10-24T07:00', source: 'KH1' }]; assert.deepEqual(calculate(formal(i)).rows.map(x => x.firm), [30, -30]); });
test('10 chuyến trùng mã bị chặn', () => { const i = seed().inputs; i.shipments.push({ ...i.shipments[0] }); assert.ok(calculate(i).errors.some(x => x.includes('trùng'))); });
test('11 số âm, sai đơn vị, loại trừ vượt tồn bị chặn', () => {
    for (const change of [(i: any) => i.stocks[0].qty = -1, (i: any) => i.stocks[0].unit = 'kg', (i: any) => i.stocks[0].held = 999]) {
        const i = seed().inputs;
        change(i);
        assert.ok(calculate(i).errors.length);
    }
});
test('12 DATA_HOLD không phát kết quả định lượng', () => { let s = run(); const i = structuredClone(s.inputs); i.stocks[0].confirmed = false; s = apply(s, 'save_inputs', { inputs: i, reason: 'Kiểm thử thiếu xác nhận' }); s = apply(s, 'run'); assert.equal(s.balances.length, 0); assert.equal(s.cases.length, 2); assert.ok(s.errors.length); });
test('13 chạy lại không tạo trùng', () => assert.equal(apply(run(), 'run').cases.length, 2));
test('14 A thiếu lượng/trễ không được lưu', () => {
    for (const x of [{ qty: 120, readyAt: '2026-10-24T06:00' }, { qty: 140, readyAt: '2026-10-25T06:00' }])
        assert.throws(() => apply(run(), 'proposal', { proposal: { option: 'A', demand: 220, source: 'X', ...x } }));
});
test('15 B hai đợt: 80+90+50=220; từng mốc còn 20', () => { const c = run().cases[0], p = defaultB(c), b = proposalBalance(c, p); assert.equal(p.stages!.length, 2); assert.equal(p.carry!.qty, 50); assert.deepEqual(b.rows.map(x => x.remaining), [20, 20]); assert.equal(b.valid, true); assert.equal(b.conditional, true); });
test('16 thiếu nhận định/bằng chứng không trình', () => { assert.throws(() => apply(run(), 'submit')); const s = ready(); s.cases[0].claims[0].status = 'pending'; assert.throws(() => apply(s, 'submit')); });
test('17 đúng tuyến và vai trò', () => { let s = apply(ready(), 'submit'); assert.throws(() => apply(s, 'approve', {}, 'ceo')); assert.throws(() => apply(s, 'forward', {}, 'ops')); s = apply(s, 'forward', {}, 'director'); assert.equal(apply(s, 'approve', {}, 'ceo').cases[0].status, 'executing'); });
test('18 thay số liên quan vô hiệu phiên bản đang trình', () => { let s = apply(ready(), 'submit'); s = apply(s, 'save_inputs', { inputs: { ...s.inputs, planVersion: 'v2' }, reason: 'Kế hoạch thay đổi' }); assert.equal(s.cases[0].status, 'needs_review'); assert.equal(s.cases[0].version, 2); assert.throws(() => apply(s, 'forward', {}, 'director')); });
test('19 A đủ chứng từ và ba xác nhận mới đóng', () => { let s = approved(); assert.throws(() => apply(s, 'close', {}, 'director')); s = receipt(s); assert.deepEqual(closureIssues(s.cases[0]), []); s = apply(s, 'close', {}, 'director'); assert.equal(s.cases[0].closeKind, 'execution'); assert.equal(apply(s, 'run').cases.length, 2); });
test('20 B hai đợt: thiếu chuyển kỳ không đóng, đủ mới đóng; CSV roundtrip', () => { let s = bDone(); assert.throws(() => apply(s, 'close', {}, 'director'), /chuyển kỳ/); const p = s.cases[0].proposal!; s = apply(s, 'evidence', { kind: 'carry_plan', reference: p.carry!.approval, executionId: p.carry!.planId }, 'workshop'); s = apply(s, 'confirm_carry', {}, 'director'); assert.equal(apply(s, 'close', {}, 'director').cases[0].status, 'closed'); const i = seed().inputs; assert.deepEqual(importCsv(exportCsv(i)), i); });
test('21 sửa hồ sơ trả lại tạo phiên bản giữ lịch sử', () => { let s = apply(ready(), 'submit'); s = apply(s, 'return', { note: 'Bổ sung' }, 'director'); s = apply(s, 'evidence', { kind: 'supply', reference: 'KH-TM-NEW' }, 'supply'); assert.equal(s.cases[0].version, 2); assert.equal(s.cases[0].history![0].version, 1); assert.equal(s.cases[0].status, 'draft'); });
test('22 đổi lượng/ngày nhận phải xác nhận lại', () => { let s = receipt(approved()); assert.equal(s.cases[0].execution.quality, true); s = apply(s, 'execution', { execution: { qty: 150, at: '2026-10-24T06:00', receiptId: 'PN-1' } }); assert.equal(s.cases[0].execution.quality, false); assert.throws(() => apply(s, 'close', {}, 'director')); });
test('23 B đợt 1 quá 80 bị chặn dù số dư cuối đủ', () => { const c = run().cases[0], p = defaultB(c); p.stages![0].qty = 81; p.stages![1].qty = 89; assert.equal(proposalBalance(c, p).valid, false); });
test('24 B không cấu trúc nhiều đợt bị chặn; không nghiệm thu B một mốc cũ', () => { const p = defaultB(run().cases[0]); delete p.stages; assert.equal(proposalBalance(run().cases[0], p).valid, false); });
test('25 B tính cả nhu cầu khác cùng tồn', () => { const c = run().cases[0]; c.snapshot.needs.push({ id: 'OTHER', material: 'KALI', qty: 1, at: '2026-10-23T07:00', source: 'KH', scope: 'OTHER' }); assert.equal(proposalBalance(c, defaultB(c)).valid, false); });
test('26 SHIP-90 planned: lập B được, đợt 2 chưa thể xác nhận', () => { let s = approved('B'); const st = s.cases[0].proposal!.stages![1]; s = apply(s, 'stage_execution', { stage: { ...st, reference: 'TH' } }); s = apply(s, 'evidence', { kind: 'execution', reference: 'TH', executionId: st.id }, 'workshop'); assert.throws(() => apply(s, 'confirm_stage', { stageId: st.id }, 'workshop'), /chưa thực sự sẵn sàng/); });
test('27 mới hoàn thành đợt 1: B vẫn chưa đóng', () => { let s = approved('B'); s = stageDone(s, 'DOT-1'); assert.throws(() => apply(s, 'close', {}, 'director'), /DOT-2/); });
test('28 kế hoạch ban đầu không thay kế hoạch điều chỉnh', () => { let s = bDone(); s.cases[0].evidence = s.cases[0].evidence.filter(x => x.kind !== 'revised_plan'); assert.ok(closureIssues(s.cases[0]).some(x => x.includes('kế hoạch điều chỉnh'))); });
test('29 kế hoạch điều chỉnh sai phiên bản không hợp lệ', () => { let s = bDone(); s.cases[0].evidence.find(x => x.kind === 'revised_plan')!.version = 0; assert.ok(closureIssues(s.cases[0]).some(x => x.includes('kế hoạch điều chỉnh'))); });
test('30 chứng từ nhận khác lần không thay chứng từ lần hiện tại', () => { const s = receipt(approved()); s.cases[0].evidence.find(x => x.kind === 'receipt')!.executionId = 'PN-KHAC'; assert.throws(() => apply(s, 'close', {}, 'director'), /chứng từ/); });
test('31 chuyến đã trong tồn đầu kỳ không cộng hai lần', () => { const i = seed().inputs; i.shipments[0].readyAt = '2026-10-24T06:00'; i.shipments[0].includedQty = 90; i.shipments[0].openingReceipt = 'PN-DA-NHAP'; i.shipments[0].openingCutoff = i.cutoff; const b = calculate(formal(i)).rows[0]; assert.equal(b.incoming, 0); assert.equal(b.planned, -120); });
test('32 thiếu căn cứ loại trùng không được tính chính thức', () => { const i = seed().inputs; delete i.stocks[0].reconciliation; assert.ok(calculate(formal(i)).errors.some(x => x.includes('loại trùng'))); });
test('33 A0 chứa lệnh đang xét bị chặn', () => { const i = seed().inputs; i.stocks[0].outsideOrders = ['LSX-0041']; assert.ok(calculate(formal(i)).errors.some(x => x.includes('hai lần'))); });
test('34 đổi urê không làm mất hiệu lực hồ sơ kali', () => { let s = approved(); const i = structuredClone(s.inputs); i.stocks[1].qty++; s = apply(s, 'save_inputs', { inputs: i, reason: 'Chỉ sửa urê' }); assert.equal(s.cases[0].status, 'executing'); assert.equal(s.cases[0].version, 1); assert.equal(s.cases[0].approvedVersion, 1); assert.equal(s.cases.find(x => x.material === 'DAP')!.version, 1); });
test('35 lưu không đổi không tạo phiên bản hoặc nhật ký thay đổi', () => { const s = approved(), next = apply(s, 'save_inputs', { inputs: s.inputs }); assert.equal(next.inputVersion, s.inputVersion); assert.equal(next.cases[0].version, 1); assert.equal(next.events.length, s.events.length); });
test('36 quyết định đã ban hành vẫn tra cứu, không dùng để thực thi mới', () => { let s = approved(); const i = structuredClone(s.inputs); i.stocks[0].qty++; s = apply(s, 'save_inputs', { inputs: i, reason: 'Kiểm kê mới' }); assert.equal(s.cases[0].decisions![0].version, 1); assert.equal(s.cases[0].approvedVersion, undefined); assert.equal(s.cases[0].changeRequests![0].priorVersion, 1); assert.throws(() => apply(s, 'execution', { execution: { qty: 140, at: '2026-10-24T06:00', receiptId: 'PN' } })); });
test('37 cùng nguyên liệu khác phạm vi mở hồ sơ riêng', () => { let s = seed(); s.inputs.needs.push({ id: 'N-NEW', material: 'KALI', qty: 10, at: '2026-11-01T07:00', source: 'KH-NEW', scope: '2026-11' }); s = confirmAll(s); s = apply(s, 'run'); assert.equal(s.cases.filter(c => c.material === 'KALI').length, 2); assert.equal(apply(s, 'run').cases.length, s.cases.length); });
test('38 vai trò Kho vận không thay Kế toán hay Phân xưởng', () => { assert.throws(() => apply(seed(), 'confirm_input', { material: 'KALI', kind: 'books', reference: 'X' }, 'ops')); const s = apply(run(), 'proposal', { proposal: defaultB(run().cases[0]) }); assert.throws(() => apply(s, 'confirm_proposal', {}, 'director')); assert.equal(apply(s, 'confirm_proposal', {}, 'workshop').cases[0].proposal!.confirmed, false); });
test('39 mã kế hoạch bất kỳ không tự có hiệu lực', () => { let s = seed(); const i = structuredClone(s.inputs); i.planVersion = 'TU-NHAP'; s = apply(s, 'save_inputs', { inputs: i, reason: 'Thử mã' }); assert.ok(calculate(s.inputs).errors.some(x => x.includes('Hiệu lực'))); });
test('40 planned thiếu lịch tự thành unknown khi lưu; giữ 90 tấn', () => { const s = seed(), i = structuredClone(s.inputs); i.shipments[0].readyAt = ''; const next = apply(s, 'save_inputs', { inputs: i, reason: 'Thiếu lịch' }); assert.equal(next.inputs.shipments[0].status, 'unknown'); assert.equal(next.inputs.shipments[0].qty, 90); assert.equal(calculate(confirmAll(next).inputs).rows[0].planned, -120); });
test('41 chỉ ETA / trạng thái released không biến thành chắc chắn', () => { const i = seed().inputs; i.shipments[0].status = 'released'; i.shipments[0].actual = { eta: '2026-10-24T06:00', unloaded: '', received: '', quality: '' }; assert.ok(calculate(formal(i)).errors.some(x => x.includes('ETA'))); });
test('42 nhận định bác bỏ không ở thân tờ trình, log có mã lỗi', () => { let s = ready(); s = apply(s, 'review_claim', { claimId: 'C2', status: 'rejected', reason: 'Sai nguồn', errorCode: 'LLM' }); const html = renderReport(s.cases[0], s), body = html.split('<h2>2.')[1].split('<h2>3.')[0]; assert.ok(!body.includes(s.cases[0].claims[1].text)); assert.ok(html.includes('Sai nguồn')); assert.equal(s.cases[0].reviewLog!.at(-1).errorCode, 'LLM'); });
test('43 sửa nhận định có trước/sau, người, phiên bản; thiếu mã lỗi chặn', () => { let s = ready(); assert.throws(() => apply(s, 'review_claim', { claimId: 'C1', status: 'edited', text: 'Mới', reason: 'X' })); const old = s.cases[0].claims[0].text; s = apply(s, 'review_claim', { claimId: 'C1', status: 'edited', text: 'Đã kiểm chứng', reason: 'Đối soát', errorCode: 'DATA' }); assert.equal(s.cases[0].reviewLog!.at(-1).before, old); assert.equal(s.cases[0].reviewLog!.at(-1).after, 'Đã kiểm chứng'); });
test('44 DATA_HOLD vẫn lập thông báo có người và hạn; không có số chính thức', () => { let s = seed(); s.inputs.stocks[0].confirmed = false; s = apply(s, 'run'); s = apply(s, 'risk_notice', { note: 'Cần kiểm kê trước ca', assignee: 'Kho vận', due: '2026-10-23T12:00' }); assert.equal(s.notices!.length, 1); assert.equal(s.balances.length, 0); assert.equal(s.cases.length, 0); assert.throws(() => apply(s, 'risk_notice', { note: 'Thiếu người' })); });
test('45 kết thúc theo xác minh: cân đối mới, bằng chứng, đúng vai trò', () => { let s = run(); const i = structuredClone(s.inputs); i.stocks[0].qty = 400; s = apply(s, 'save_inputs', { inputs: i, reason: 'Kiểm kê xác minh' }); s = confirmAll(s); assert.throws(() => apply(s, 'close_verified', { reason: 'Hết thiếu' }, 'director')); s = apply(s, 'run'); s = apply(s, 'evidence', { kind: 'verification', reference: 'BB-XACMINH' }); assert.throws(() => apply(s, 'close_verified', { reason: 'Hết thiếu' }, 'ops')); s = apply(s, 'close_verified', { reason: 'Đã xác minh đủ nguồn hiện tại' }, 'director'); assert.equal(s.cases[0].closeKind, 'verification'); assert.equal(s.cases[0].proposal, null); });
test('46 thiếu xác nhận Kế toán nhận hàng: A không đóng', () => { const s = receipt(approved()); delete s.cases[0].execution.checks!.accounting; assert.throws(() => apply(s, 'close', {}, 'director'), /Kế toán/); });
test('47 checklist tại trình không đổi khi thêm chứng từ muộn', () => { let s = apply(ready(), 'submit'); const snap = JSON.stringify(s.cases[0].submission); s = apply(s, 'evidence', { kind: 'inventory', reference: 'BO-SUNG-MUON' }); assert.equal(JSON.stringify(s.cases[0].submission), snap); assert.equal(s.cases[0].evidence.length, 4); });
test('48 nâng dữ liệu cũ giữ hồ sơ nhưng không cấp xác nhận mới', () => { const s = approved(); delete s.schemaVersion; const upgraded = upgrade(s); assert.equal(upgraded.cases[0].status, 'needs_review'); assert.equal(upgraded.cases[0].approvedVersion, undefined); assert.equal(upgraded.cases[0].history!.length, 1); });
test('49 Gemini không key: mẫu tĩnh, không gọi mạng', async () => { const c = ready().cases[0]; await generateNarrative(c, {}, (async () => { throw new Error('Must not fetch'); }) as any); assert.equal(c.narrativeMode, 'template'); assert.equal(c.ai.status, 'not-configured'); });
function fakeResult(c: any, change?: (x: any) => void) { const result = { claims: c.claims.map((x: any) => ({ id: x.id, text: x.text, sources: x.sources.length ? x.sources : [c.snapshot.planVersion] })), questions: ['Nguồn đã sẵn sàng chưa?'], evidenceGaps: [] }; change?.(result); return new Response(JSON.stringify({ modelVersion: 'mock-gemini-version', usageMetadata: { totalTokenCount: 321 }, candidates: [{ content: { parts: [{ text: JSON.stringify(result) }] } }] })); }
test('50 Gemini thành công (mock): nguồn, model/token, C1–C3 và tất cả pending', async () => { const c = ready('B').cases[0]; await generateNarrative(c, { key: 'test-only' }, (async (_url: any, init: any) => { const body = JSON.parse(init.body); assert.ok(body.contents[0].parts[0].text.includes('DOT-2')); return fakeResult(c, r => r.claims.forEach((x: any) => delete x.id)); }) as any); assert.equal(c.narrativeMode, 'gemini'); assert.equal(c.ai.model, 'mock-gemini-version'); assert.equal(c.ai.usage.totalTokenCount, 321); assert.deepEqual(c.claims.map(x => x.id), ['C1', 'C2', 'C3']); assert.ok(c.claims.every(x => x.status === 'pending')); });
test('51 Gemini lỗi API (mock) dùng mẫu dự phòng', async () => { const c = ready().cases[0]; c.claims.forEach(x => x.status = 'pending'); await generateNarrative(c, { key: 'test' }, (async () => new Response('{}', { status: 429 })) as any); assert.equal(c.narrativeMode, 'template-fallback'); assert.equal(c.ai.error, 'HTTP_429'); });
test('52 Gemini sai cấu trúc (mock) không dùng phản hồi', async () => { const c = ready().cases[0]; await generateNarrative(c, { key: 'test' }, (async () => fakeResult(c, r => r.claims = [])) as any); assert.equal(c.ai.status, 'fallback'); });
test('53 Gemini nguồn không tồn tại (mock) bị loại', async () => { const c = ready().cases[0]; await generateNarrative(c, { key: 'test' }, (async () => fakeResult(c, r => r.claims[0].sources = ['NGUON-TU-BIA'])) as any); assert.equal(c.narrativeMode, 'template-fallback'); });
test('54 Gemini thiếu trường bắt buộc (mock) bị loại', async () => { const c = ready().cases[0]; await generateNarrative(c, { key: 'test' }, (async () => fakeResult(c, r => delete r.questions)) as any); assert.equal(c.ai.status, 'fallback'); });
test('55 prompt có số khóa, nguồn, phiên bản, phương án và căn cứ', () => { const context = lockedContext(ready('B').cases[0]); assert.equal(context.proposal!.stages!.length, 2); assert.equal(context.balance.firm, -120); assert.ok(context.evidence.length); assert.ok(context.allowedSources.includes('KH-2026-10-v1')); });
test('56 xuất HTML/JSON cùng hai đợt, 50 chuyển kỳ, phiên bản', () => {
    const s = ready('B'), html = renderReport(s.cases[0], s);
    for (const text of ['DOT-1', 'DOT-2', '50 tấn', 'KH-KYSAU-DEMO'])
        assert.ok(html.includes(text));
    assert.equal(JSON.parse(JSON.stringify(s)).cases[0].proposal.carry.qty, 50);
});
test('57 chứng từ cũ không tự đủ checklist sau trả lại; dùng lại có lý do', () => { let s = apply(ready(), 'submit'); s = apply(s, 'return', { note: 'Sửa' }, 'director'); const old = s.cases[0].evidence[0].id; s = apply(s, 'narrative'); assert.equal(s.cases[0].evidence[0].version, 1); assert.throws(() => apply(s, 'reuse_evidence', { evidenceId: old })); s = apply(s, 'reuse_evidence', { evidenceId: old, reason: 'Số tồn và chứng từ chưa đổi' }); assert.equal(s.cases[0].evidence.at(-1)!.version, 2); });
test('58 giả checkbox B thực hiện không vượt backend', () => assert.throws(() => apply(approved('B'), 'execution', { execution: { qty: 0, at: '2026-10-26T06:00', planExecuted: true } })));
test('59 nguồn thay đổi hủy xác nhận và đợt phụ thuộc không đóng được', () => { let s = bDone(); s = apply(s, 'source_actual', { source: { ...s.cases[0].execution.sources![0], qty: 89 } }); assert.ok(closureIssues(s.cases[0]).some(x => x.includes('SHIP-90'))); });
test('60 thiếu 50 chuyển kỳ hoặc sai liên kết không đủ phương án', () => { const c = run().cases[0], p = defaultB(c); p.carry!.qty = 0; assert.equal(proposalBalance(c, p).valid, false); p.carry!.qty = 50; p.carry!.planId = ''; assert.equal(proposalBalance(c, p).valid, false); });
test('61 cùng nguyên liệu nhưng thêm nhu cầu kỳ tương lai độc lập không hủy quyết định kỳ trước', () => { let s = approved(); const i = structuredClone(s.inputs); i.needs.push({ id: 'NOV', material: 'KALI', qty: 20, at: '2026-11-20T07:00', source: 'KH-NOV', scope: '2026-11' }); s = apply(s, 'save_inputs', { inputs: i, reason: 'Kỳ mới độc lập' }); assert.equal(s.cases[0].status, 'executing'); assert.equal(s.cases[0].approvedVersion, 1); });
test('62 đổi nhu cầu khác ở trước mốc vẫn ảnh hưởng Kali vì chung tồn', () => { let s = approved(); const i = structuredClone(s.inputs); i.needs.push({ id: 'EARLIER', material: 'KALI', qty: 1, at: '2026-10-23T07:00', source: 'KH-OTHER', scope: 'OTHER' }); s = apply(s, 'save_inputs', { inputs: i, reason: 'Nhu cầu khác cùng dùng tồn' }); assert.equal(s.cases[0].status, 'needs_review'); assert.equal(s.cases[0].approvedVersion, undefined); });
test('63 đảo thứ tự dòng không tạo phiên bản nghiệp vụ', () => { const s = approved(), i = structuredClone(s.inputs); i.stocks.reverse(); i.needs.reverse(); const next = apply(s, 'save_inputs', { inputs: i }); assert.equal(next.inputVersion, s.inputVersion); assert.equal(next.cases[0].version, 1); });
test('64 chứng từ nhập có version cũ không tự đóng A', () => { let s = receipt(approved()); s.cases[0].evidence = s.cases[0].evidence.filter(x => x.kind !== 'receipt'); s = apply(s, 'evidence', { kind: 'receipt', reference: 'PN-CU', executionId: 'PN-1', version: 99 }); assert.throws(() => apply(s, 'close', {}, 'director'), /chứng từ/); });
test('65 khác mã chuyến nhưng cùng lô khai báo bị giữ để đối soát', () => { const i = seed().inputs; i.shipments[0].lotId = 'LOT-ONE'; i.shipments.push({ ...i.shipments[0], id: 'SHIP-COPY' }); assert.ok(calculate(formal(i)).errors.some(x => x.includes('trùng lô'))); });
test('66 chỉ vai trò chuyên môn được xác nhận dùng lại chứng từ chuyên môn', () => { let s = ready(); s = apply(s, 'evidence', { kind: 'release', reference: 'QC-OLD' }, 'qa'); const id = s.cases[0].evidence.at(-1)!.id; assert.throws(() => apply(s, 'reuse_evidence', { evidenceId: id, reason: 'Còn áp dụng' }, 'ops')); assert.equal(apply(s, 'reuse_evidence', { evidenceId: id, reason: 'Còn áp dụng' }, 'qa').cases[0].evidence.at(-1)!.by, 'QA/QC'); });
test('67 lịch dự kiến không được sẵn sàng trước QA dự kiến', () => { const i = seed().inputs; i.shipments[0].readyAt = '2026-10-24T06:00'; assert.ok(calculate(formal(i)).errors.some(x => x.includes('QA dự kiến'))); });
test('68 mọi lần tạo nhận định đều chờ rà soát kể cả dùng mẫu khi chưa có key', async () => { const c = ready().cases[0]; assert.ok(c.claims.every(x => x.status === 'accepted')); await generateNarrative(c, {}); assert.ok(c.claims.every(x => x.status === 'pending')); });
