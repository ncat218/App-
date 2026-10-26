export type Role = 'ops' | 'qa' | 'supply' | 'director' | 'ceo';
export const roles: Record<Role, string> = { ops: 'Kho vận', qa: 'QA/QC', supply: 'KH-TM', director: 'Giám đốc Nhà máy', ceo: 'Tổng Giám đốc SFG' };
export type Stock = {
    id: string;
    name: string;
    qty: number;
    held: number;
    allocated: number;
    reserve: number;
    unit: string;
    source: string;
    confirmed: boolean;
};
export type Need = {
    id: string;
    material: string;
    qty: number;
    at: string;
    source: string;
};
export type Shipment = {
    id: string;
    material: string;
    qty: number;
    readyAt: string;
    status: 'planned' | 'released' | 'unknown';
    source: string;
};
export type Inputs = {
    cutoff: string;
    planVersion: string;
    stocks: Stock[];
    needs: Need[];
    shipments: Shipment[];
};
export type Balance = {
    material: string;
    name: string;
    at: string;
    available: number;
    incoming: number;
    demand: number;
    reserve: number;
    firm: number;
    planned: number;
    level: number;
    sources: string[];
};
export type Evidence = {
    id: string;
    kind: string;
    reference: string;
    filename?: string;
    key?: string;
    by: string;
    at: string;
};
export type Claim = {
    id: string;
    text: string;
    sources: string[];
    status: 'pending' | 'accepted' | 'edited' | 'rejected';
    reason?: string;
    original?: string;
};
export type Proposal = {
    option: 'A' | 'B';
    qty: number;
    readyAt: string;
    demand: number;
    source: string;
    note: string;
    confirmed: boolean;
};
export type Case = {
    id: string;
    version: number;
    material: string;
    name: string;
    status: string;
    balance: Balance;
    snapshot: Inputs;
    snapshotVersion: number;
    createdAt: string;
    due: string;
    claims: Claim[];
    narrativeMode: string;
    proposal: Proposal | null;
    evidence: Evidence[];
    submittedAt?: string;
    approvedAt?: string;
    approvedVersion?: number;
    closedAt?: string;
    execution: {
        qty: number;
        at: string;
        quality: boolean;
        planExecuted: boolean;
        note: string;
    };
    history?: any[];
    reviewNote?: string;
    proposalChecked?: boolean;
};
export type Audit = {
    id: string;
    at: string;
    role: string;
    action: string;
    caseId?: string;
    detail: string;
};
export type State = {
    revision: number;
    inputVersion: number;
    inputs: Inputs;
    balances: Balance[];
    errors: string[];
    cases: Case[];
    events: Audit[];
    lastRun?: string;
};
export class DomainError extends Error {
    status: number;
    constructor(message: string, status = 400) { super(message); this.status = status; }
}
const check = (ok: unknown, msg: string) => { if (!ok)
    throw new DomainError(msg); };
const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const time = (v: string) => Date.parse(v.endsWith('Z') || /[+-]\d\d:\d\d$/.test(v) ? v : v + '+07:00');
const date = (v: unknown) => typeof v === 'string' && Number.isFinite(time(v));
const stamp = () => new Date().toISOString();
const code = () => crypto.randomUUID();
export function seed(): State { return { revision: 0, inputVersion: 1, inputs: { cutoff: '2026-10-22T08:00', planVersion: 'KH-2026-10-v1', stocks: [{ id: 'KALI', name: 'Kali · KCl', qty: 150, held: 20, allocated: 30, reserve: 20, unit: 'tấn', source: 'KHO-2210 / KT-2210 / QC-008', confirmed: true }, { id: 'UREA', name: 'Urê', qty: 320, held: 0, allocated: 20, reserve: 40, unit: 'tấn', source: 'KHO-2210 / QC-009', confirmed: true }, { id: 'DAP', name: 'DAP', qty: 85, held: 5, allocated: 10, reserve: 15, unit: 'tấn', source: 'KHO-2210 / QC-010', confirmed: true }], needs: [{ id: 'LSX-0041', material: 'KALI', qty: 220, at: '2026-10-24T07:00', source: 'KH-2026-10-v1 / BOM-K01' }, { id: 'LSX-0042', material: 'UREA', qty: 180, at: '2026-10-24T07:00', source: 'KH-2026-10-v1 / BOM-U01' }, { id: 'LSX-0043', material: 'DAP', qty: 60, at: '2026-10-24T07:00', source: 'KH-2026-10-v1 / BOM-D01' }], shipments: [{ id: 'SHIP-90', material: 'KALI', qty: 90, readyAt: '2026-10-26T06:00', status: 'planned', source: 'KH-TM-014 / Lịch sẵn sàng dự kiến' }] }, balances: [], errors: [], cases: [], events: [] }; }
export function validate(i: Inputs): string[] {
    const errors: string[] = [];
    if (!i || !Array.isArray(i.stocks) || !Array.isArray(i.needs) || !Array.isArray(i.shipments))
        return ['Thiếu bảng tồn kho, nhu cầu hoặc hàng đang về.'];
    if (!date(i.cutoff))
        errors.push('Thời điểm chốt dữ liệu không hợp lệ.');
    if ([...i.stocks, ...i.needs, ...i.shipments].some(r => !r || typeof r !== 'object'))
        return ['Dòng dữ liệu không hợp lệ.'];
    if (!i.planVersion?.trim())
        errors.push('Chưa có phiên bản kế hoạch.');
    if (!i.stocks.length)
        errors.push('Chưa có nguyên liệu.');
    for (const [label, rows] of [['Tồn kho', i.stocks], ['Nhu cầu', i.needs], ['Chuyến hàng', i.shipments]] as const) {
        const ids = new Set();
        for (const r of rows) {
            if (!r.id || ids.has(r.id))
                errors.push(`${label}: mã rỗng hoặc trùng ${r.id}.`);
            ids.add(r.id);
        }
    }
    for (const s of i.stocks) {
        if (![s.qty, s.held, s.allocated, s.reserve].every(num))
            errors.push(`${s.id}: số lượng phải là số không âm.`);
        if (s.held + s.allocated > s.qty)
            errors.push(`${s.id}: lượng loại trừ vượt tổng tồn; cần đối chiếu phần chồng lặp.`);
        if (s.unit !== 'tấn')
            errors.push(`${s.id}: cần quy đổi đơn vị về tấn.`);
        if (!s.confirmed || !s.source?.trim())
            errors.push(`${s.id}: thiếu xác nhận hoặc nguồn chứng từ.`);
    }
    const ids = new Set(i.stocks.map(s => s.id));
    for (const n of i.needs) {
        if (!ids.has(n.material) || !num(n.qty) || !date(n.at) || time(n.at) < time(i.cutoff) || !n.source?.trim())
            errors.push(`${n.id}: sai mã nguyên liệu, lượng, thời điểm hoặc thiếu nguồn kế hoạch.`);
    }
    for (const s of i.shipments) {
        if (!ids.has(s.material) || !num(s.qty) || !['planned', 'released', 'unknown'].includes(s.status) || !s.source?.trim())
            errors.push(`${s.id}: thông tin chuyến hàng không hợp lệ.`);
        if (s.status !== 'unknown' && !date(s.readyAt))
            errors.push(`${s.id}: thiếu thời điểm sẵn sàng; hãy đánh dấu chưa rõ lịch.`);
    }
    return errors;
}
export function calculate(i: Inputs): {
    errors: string[];
    rows: Balance[];
} {
    const errors = validate(i);
    if (errors.length)
        return { errors, rows: [] };
    const rows: Balance[] = [];
    for (const s of i.stocks) {
        const needs = i.needs.filter(n => n.material === s.id);
        const times = [...new Set(needs.map(n => n.at))].sort();
        for (const at of times) {
            const ns = needs.filter(n => time(n.at) <= time(at));
            const ships = i.shipments.filter(x => x.material === s.id && x.status !== 'unknown' && time(x.readyAt) <= time(at));
            const available = s.qty - s.held - s.allocated;
            const demand = ns.reduce((a, n) => a + n.qty, 0);
            const incoming = ships.reduce((a, n) => a + n.qty, 0);
            const firm = available + ships.filter(x => x.status === 'released').reduce((a, n) => a + n.qty, 0) - demand;
            const planned = available + incoming - demand;
            rows.push({ material: s.id, name: s.name, at, available, incoming, demand, reserve: s.reserve, firm, planned, level: firm < 0 ? 2 : firm < s.reserve ? 1 : 0, sources: [s.source, ...ns.map(n => n.source), ...ships.map(n => n.source)] });
        }
    }
    return { errors, rows };
}
export function proposalBalance(c: Case, p: Proposal) {
    const i = c.snapshot;
    const b = c.balance;
    const baseline = i.stocks.find(s => s.id === c.material)!;
    check(['A', 'B'].includes(p.option), 'Phương án không hợp lệ.');
    check(num(p.qty) && num(p.demand) && date(p.readyAt), 'Lượng hoặc lịch phương án không hợp lệ.');
    if (p.option === 'A')
        return { remaining: b.firm + p.qty, reserve: baseline.reserve, need: b.demand, valid: time(p.readyAt) <= time(b.at) && b.firm + p.qty >= baseline.reserve };
    // Moving a whole scoped production demand requires checking every earlier use of the stock.
    const other = i.needs.filter(n => n.material === c.material && n.at !== b.at && time(n.at) <= time(p.readyAt)).reduce((a, n) => a + n.qty, 0);
    const incoming = i.shipments.filter(s => s.material === c.material && s.status !== 'unknown' && time(s.readyAt) <= time(p.readyAt)).reduce((a, n) => a + n.qty, 0);
    const remaining = b.available + incoming - other - p.demand;
    return { remaining, reserve: baseline.reserve, need: p.demand, valid: time(p.readyAt) >= time(b.at) && p.demand <= b.demand && remaining >= baseline.reserve };
}
function allowed(role: Role, list: Role[]) { check(list.includes(role), 'Vai trò hiện tại không được thực hiện thao tác này.'); }
function event(s: State, role: Role, action: string, detail: string, caseId?: string) { s.events.unshift({ id: code(), at: stamp(), role: roles[role], action, detail, caseId }); }
export function transition(original: State, role: Role, action: string, p: any): State {
    check(Object.hasOwn(roles, role), 'Vai trò không hợp lệ.');
    const s: State = structuredClone(original);
    if (action === 'reset') {
        allowed(role, ['ops']);
        const fresh = seed();
        fresh.revision = s.revision;
        event(fresh, role, 'Đặt lại demo', 'Khởi tạo lại bộ dữ liệu giả lập EX-0041.');
        return fresh;
    }
    if (action === 'save_inputs') {
        allowed(role, ['ops']);
        check(p.inputs?.stocks?.length <= 100 && p.inputs?.needs?.length <= 500 && p.inputs?.shipments?.length <= 500, 'Bộ dữ liệu quá lớn hoặc sai cấu trúc.');
        s.inputs = p.inputs;
        s.inputVersion++;
        s.errors = validate(s.inputs);
        s.balances = [];
        for (const c of s.cases.filter(c => c.status !== 'closed')) {
            const { history, ...previous } = structuredClone(c);
            c.history = [...(c.history || []), previous];
            c.version++;
            c.status = 'needs_review';
            c.approvedVersion = undefined;
            c.submittedAt = undefined;
            c.claims = [];
            c.proposalChecked = false;
            c.reviewNote = 'Dữ liệu thay đổi. Chạy lại cân đối và xác minh phiên bản mới trước khi trình.';
        }
        event(s, role, 'Cập nhật dữ liệu', `Phiên bản dữ liệu ${s.inputVersion}; mọi hồ sơ đang mở phải xem xét lại.`);
        return s;
    }
    if (action === 'run') {
        allowed(role, ['ops']);
        const calc = calculate(s.inputs);
        s.errors = calc.errors;
        s.balances = calc.rows;
        s.lastRun = stamp();
        if (s.errors.length) {
            event(s, role, 'DATA_HOLD', s.errors.join(' '));
            return s;
        }
        for (const material of [...new Set(s.balances.map(b => b.material))]) {
            const group = s.balances.filter(b => b.material === material);
            const b = group.find(b => b.level === 2) || group.find(b => b.level === 1);
            let c = s.cases.find(c => c.material === material && c.status !== 'closed');
            if (!c && s.cases.some(c => c.material === material && c.status === 'closed' && c.snapshotVersion === s.inputVersion))
                continue;
            if (!b) {
                if (c) {
                    c.status = 'needs_review';
                    c.reviewNote = 'Cân đối hiện tại đã đủ. Cần xác minh và ghi nhận lý do trước khi đóng.';
                }
                continue;
            }
            if (!c) {
                c = { id: `EX-${String(41 + s.cases.length).padStart(4, '0')}`, version: 1, material, name: b.name, status: 'draft', balance: b, snapshot: structuredClone(s.inputs), snapshotVersion: s.inputVersion, createdAt: stamp(), due: b.at, claims: [], narrativeMode: '', proposal: null, evidence: [], execution: { qty: 0, at: '', quality: false, planExecuted: false, note: '' } };
                s.cases.push(c);
                event(s, role, 'Mở hồ sơ', `${b.name}: cấp ${b.level}, số dư ${b.firm} tấn.`, c.id);
            }
            else if (c.snapshotVersion !== s.inputVersion) {
                c.balance = b;
                c.snapshot = structuredClone(s.inputs);
                c.snapshotVersion = s.inputVersion;
                c.status = 'draft';
                c.claims = [];
                c.proposal = null;
                c.evidence = [];
                c.execution = { qty: 0, at: '', quality: false, planExecuted: false, note: '' };
                c.reviewNote = undefined;
            }
        }
        event(s, role, 'Chạy cân đối', `${calc.rows.length} mốc; ${calc.rows.filter(b => b.level > 0).length} cảnh báo. Không tạo hồ sơ trùng khi chạy lại.`);
        return s;
    }
    const c = s.cases.find(c => c.id === p.caseId);
    check(c, 'Không tìm thấy hồ sơ.');
    if (!c)
        throw new DomainError('Không tìm thấy hồ sơ.', 404);
    check(c.status !== 'closed', 'Hồ sơ đã đóng; hãy tạo một kỳ dữ liệu mới.');
    if (['needs_info', 'rejected'].includes(c.status) && ['narrative', 'review_claim', 'proposal', 'evidence'].includes(action)) {
        const { history, ...previous } = structuredClone(c);
        c.history = [...(c.history || []), previous];
        c.version++;
        c.status = 'draft';
        c.submittedAt = undefined;
        c.approvedVersion = undefined;
    }
    if (action === 'narrative') {
        allowed(role, ['ops']);
        check(['draft', 'needs_info', 'needs_review', 'rejected'].includes(c.status), 'Không soạn lại khi hồ sơ đang được duyệt hoặc thực thi.');
        const b = c.balance;
        c.narrativeMode = 'template';
        c.claims = [{ id: 'C1', text: `Tồn dùng được ${b.available} tấn; nhu cầu lũy kế đến ${b.at.replace('T', ' ')} là ${b.demand} tấn. Số dư nguồn chắc chắn ${b.firm} tấn.`, sources: b.sources, status: 'pending' }, { id: 'C2', text: `Nguồn theo kế hoạch cho số dư ${b.planned} tấn. Chuyến về sau thời điểm cần hoặc chưa rõ lịch không được cộng trước hạn.`, sources: c.snapshot.shipments.filter(s => s.material === c.material).map(s => s.source), status: 'pending' }, { id: 'C3', text: `Để đáp ứng nhu cầu và giữ ${b.reserve} tấn dự trữ, khoảng thiếu theo nguồn chắc chắn là ${Math.max(0, b.reserve - b.firm)} tấn. Cần xác minh nguồn bổ sung hoặc điều chỉnh kế hoạch; chưa có căn cứ xếp hạng kinh tế.`, sources: [c.snapshot.planVersion], status: 'pending' }];
        event(s, role, 'Soạn nhận định', 'Mẫu tự động từ số khóa; chưa sử dụng Gemini.', c.id);
    }
    else if (action === 'review_claim') {
        allowed(role, ['ops']);
        check(['draft', 'needs_info', 'needs_review', 'rejected'].includes(c.status), 'Hồ sơ không ở bước kiểm tra.');
        const claim = c.claims.find(x => x.id === p.claimId);
        check(claim, 'Không tìm thấy nhận định.');
        check(['accepted', 'edited', 'rejected'].includes(p.status), 'Kết quả kiểm tra không hợp lệ.');
        if (claim) {
            if (p.status !== 'accepted')
                check(p.reason?.trim(), 'Cần ghi lý do sửa hoặc bác bỏ.');
            if (p.status === 'edited') {
                check(p.text?.trim(), 'Nội dung chỉnh sửa đang trống.');
                claim.original = claim.text;
                claim.text = String(p.text).slice(0, 4000);
            }
            claim.status = p.status;
            claim.reason = p.reason;
        }
        event(s, role, 'Kiểm tra nhận định', `${p.claimId}: ${p.status}; trước: ${original.cases.find(x => x.id === c.id)?.claims.find(x => x.id === p.claimId)?.text}; sau: ${claim?.text}; lý do: ${p.reason || 'Đã đối chiếu chứng từ.'}`, c.id);
    }
    else if (action === 'proposal') {
        allowed(role, ['ops']);
        check(['draft', 'needs_info', 'needs_review', 'rejected'].includes(c.status), 'Cần trả hồ sơ về trước khi thay phương án.');
        check(p.proposal?.source?.trim(), 'Cần mã chứng từ căn cứ phương án.');
        check(proposalBalance(c, p.proposal).valid, 'Phương án chưa đủ dự trữ, sai thời điểm hoặc vượt phạm vi nhu cầu.');
        c.proposal = { ...p.proposal, confirmed: false };
        c.proposalChecked = false;
        event(s, role, 'Lưu phương án', `Phương án ${p.proposal.option}; chờ bộ phận chuyên môn xác minh.`, c.id);
    }
    else if (action === 'confirm_proposal') {
        check(c.proposal, 'Chưa có phương án.');
        allowed(role, c.proposal?.option === 'A' ? ['supply'] : ['director']);
        check(['draft', 'needs_info', 'needs_review', 'rejected'].includes(c.status), 'Hồ sơ không ở bước xác minh.');
        if (c.proposal)
            c.proposal.confirmed = true;
        c.proposalChecked = true;
        event(s, role, 'Xác minh phương án', `Nguồn/lịch phương án ${c.proposal?.option} đã được đối chiếu.`, c.id);
    }
    else if (action === 'evidence') {
        allowed(role, ['ops', 'qa', 'supply', 'director']);
        check(p.reference?.trim(), 'Cần mã chứng từ hoặc nội dung xác nhận.');
        check(['inventory', 'quality', 'plan', 'supply', 'order', 'receipt', 'release', 'execution'].includes(p.kind), 'Loại bằng chứng không hợp lệ.');
        if (p.kind === 'release')
            allowed(role, ['qa']);
        if (p.kind === 'supply')
            allowed(role, ['supply']);
        check(!p.key || typeof p.key === 'string', 'Tệp đính kèm không hợp lệ.');
        c.evidence.push({ id: code(), kind: p.kind, reference: String(p.reference).slice(0, 1000), filename: p.filename, key: p.key, by: roles[role], at: stamp() });
        event(s, role, 'Thêm bằng chứng', `${p.kind}: ${p.reference}`, c.id);
    }
    else if (action === 'submit') {
        allowed(role, ['ops']);
        check(['draft', 'needs_info', 'rejected', 'needs_review'].includes(c.status), 'Hồ sơ không ở bước trình.');
        check(c.snapshotVersion === s.inputVersion && !s.errors.length, 'Dữ liệu thay đổi hoặc chưa hợp lệ. Chạy lại cân đối.');
        check(c.proposal?.confirmed, 'Phương án chưa được bộ phận chuyên môn xác minh.');
        check(c.claims.length > 0 && c.claims.every(x => x.status !== 'pending') && c.claims.some(x => x.status === 'accepted' || x.status === 'edited'), 'Cần kiểm tra từng nhận định trước khi trình.');
        check(['inventory', 'quality', 'plan'].every(k => c.evidence.some(e => e.kind === k)), 'Thiếu bằng chứng tồn kho, chất lượng hoặc kế hoạch.');
        c.status = 'director_review';
        c.submittedAt = stamp();
        event(s, role, 'Trình hồ sơ', `Trình GĐ Nhà máy, phiên bản v${c.version}.`, c.id);
    }
    else if (action === 'forward') {
        allowed(role, ['director']);
        check(c.status === 'director_review', 'Hồ sơ chưa chờ Giám đốc Nhà máy.');
        c.status = 'ceo_review';
        event(s, role, 'Trình Tổng Giám đốc', 'Đã kiểm tra hồ sơ và tuyến phê duyệt.', c.id);
    }
    else if (action === 'approve') {
        allowed(role, ['ceo']);
        check(c.status === 'ceo_review', 'Hồ sơ chưa chờ Tổng Giám đốc.');
        check(c.snapshotVersion === s.inputVersion && c.proposal?.confirmed, 'Phiên bản hoặc xác minh không còn hợp lệ.');
        c.status = 'executing';
        c.approvedAt = stamp();
        c.approvedVersion = c.version;
        event(s, role, 'Phê duyệt', `Phê duyệt phương án ${c.proposal!.option}, phiên bản v${c.version}.`, c.id);
    }
    else if (action === 'return' || action === 'reject') {
        allowed(role, ['director', 'ceo']);
        check((role === 'director' && c.status === 'director_review') || (role === 'ceo' && c.status === 'ceo_review'), 'Hồ sơ không chờ vai trò hiện tại.');
        check(p.note?.trim(), 'Cần ghi lý do.');
        c.status = action === 'return' ? 'needs_info' : 'rejected';
        c.reviewNote = p.note;
        c.proposalChecked = false;
        if (c.proposal)
            c.proposal.confirmed = false;
        event(s, role, action === 'return' ? 'Yêu cầu bổ sung' : 'Từ chối', p.note, c.id);
    }
    else if (action === 'execution') {
        allowed(role, ['ops', 'supply']);
        check(c.status === 'executing' && c.approvedVersion === c.version, 'Chưa có quyết định hợp lệ cho phiên bản hiện tại.');
        check(num(p.execution?.qty), 'Số lượng thực nhận không hợp lệ.');
        if (c.execution.qty !== p.execution.qty || c.execution.at !== p.execution.at)
            c.execution.quality = false;
        c.execution = { ...c.execution, qty: p.execution.qty, at: p.execution.at, planExecuted: !!p.execution.planExecuted, note: String(p.execution.note || '').slice(0, 2000) };
        event(s, role, 'Cập nhật thực hiện', `${c.execution.qty} tấn; ${c.execution.note}`, c.id);
    }
    else if (action === 'release') {
        allowed(role, ['qa']);
        check(c.status === 'executing', 'Hồ sơ chưa ở bước thực thi.');
        check(c.evidence.some(e => e.kind === 'release'), 'Cần chứng từ xác nhận được phép sử dụng.');
        c.execution.quality = true;
        event(s, role, 'Giải phóng chất lượng', 'QA/QC xác nhận nguyên liệu thực nhận được phép sử dụng.', c.id);
    }
    else if (action === 'close') {
        allowed(role, ['director']);
        check(c.status === 'executing' && c.approvedVersion === c.version, 'Hồ sơ chưa đủ điều kiện đóng.');
        const p = c.proposal!;
        if (p.option === 'A') {
            check(c.execution.qty >= p.qty, 'Chưa nhận đủ lượng theo phương án đã duyệt.');
            check(date(c.execution.at) && time(c.execution.at) <= time(c.balance.at), 'Thực nhận chưa kịp thời điểm cần; phải xử lý tiếp.');
            check(c.execution.quality, 'QA/QC chưa xác nhận hàng được phép dùng.');
            check(['order', 'receipt', 'release'].every(k => c.evidence.some(e => e.kind === k)), 'Thiếu lệnh mua/điều động, chứng từ nhận hàng hoặc giải phóng chất lượng.');
        }
        else {
            check(c.execution.planExecuted, 'Kế hoạch mới chưa được xác nhận thực hiện.');
            check(['plan', 'execution'].every(k => c.evidence.some(e => e.kind === k)), 'Thiếu kế hoạch duyệt hoặc xác nhận thực hiện.');
        }
        c.status = 'closed';
        c.closedAt = stamp();
        event(s, role, 'Đóng hồ sơ', `Hoàn tất phương án ${p.option}; đã kiểm tra bằng chứng thực thi.`, c.id);
    }
    else
        throw new DomainError('Thao tác không được hỗ trợ.');
    return s;
}
