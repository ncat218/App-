import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seed, calculate, transition, proposalBalance, type State, type Role } from '../lib/engine.ts';
import { importCsv, exportCsv } from '../lib/imports.ts';
const run = () => transition(seed(), 'ops', 'run', {});
function apply(s: State, a: string, p: any = {}, r: Role = 'ops') { return transition(s, r, a, { caseId: 'EX-0041', ...p }); }
function ready(option: 'A' | 'B' = 'A') {
    let s = run();
    s = apply(s, 'narrative');
    for (const claim of s.cases[0].claims)
        s = apply(s, 'review_claim', { claimId: claim.id, status: 'accepted' });
    for (const kind of ['inventory', 'quality', 'plan'])
        s = apply(s, 'evidence', { kind, reference: 'DEMO-' + kind });
    s = apply(s, 'proposal', { proposal: { option, qty: 140, demand: option === 'A' ? 220 : 170, readyAt: option === 'A' ? '2026-10-24T06:00' : '2026-10-26T07:00', source: 'DEMO', note: 'Giả lập' } });
    s = apply(s, 'confirm_proposal', {}, option === 'A' ? 'supply' : 'director');
    return s;
}
function approved(option: 'A' | 'B' = 'A') { let s = ready(option); s = apply(s, 'submit'); s = apply(s, 'forward', {}, 'director'); return apply(s, 'approve', {}, 'ceo'); }
test('01 EX-0041: U=100, số dư -120, cần 140 để giữ dự trữ', () => { const b = run().balances[0]; assert.equal(b.available, 100); assert.equal(b.firm, -120); assert.equal(b.reserve - b.firm, 140); });
test('02 bình thường khi đủ nhu cầu và dự trữ', () => assert.equal(run().balances.find(x => x.material === 'UREA')?.level, 0));
test('03 đủ sản xuất nhưng dưới dự trữ là cấp 1', () => assert.equal(run().balances.find(x => x.material === 'DAP')?.level, 1));
test('04 điều kiện biên: bằng dự trữ bình thường, bằng 0 cấp 1', () => { const i = seed().inputs; i.needs[0].qty = 80; assert.equal(calculate(i).rows[0].level, 0); i.needs[0].qty = 100; assert.equal(calculate(i).rows[0].level, 1); });
test('05 hàng về trễ không cộng trước hạn', () => assert.equal(run().balances[0].incoming, 0));
test('06 lịch kịp: kế hoạch -30; chắc chắn vẫn -120', () => { const i = seed().inputs; i.shipments[0].readyAt = '2026-10-24T06:00'; const b = calculate(i).rows[0]; assert.equal(b.planned, -30); assert.equal(b.firm, -120); });
test('07 nguồn thực tế được phép dùng vào kịch bản chắc chắn', () => { const i = seed().inputs; i.shipments[0].readyAt = '2026-10-24T06:00'; i.shipments[0].status = 'released'; assert.equal(calculate(i).rows[0].firm, -30); });
test('08 ETA chưa rõ: giữ 90 tấn nhưng không cộng', () => { const i = seed().inputs; i.shipments[0].status = 'unknown'; i.shipments[0].readyAt = ''; assert.equal(calculate(i).rows[0].planned, -120); assert.equal(i.shipments[0].qty, 90); });
test('09 hai ca tính lũy kế: 100 - 70 - 60 = -30', () => { const i = seed().inputs; i.shipments = []; i.needs = [{ id: 'N1', material: 'KALI', qty: 70, at: '2026-10-23T07:00', source: 'KH1' }, { id: 'N2', material: 'KALI', qty: 60, at: '2026-10-24T07:00', source: 'KH1' }]; assert.deepEqual(calculate(i).rows.map(b => b.firm), [30, -30]); });
test('10 mã chuyến trùng bị chặn', () => { const i = seed().inputs; i.shipments.push({ ...i.shipments[0] }); assert.ok(calculate(i).errors.some(x => x.includes('trùng'))); });
test('11 số âm, sai đơn vị và loại trừ quá tồn bị chặn', () => { for (const change of [(i: any) => i.stocks[0].qty = -1, (i: any) => i.stocks[0].unit = 'kg', (i: any) => i.stocks[0].held = 999]) {
    const i = seed().inputs;
    change(i);
    assert.ok(calculate(i).errors.length);
} });
test('12 DATA_HOLD giữ hồ sơ và không phát kết quả chính thức', () => { let s = run(); const i = structuredClone(s.inputs); i.stocks[0].confirmed = false; s = apply(s, 'save_inputs', { inputs: i }); s = apply(s, 'run'); assert.equal(s.balances.length, 0); assert.equal(s.cases.length, 2); assert.ok(s.errors.length); });
test('13 chạy lại không tạo hồ sơ trùng', () => { let s = run(); s = apply(s, 'run'); assert.equal(s.cases.length, 2); });
test('14 phương án A thiếu lượng hoặc về trễ không được lưu', () => { const s = run(); for (const p of [{ qty: 120, readyAt: '2026-10-24T06:00' }, { qty: 140, readyAt: '2026-10-25T06:00' }])
    assert.throws(() => apply(s, 'proposal', { proposal: { option: 'A', demand: 220, source: 'X', ...p } })); });
test('15 phương án B: 190 tổng nguồn, 170 nhu cầu, còn 20', () => { const c = run().cases[0]; assert.equal(proposalBalance(c, { option: 'B', qty: 0, demand: 170, readyAt: '2026-10-26T07:00', source: 'X', note: '', confirmed: false }).remaining, 20); assert.equal(proposalBalance(c, { option: 'B', qty: 0, demand: 220, readyAt: '2026-10-26T07:00', source: 'X', note: '', confirmed: false }).valid, false); });
test('16 chặn trình khi thiếu bằng chứng/kiểm tra nhận định', () => { assert.throws(() => apply(run(), 'submit')); let s = ready(); s.cases[0].claims[0].status = 'pending'; assert.throws(() => apply(s, 'submit')); });
test('17 đúng tuyến, sai vai trò không được duyệt thay', () => { let s = apply(ready(), 'submit'); assert.throws(() => apply(s, 'approve', {}, 'ceo')); assert.throws(() => apply(s, 'forward', {}, 'ops')); s = apply(s, 'forward', {}, 'director'); assert.equal(apply(s, 'approve', {}, 'ceo').cases[0].status, 'executing'); });
test('18 thay số sau trình vô hiệu duyệt cũ và lưu phiên bản', () => { let s = apply(ready(), 'submit'); s = apply(s, 'save_inputs', { inputs: { ...s.inputs, planVersion: 'v2' } }); assert.equal(s.cases[0].status, 'needs_review'); assert.equal(s.cases[0].version, 2); assert.throws(() => apply(s, 'forward', {}, 'director')); });
test('19 A chưa đủ chứng từ không đóng; đủ lượng/QC/chứng từ thì đóng', () => { let s = approved(); assert.throws(() => apply(s, 'close', {}, 'director')); s = apply(s, 'execution', { execution: { qty: 140, at: '2026-10-24T06:00', note: 'Demo' } }); for (const kind of ['order', 'receipt'])
    s = apply(s, 'evidence', { kind, reference: 'DEMO' }); s = apply(s, 'evidence', { kind: 'release', reference: 'QC-DEMO' }, 'qa'); s = apply(s, 'release', {}, 'qa'); s = apply(s, 'close', {}, 'director'); assert.equal(s.cases[0].status, 'closed'); assert.equal(apply(s, 'run').cases.length, 2); });
test('20 B phải có xác nhận thực hiện; kiểm tra trả lại và CSV roundtrip', () => { let s = approved('B'); assert.throws(() => apply(s, 'close', {}, 'director')); s = apply(s, 'execution', { execution: { qty: 0, at: '2026-10-26T07:00', planExecuted: true, note: 'Demo' } }); s = apply(s, 'evidence', { kind: 'execution', reference: 'LSX-MOI-DEMO' }); assert.equal(apply(s, 'close', {}, 'director').cases[0].status, 'closed'); let r = apply(ready(), 'submit'); r = apply(r, 'return', { note: 'Cần xác minh thêm' }, 'director'); assert.equal(r.cases[0].status, 'needs_info'); assert.deepEqual(importCsv(exportCsv(seed().inputs)), seed().inputs); });
test('21 sửa hồ sơ trả lại tạo phiên bản mới và giữ snapshot trước', () => { let s = apply(ready(), 'submit'); s = apply(s, 'return', { note: 'Cần bổ sung' }, 'director'); s = apply(s, 'evidence', { kind: 'supply', reference: 'KH-TM-NEW' }, 'supply'); assert.equal(s.cases[0].version, 2); assert.equal(s.cases[0].history?.[0].version, 1); assert.equal(s.cases[0].status, 'draft'); });
test('22 thay lượng hoặc thời điểm thực nhận phải QA/QC xác nhận lại', () => { let s = approved(); s = apply(s, 'execution', { execution: { qty: 140, at: '2026-10-24T06:00' } }); s = apply(s, 'evidence', { kind: 'release', reference: 'QC' }, 'qa'); s = apply(s, 'release', {}, 'qa'); assert.equal(s.cases[0].execution.quality, true); s = apply(s, 'execution', { execution: { qty: 150, at: '2026-10-24T06:00' } }); assert.equal(s.cases[0].execution.quality, false); });
