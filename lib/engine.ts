export type Role = 'ops' | 'qa' | 'supply' | 'accounting' | 'workshop' | 'director' | 'ceo';
export const roles: Record<Role, string> = { ops: 'Kho vận', qa: 'QA/QC', supply: 'KH-TM', accounting: 'Kế toán', workshop: 'Phân xưởng', director: 'Giám đốc Nhà máy', ceo: 'Tổng Giám đốc SFG' };
export type CheckKind = 'inventory' | 'books' | 'quality' | 'plan' | 'supply';
export const checkRoles: Record<CheckKind, Role> = { inventory: 'ops', books: 'accounting', quality: 'qa', plan: 'workshop', supply: 'supply' };
export const checkLabels: Record<CheckKind, string> = { inventory: 'Tồn, loại trừ đã loại trùng; A0 chỉ dành lệnh ngoài phạm vi', books: 'Đối soát sổ sách', quality: 'Chất lượng tồn đầu kỳ', plan: 'Hiệu lực kế hoạch / định mức', supply: 'Lịch và nguồn cung' };
export type Confirmation = {
    by: string;
    at: string;
    reference: string;
    signature: string;
};
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
    reconciliation?: string;
    outsideOrders?: string[];
    checks?: Partial<Record<CheckKind, Confirmation>>;
};
export type Need = {
    id: string;
    material: string;
    qty: number;
    at: string;
    source: string;
    scope?: string;
};
export type Milestones = {
    eta: string;
    unloaded: string;
    received: string;
    quality: string;
};
export type Shipment = {
    id: string;
    material: string;
    qty: number;
    lotId?: string;
    readyAt: string;
    status: 'planned' | 'released' | 'unknown';
    source: string;
    includedQty?: number;
    openingReceipt?: string;
    openingCutoff?: string;
    forecast?: Milestones;
    actual?: Milestones;
    actualReference?: string;
    actualChecks?: Partial<Record<'ops' | 'qa' | 'supply', Confirmation>>;
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
    version?: number;
    executionId?: string;
};
export type Claim = {
    id: string;
    text: string;
    sources: string[];
    status: 'pending' | 'accepted' | 'edited' | 'rejected';
    reason?: string;
    original?: string;
    errorCode?: string;
};
export type Stage = {
    id: string;
    at: string;
    qty: number;
    sources: string[];
};
export type Carry = {
    qty: number;
    planId: string;
    owner: string;
    approval: string;
};
export type Proposal = {
    option: 'A' | 'B';
    qty: number;
    readyAt: string;
    demand: number;
    source: string;
    note: string;
    confirmed: boolean;
    stages?: Stage[];
    carry?: Carry;
    checks?: Partial<Record<Role, Confirmation>>;
    version?: number;
};
export type StageExecution = {
    id: string;
    qty: number;
    at: string;
    reference: string;
    checks?: Partial<Record<'ops' | 'workshop', Confirmation>>;
    confirmation?: Confirmation;
};
export type SourceExecution = {
    id: string;
    qty: number;
    milestones: Milestones;
    reference: string;
    checks: Partial<Record<Role, Confirmation>>;
};
export type Execution = {
    qty: number;
    at: string;
    quality: boolean;
    planExecuted: boolean;
    note: string;
    receiptId?: string;
    stages?: StageExecution[];
    sources?: SourceExecution[];
    checks?: Partial<Record<Role, Confirmation>>;
    carryConfirmed?: Confirmation;
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
    scope?: string;
    needIds?: string[];
    eventKey?: string;
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
    execution: Execution;
    history?: any[];
    reviewNote?: string;
    proposalChecked?: boolean;
    submission?: {
        version: number;
        at: string;
        checklist: Record<string, boolean>;
        evidenceIds: string[];
    };
    submissions?: any[];
    decisions?: {
        version: number;
        at: string;
        by: string;
        proposal: Proposal;
    }[];
    changeRequests?: {
        at: string;
        reason: string;
        fields: string[];
        priorVersion: number;
        blocked: string;
    }[];
    reviewLog?: any[];
    closeKind?: 'execution' | 'verification';
    closeReason?: string;
    ai?: any;
    aiCalls?: any[];
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
    schemaVersion?: number;
    aiConfig?: {
        status: string;
        model: string;
    };
    runSignature?: string;
    revision: number;
    inputVersion: number;
    inputs: Inputs;
    balances: Balance[];
    errors: string[];
    cases: Case[];
    events: Audit[];
    lastRun?: string;
    notices?: {
        id: string;
        at: string;
        by: string;
        note: string;
        assignee: string;
        due: string;
        errors: string[];
    }[];
    inputLog?: any[];
};
export class DomainError extends Error {
    status: number;
    constructor(message: string, status = 400) { super(message); this.status = status; }
}
const check = (ok: unknown, msg: string) => {
    if (!ok)
        throw new DomainError(msg);
};
const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
export const time = (v: string) => Date.parse(v.endsWith('Z') || /[+-]\d\d:\d\d$/.test(v) ? v : v + '+07:00');
const date = (v: unknown): v is string => typeof v === 'string' && Number.isFinite(time(v));
const stamp = () => new Date().toISOString();
const code = () => crypto.randomUUID();
function allowed(role: Role, list: Role[]) { check(list.includes(role), 'Vai trò mô phỏng hiện tại không được thực hiện thao tác này.'); }
function event(s: State, role: Role, action: string, detail: string, caseId?: string) { s.events.unshift({ id: code(), at: stamp(), role: roles[role], action, detail, caseId }); }
function stable(x: any): string { return JSON.stringify(x, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]])) : v); }
function plainInputs(i: Inputs) {
    const v = structuredClone(i);
    v.stocks.forEach(s => delete s.checks);
    v.shipments.forEach(s => delete s.actualChecks);
    for (const rows of [v.stocks, v.needs, v.shipments])
        rows.sort((a, b) => a.id.localeCompare(b.id));
    return v;
}
export function materialSignature(i: Inputs, material: string): string { const v = plainInputs(i); return stable({ cutoff: v.cutoff, planVersion: v.planVersion, stock: v.stocks.find(s => s.id === material), needs: v.needs.filter(n => n.material === material), shipments: v.shipments.filter(s => s.material === material) }); }
function confirmation(role: Role, reference: string, signature: string): Confirmation { check(typeof reference === 'string' && !!reference.trim(), 'Cần mã căn cứ xác nhận.'); return { by: roles[role], at: stamp(), reference: reference.trim().slice(0, 1000), signature }; }
export function scopeOf(n: Need) { return n.scope || n.at.slice(0, 7); }
export function sourceQty(s: Shipment) { return Math.max(0, s.qty - (s.includedQty || 0)); }
function ordered(m?: Milestones) { return !!m && [m.eta, m.unloaded, m.received, m.quality].every(date) && time(m.eta) <= time(m.unloaded) && time(m.unloaded) <= time(m.received) && time(m.received) <= time(m.quality); }
export function actualSignature(s: Shipment) { return stable({ qty: s.qty, actual: s.actual, reference: s.actualReference }); }
export function shipmentReleased(s: Shipment) { return s.status === 'released' && ordered(s.actual) && !!s.actualReference && ['ops', 'qa', 'supply'].every(r => s.actualChecks?.[r as 'ops' | 'qa' | 'supply']?.signature === actualSignature(s)) && date(s.readyAt) && time(s.actual!.quality) <= time(s.readyAt); }
export function supplyExplanation(i: Inputs, material: string, at: string) { return i.shipments.filter(s => s.material === material).map(s => ({ id: s.id, qty: s.qty, countedQty: sourceQty(s), reason: !sourceQty(s) ? 'Đã nằm trong tồn đầu kỳ; không cộng lại' : s.status === 'unknown' || !date(s.readyAt) ? 'Chưa rõ lịch; loại khỏi cả hai nguồn' : time(s.readyAt) > time(at) ? 'Sau mốc cần; loại khỏi mốc này' : shipmentReleased(s) ? 'Tính vào nguồn chắc chắn và kế hoạch' : 'Chỉ tính nguồn kế hoạch; chưa đủ bốn mốc thực tế và xác nhận' })); }
export function seed(): State {
    const inputs: Inputs = { cutoff: '2026-10-22T08:00', planVersion: 'KH-2026-10-v1', stocks: [{ id: 'KALI', name: 'Kali · KCl', qty: 150, held: 20, allocated: 30, reserve: 20, unit: 'tấn', source: 'KHO-2210 / KT-2210 / QC-008', confirmed: true }, { id: 'UREA', name: 'Urê', qty: 320, held: 0, allocated: 20, reserve: 40, unit: 'tấn', source: 'KHO-2210 / QC-009', confirmed: true }, { id: 'DAP', name: 'DAP', qty: 85, held: 5, allocated: 10, reserve: 15, unit: 'tấn', source: 'KHO-2210 / QC-010', confirmed: true }], needs: [{ id: 'LSX-0041', material: 'KALI', qty: 220, at: '2026-10-24T07:00', source: 'KH-2026-10-v1 / BOM-K01' }, { id: 'LSX-0042', material: 'UREA', qty: 180, at: '2026-10-24T07:00', source: 'KH-2026-10-v1 / BOM-U01' }, { id: 'LSX-0043', material: 'DAP', qty: 60, at: '2026-10-24T07:00', source: 'KH-2026-10-v1 / BOM-D01' }], shipments: [{ id: 'SHIP-90', material: 'KALI', qty: 90, readyAt: '2026-10-26T06:00', status: 'planned', source: 'KH-TM-014 · GIẢ LẬP', includedQty: 0, forecast: { eta: '2026-10-25T20:00', unloaded: '2026-10-25T23:00', received: '2026-10-26T02:00', quality: '2026-10-26T06:00' } }] };
    for (const stock of inputs.stocks) {
        stock.reconciliation = 'BB-LOAITRUNG-DEMO-' + stock.id;
        stock.outsideOrders = ['LSX-NGOAI-' + stock.id];
        stock.checks = {};
        for (const k of Object.keys(checkRoles) as CheckKind[])
            stock.checks[k] = confirmation(checkRoles[k], 'GIẢ LẬP · ' + checkLabels[k] + ' · ' + stock.source, materialSignature(inputs, stock.id));
    }
    for (const stock of inputs.stocks)
        for (const c of Object.values(stock.checks!))
            c!.signature = materialSignature(inputs, stock.id);
    return { schemaVersion: 2, revision: 0, inputVersion: 1, inputs, balances: [], errors: [], cases: [], events: [], notices: [], inputLog: [] };
}
// Old aggregate checkboxes cannot become specialist confirmations during migration.
export function upgrade(state: State): State {
    if (state.schemaVersion === 2)
        return state;
    const s = structuredClone(state);
    s.schemaVersion = 2;
    s.notices ||= [];
    s.inputLog ||= [];
    for (const c of s.cases) {
        c.scope ||= c.balance.at.slice(0, 7);
        c.needIds ||= c.snapshot.needs.filter(n => n.material === c.material && scopeOf(n) === c.scope).map(n => n.id);
        c.eventKey ||= `${c.material}|${c.scope}`;
        if (c.approvedAt && c.proposal && !c.decisions?.length)
            c.decisions = [{ version: c.approvedVersion || c.version, at: c.approvedAt, by: roles.ceo + ' · bản demo cũ', proposal: structuredClone(c.proposal) }];
        if (c.status === 'closed')
            c.closeKind ||= 'execution';
        if (c.status !== 'closed') {
            archive(c);
            (c.changeRequests ||= []).push({ at: stamp(), reason: 'Nâng mô hình Governance v2; xác nhận cũ chưa đáp ứng các chốt mới.', fields: ['schemaVersion'], priorVersion: c.version, blocked: 'Dừng phần thực hiện chưa hoàn tất; cần xác nhận và quyết định đúng phiên bản mới.' });
            c.version++;
            c.status = 'needs_review';
            c.approvedVersion = undefined;
            c.reviewNote = 'Nâng mô hình Governance: dữ liệu cũ được giữ; cần đối soát, xác nhận chuyên môn và lập lại phương án đúng phiên bản.';
        }
    }
    s.errors = validate(s.inputs);
    s.balances = [];
    return s;
}
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
            errors.push(`${s.id}: lượng loại trừ vượt tổng tồn.`);
        if (s.unit !== 'tấn')
            errors.push(`${s.id}: cần quy đổi đơn vị về tấn.`);
        if (!s.confirmed || !s.source?.trim())
            errors.push(`${s.id}: thiếu nguồn hoặc xác nhận tổng hợp.`);
        if (!s.reconciliation?.trim())
            errors.push(`${s.id}: thiếu biên bản đối soát loại trùng; tổng loại trừ không chứng minh không chồng lặp.`);
        if (s.allocated > 0 && (!s.outsideOrders?.length || s.outsideOrders.some(id => i.needs.some(n => n.material === s.id && n.id === id))))
            errors.push(`${s.id}: A0 cần danh sách lệnh ngoài phạm vi; không trừ hai lần cùng lệnh.`);
        for (const k of Object.keys(checkRoles) as CheckKind[])
            if (s.checks?.[k]?.signature !== materialSignature(i, s.id))
                errors.push(`${s.id}: chờ ${roles[checkRoles[k]]} xác nhận ${checkLabels[k]}.`);
    }
    const ids = new Set(i.stocks.map(s => s.id));
    for (const n of i.needs)
        if (!ids.has(n.material) || !num(n.qty) || !date(n.at) || time(n.at) < time(i.cutoff) || !n.source?.trim())
            errors.push(`${n.id}: sai mã, lượng, thời điểm hoặc thiếu kế hoạch / định mức.`);
    const lots = new Set<string>();
    for (const s of i.shipments) {
        const lot = s.lotId || s.id;
        if (lots.has(lot))
            errors.push(`${s.id}: trùng lô ${lot}.`);
        lots.add(lot);
        if (!ids.has(s.material) || !num(s.qty) || !num(s.includedQty || 0) || (s.includedQty || 0) > s.qty || !['planned', 'released', 'unknown'].includes(s.status) || !s.source?.trim())
            errors.push(`${s.id}: thông tin chuyến hàng không hợp lệ.`);
        if ((s.includedQty || 0) > 0 && (!s.openingReceipt?.trim() || s.openingCutoff !== i.cutoff))
            errors.push(`${s.id}: phần đã nằm trong tồn cần chứng từ nhập và đúng kỳ chốt.`);
        if (s.status !== 'unknown' && !date(s.readyAt))
            errors.push(`${s.id}: thiếu lịch; hãy chuyển Chưa rõ lịch để tính bảo thủ, giữ nguyên lượng.`);
        if (s.status === 'planned' && sourceQty(s) > 0 && (!ordered(s.forecast) || !date(s.readyAt) || time(s.forecast!.quality) > time(s.readyAt)))
            errors.push(`${s.id}: lịch dự kiến cần đủ bốn mốc theo thứ tự; sẵn sàng không được trước mốc QA dự kiến.`);
        if (s.status === 'released' && !shipmentReleased(s))
            errors.push(`${s.id}: trạng thái sẵn sàng cần đủ ETA, bốc dỡ, tiếp nhận, QA thực tế và xác nhận Kho vận/QA/KH-TM.`);
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
        for (const at of [...new Set(needs.map(n => n.at))].sort((a, b) => time(a) - time(b))) {
            const ns = needs.filter(n => time(n.at) <= time(at));
            const ships = i.shipments.filter(x => x.material === s.id && x.status !== 'unknown' && date(x.readyAt) && time(x.readyAt) <= time(at));
            const available = s.qty - s.held - s.allocated, demand = ns.reduce((a, n) => a + n.qty, 0), incoming = ships.reduce((a, n) => a + sourceQty(n), 0);
            const firm = available + ships.filter(shipmentReleased).reduce((a, n) => a + sourceQty(n), 0) - demand, planned = available + incoming - demand;
            rows.push({ material: s.id, name: s.name, at, available, incoming, demand, reserve: s.reserve, firm, planned, level: firm < 0 ? 2 : firm < s.reserve ? 1 : 0, sources: [s.source, ...ns.map(n => n.source), ...ships.map(n => n.source)] });
        }
    }
    return { errors, rows };
}
export function defaultB(c: Case): Proposal {
    const ship = c.snapshot.shipments.find(s => s.material === c.material && s.status !== 'unknown' && sourceQty(s) > 0);
    const total = scopedNeeds(c).reduce((a, n) => a + n.qty, 0), first = Math.min(total, Math.max(0, c.balance.available - c.balance.reserve)), second = Math.min(Math.max(0, total - first), ship ? sourceQty(ship) : 0);
    return { option: 'B', qty: 0, demand: first + second, readyAt: ship?.readyAt || c.due, source: 'KH-DIEUCHINH-DEMO-01', note: 'GIẢ LẬP · tách đợt; đợt sau phụ thuộc nguồn thực tế.', confirmed: false, stages: [{ id: 'DOT-1', at: c.due, qty: first, sources: ['OPENING'] }, { id: 'DOT-2', at: ship?.readyAt || c.due, qty: second, sources: ship ? [ship.id] : [] }], carry: { qty: total - first - second, planId: 'KH-KYSAU-DEMO', owner: 'Phân xưởng · demo', approval: 'PD-CHUYENKY-DEMO' } };
}
function scopedNeeds(c: Case) { return c.snapshot.needs.filter(n => n.material === c.material && (c.needIds ? c.needIds.includes(n.id) : scopeOf(n) === (c.scope || c.due.slice(0, 7)))); }
function aTimeline(c: Case, qty: number, readyAt: string) {
    const stock = c.snapshot.stocks.find(s => s.id === c.material)!;
    const scoped = scopedNeeds(c);
    const horizon = Math.max(...scoped.filter(n => date(n.at)).map(n => time(n.at)));
    const needs = c.snapshot.needs.filter(n => n.material === c.material && date(n.at) && time(n.at) > time(c.snapshot.cutoff) && time(n.at) <= horizon);
    const times = [...new Set(needs.map(n => n.at))].sort((a, b) => time(a) - time(b));
    return times.map(at => {
        const demand = needs.filter(n => time(n.at) <= time(at)).reduce((sum, n) => sum + n.qty, 0);
        const incoming = c.snapshot.shipments.filter(sh => sh.material === c.material && shipmentReleased(sh) && time(sh.readyAt) <= time(at)).reduce((sum, sh) => sum + sourceQty(sh), 0);
        const firm = stock.qty - stock.held - stock.allocated + incoming - demand;
        return { at, demand, firm, remaining: firm + (date(readyAt) && time(readyAt) <= time(at) ? qty : 0), dependencies: [] as string[] };
    });
}
export function requiredA(c: Case) {
    const reserve = c.snapshot.stocks.find(s => s.id === c.material)?.reserve || 0;
    return Math.max(0, ...aTimeline(c, 0, c.balance.at).map(row => reserve - row.firm));
}
export function proposalBalance(c: Case, p: Proposal) {
    const i = c.snapshot, b = c.balance, stock = i.stocks.find(s => s.id === c.material)!;
    check(['A', 'B'].includes(p.option), 'Phương án không hợp lệ.');
    check(num(p.qty) && num(p.demand) && date(p.readyAt), 'Lượng hoặc lịch phương án không hợp lệ.');
    if (p.option === 'A') {
        const rows = aTimeline(c, p.qty, p.readyAt);
        const total = scopedNeeds(c).reduce((sum, n) => sum + n.qty, 0);
        return { remaining: rows.at(-1)?.remaining ?? b.available, reserve: stock.reserve, need: total, valid: rows.length > 0 && time(p.readyAt) >= time(i.cutoff) && rows.every(row => row.remaining >= stock.reserve), rows, conditional: false };
    }
    const stages = p.stages || [];
    const scoped = scopedNeeds(c), scopedIds = new Set(scoped.map(n => n.id));
    const total = scoped.reduce((a, n) => a + n.qty, 0);
    let valid = stages.length > 0 && stages.length <= 30 && !!p.carry && num(p.carry.qty) && !!p.carry.planId?.trim() && !!p.carry.owner?.trim() && !!p.carry.approval?.trim() && Math.abs(stages.reduce((a, n) => a + n.qty, 0) + (p.carry?.qty || 0) - total) < 1e-7;
    const stageIds = new Set<string>();
    for (const d of stages) {
        if (!d.id || stageIds.has(d.id) || !num(d.qty) || !date(d.at) || time(d.at) < time(i.cutoff) || !Array.isArray(d.sources) || !d.sources.length || d.sources.some(id => id !== 'OPENING' && !i.shipments.some(s => s.id === id && s.material === c.material)))
            valid = false;
        stageIds.add(d.id);
    }
    const horizon = Math.max(...stages.filter(d => date(d.at)).map(d => time(d.at)));
    const other = i.needs.filter(n => n.material === c.material && !scopedIds.has(n.id) && time(n.at) <= horizon);
    const times = [...new Set([...stages.map(d => d.at), ...other.map(n => n.at)])].filter(date).sort((a, b) => time(a) - time(b));
    const rows = times.map(at => { const done = stages.filter(d => date(d.at) && time(d.at) <= time(at)); const usedIds = new Set(done.flatMap(d => d.sources || [])); const ships = i.shipments.filter(s => s.material === c.material && usedIds.has(s.id) && s.status !== 'unknown' && date(s.readyAt) && time(s.readyAt) <= time(at)); const demand = done.reduce((a, d) => a + d.qty, 0) + other.filter(n => time(n.at) <= time(at)).reduce((a, n) => a + n.qty, 0); const remaining = b.available + ships.reduce((a, s) => a + sourceQty(s), 0) - demand; const firm = b.available + ships.filter(shipmentReleased).reduce((a, s) => a + sourceQty(s), 0) - demand; const dependencies = ships.filter(s => !shipmentReleased(s)).map(s => s.id); return { at, demand, remaining, firm, dependencies }; });
    for (const d of stages)
        for (const id of d.sources || []) {
            if (id === 'OPENING')
                continue;
            const sh = i.shipments.find(s => s.id === id);
            if (!sh || sh.status === 'unknown' || !date(sh.readyAt) || !date(d.at) || time(sh.readyAt) > time(d.at))
                valid = false;
        }
    valid = valid && rows.every(r => r.remaining >= stock.reserve);
    return { remaining: rows.at(-1)?.remaining ?? b.available, reserve: stock.reserve, need: total, valid, rows, conditional: rows.some(r => r.dependencies.length > 0) };
}
export function currentEvidence(c: Case, kind: string, executionId?: string) { return c.evidence.some(e => e.kind === kind && e.version === c.version && (executionId === undefined || e.executionId === executionId)); }
function currentRevisedPlan(c: Case) { return !!c.proposal && currentEvidence(c, 'revised_plan', c.proposal.source) && !!c.decisions?.some(d => d.version === c.version && d.proposal.source === c.proposal?.source); }
function caseSignature(c: Case, i: Inputs) {
    const v = plainInputs(i), horizon = Math.max(time(c.balance.at), ...(c.proposal?.stages || []).map(x => time(x.at)), ...c.snapshot.needs.filter(n => n.material === c.material && scopeOf(n) === c.scope).map(n => time(n.at)));
    return stable({ cutoff: v.cutoff, planVersion: v.planVersion, stock: v.stocks.find(x => x.id === c.material), needs: v.needs.filter(n => n.material === c.material && (c.needIds?.includes(n.id) || scopeOf(n) === (c.scope || c.due.slice(0, 7)) || time(n.at) <= horizon)), shipments: v.shipments.filter(x => x.material === c.material) });
}
export function caseCurrent(c: Case, s: State) { return caseSignature(c, c.snapshot) === caseSignature(c, s.inputs); }
export function submissionChecklist(c: Case, s: State) { return { data: caseCurrent(c, s) && !validate(c.snapshot).length, evidence: ['inventory', 'quality', 'plan'].every(k => currentEvidence(c, k)), claims: c.claims.length > 0 && c.claims.every(x => x.status !== 'pending') && c.claims.some(x => ['accepted', 'edited'].includes(x.status)), proposal: !!c.proposal?.confirmed && c.proposal.version === c.version }; }
export function submissionMetrics(s: State) {
    const versions = new Map<string, NonNullable<Case['submission']>>();
    for (const c of s.cases)
        for (const submission of [...(c.submissions || []), ...(c.submission ? [c.submission] : [])])
            versions.set(`${c.id}:v${submission.version}`, submission);
    const submitted = [...versions.values()];
    return { submitted: submitted.length, evidenceComplete: submitted.filter(x => Object.values(x.checklist).every(Boolean)).length };
}
function archive(c: Case) { const { history, ...previous } = structuredClone(c); c.history = [...(history || []), previous]; }
function receiptSignature(c: Case) { return stable({ version: c.version, id: c.execution.receiptId, qty: c.execution.qty, at: c.execution.at }); }
function sourceSignature(x: SourceExecution) { return stable({ id: x.id, qty: x.qty, milestones: x.milestones, reference: x.reference }); }
function stageSignature(x: StageExecution, c: Case) { return stable({ version: c.version, id: x.id, qty: x.qty, at: x.at, reference: x.reference, sources: (c.execution.sources || []).filter(s => c.proposal?.stages?.find(st => st.id === x.id)?.sources.includes(s.id)) }); }
function sourceReady(c: Case, id: string, at: string) {
    const x = c.execution.sources?.find(x => x.id === id);
    const sh = c.snapshot.shipments.find(x => x.id === id);
    if (sh && shipmentReleased(sh))
        return time(sh.actual!.quality) <= time(at);
    return !!x && !!sh && x.qty >= sourceQty(sh) && ordered(x.milestones) && time(x.milestones.quality) <= time(at) && ['ops', 'qa', 'supply'].every(r => x.checks[r as Role]?.signature === sourceSignature(x));
}
function executionBalance(c: Case) {
    if (c.proposal?.option !== 'B')
        return true;
    const copy = structuredClone(c);
    for (const sh of copy.snapshot.shipments) {
        const ex = copy.execution.sources?.find(x => x.id === sh.id);
        if (ex && ordered(ex.milestones))
            sh.readyAt = ex.milestones.quality;
    }
    const p = structuredClone(copy.proposal!);
    p.stages = p.stages?.map(st => ({ ...st, at: c.execution.stages?.find(x => x.id === st.id)?.at || st.at }));
    try {
        return proposalBalance(copy, p).valid;
    }
    catch {
        return false;
    }
}
export function closureIssues(c: Case): string[] {
    const errors: string[] = [];
    const p = c.proposal;
    if (c.status !== 'executing' || c.approvedVersion !== c.version || !p)
        return ['Chưa có quyết định hợp lệ cho phiên bản hiện tại.'];
    if (p.option === 'A') {
        if (c.execution.qty < p.qty)
            errors.push('Chưa nhận đủ lượng.');
        if (!date(c.execution.at) || time(c.execution.at) > time(c.balance.at))
            errors.push('Thực nhận không kịp mốc cần.');
        if (!c.execution.receiptId)
            errors.push('Thiếu mã lần nhận hàng.');
        for (const r of ['ops', 'accounting', 'qa'] as Role[])
            if (c.execution.checks?.[r]?.signature !== receiptSignature(c))
                errors.push(`Chờ ${roles[r]} xác nhận đúng lần nhận.`);
        if (!['order', 'receipt', 'release'].every(k => currentEvidence(c, k, c.execution.receiptId)))
            errors.push('Thiếu chứng từ đúng phiên bản và lần nhận (lệnh, nhận, QA).');
        if (date(c.execution.at) && aTimeline(c, c.execution.qty, c.execution.at).some(row => row.remaining < c.snapshot.stocks.find(st => st.id === c.material)!.reserve))
            errors.push('Thực nhận chưa cân đối đủ mọi mốc nhu cầu trong phạm vi hồ sơ.');
    }
    else {
        if (!executionBalance(c))
            errors.push('Thực hiện không cân đối tại mọi mốc lũy kế.');
        if (!currentRevisedPlan(c))
            errors.push('Thiếu kế hoạch điều chỉnh đúng phiên bản, mã kế hoạch.');
        for (const st of p.stages || []) {
            const ex = c.execution.stages?.find(x => x.id === st.id);
            if (!ex || ex.qty !== st.qty || !date(ex.at) || time(ex.at) > time(st.at) || !(['ops', 'workshop'] as const).every(r => ex.checks?.[r]?.signature === stageSignature(ex, c)))
                errors.push(`${st.id}: chưa đủ lượng, đúng hạn và xác nhận Kho vận / Phân xưởng.`);
            if (!currentEvidence(c, 'execution', st.id))
                errors.push(`${st.id}: thiếu chứng từ thực hiện đúng phiên bản/đợt.`);
            for (const id of st.sources.filter(x => x !== 'OPENING'))
                if (!ex || !date(ex.at) || !sourceReady(c, id, ex.at))
                    errors.push(`${st.id}: ${id} chưa thực sự sẵn sàng.`);
        }
        if (p.carry?.qty && (!currentEvidence(c, 'carry_plan', p.carry.planId) || c.execution.carryConfirmed?.signature !== stable({ version: c.version, carry: p.carry })))
            errors.push('Phần chuyển kỳ chưa có liên kết xử lý được Giám đốc xác nhận đúng phiên bản.');
    }
    return errors;
}
export function transition(original: State, role: Role, action: string, p: any): State {
    check(Object.hasOwn(roles, role), 'Vai trò không hợp lệ.');
    const s = structuredClone(upgrade(original));
    if (action === 'reset') {
        allowed(role, ['ops']);
        const fresh = seed();
        fresh.revision = s.revision;
        event(fresh, role, 'Đặt lại demo', 'Khởi tạo dữ liệu và xác nhận GIẢ LẬP.');
        return fresh;
    }
    if (action === 'save_inputs') {
        allowed(role, ['ops']);
        check(p.inputs?.stocks?.length <= 100 && p.inputs?.needs?.length <= 500 && p.inputs?.shipments?.length <= 500, 'Bộ dữ liệu quá lớn hoặc sai cấu trúc.');
        const next: Inputs = structuredClone(p.inputs);
        for (const sh of next.shipments) {
            if (sh.status === 'planned' && !sh.readyAt)
                sh.status = 'unknown';
            const old = s.inputs.shipments.find(x => x.id === sh.id);
            sh.actualChecks = old && actualSignature(old) === actualSignature(sh) ? old.actualChecks : {};
        }
        if (stable(plainInputs(next)) === stable(plainInputs(s.inputs)))
            return s;
        check(p.reason?.trim(), 'Cần lý do thay đổi dữ liệu.');
        const before = structuredClone(s.inputs);
        const affected = [...new Set([...before.stocks.map(x => x.id), ...next.stocks.map(x => x.id)])].filter(id => materialSignature(before, id) !== materialSignature(next, id));
        for (const st of next.stocks)
            st.checks = affected.includes(st.id) ? {} : before.stocks.find(x => x.id === st.id)?.checks || {};
        s.inputs = next;
        s.inputVersion++;
        s.errors = validate(next);
        s.balances = s.balances.filter(x => !affected.includes(x.material));
        const fields = changedFields(plainInputs(before), plainInputs(next));
        (s.inputLog ||= []).push({ at: stamp(), by: roles[role], reason: p.reason, fields, before, after: structuredClone(next), inputVersion: s.inputVersion });
        for (const c of s.cases.filter(x => x.status !== 'closed' && affected.includes(x.material) && !caseCurrent(x, s))) {
            const priorVersion = c.version;
            archive(c);
            (c.changeRequests ||= []).push({ at: stamp(), reason: p.reason, fields, priorVersion, blocked: 'Dừng toàn bộ phần chưa thực hiện của hồ sơ này; phương án mới chờ quyết định mới.' });
            c.version++;
            c.status = 'needs_review';
            c.approvedVersion = undefined;
            c.submittedAt = undefined;
            c.submission = undefined;
            c.claims = [];
            c.proposalChecked = false;
            if (c.proposal)
                c.proposal.confirmed = false;
            c.reviewNote = 'Dữ liệu liên quan thay đổi; dừng thực hiện chưa hoàn tất, chạy và xác minh lại. Quyết định cũ lưu trong lịch sử.';
        }
        event(s, role, 'Cập nhật dữ liệu', `v${s.inputVersion}; ảnh hưởng ${affected.join(', ')}; lý do ${p.reason}; trường ${fields.join(', ')}`);
        return s;
    }
    if (action === 'confirm_input') {
        const st = s.inputs.stocks.find(x => x.id === p.material);
        check(st, 'Không có nguyên liệu.');
        const k = p.kind as CheckKind;
        check(Object.hasOwn(checkRoles, k), 'Loại xác nhận không hợp lệ.');
        allowed(role, [checkRoles[k]]);
        st!.checks ||= {};
        st!.checks[k] = confirmation(role, p.reference, materialSignature(s.inputs, p.material));
        s.errors = validate(s.inputs);
        event(s, role, 'Xác nhận đầu vào', `${p.material}: ${checkLabels[k]} · ${p.reference}`);
        return s;
    }
    if (action === 'confirm_input_shipment') {
        allowed(role, ['ops', 'qa', 'supply']);
        const sh = s.inputs.shipments.find(x => x.id === p.shipmentId);
        check(sh && ordered(sh.actual) && sh.actualReference, 'Cần bốn mốc thực tế và chứng từ chuyến.');
        sh!.actualChecks ||= {};
        sh!.actualChecks[role as 'ops' | 'qa' | 'supply'] = confirmation(role, p.reference, actualSignature(sh!));
        s.errors = validate(s.inputs);
        event(s, role, 'Xác nhận chuyến đầu vào', `${sh!.id} · ${p.reference}`);
        return s;
    }
    if (action === 'risk_notice') {
        allowed(role, ['ops']);
        check(s.errors.length, 'Chỉ lập thông báo có điều kiện khi DATA_HOLD.');
        check(p.note?.trim() && p.assignee?.trim() && date(p.due), 'Cần nội dung, người phụ trách, hạn xác minh.');
        (s.notices ||= []).push({ id: code(), at: stamp(), by: roles[role], note: p.note, assignee: p.assignee, due: p.due, errors: [...s.errors] });
        event(s, role, 'Thông báo rủi ro có điều kiện', `${p.note}; giao ${p.assignee}; hạn ${p.due}. Chưa phát hành kết luận định lượng.`);
        return s;
    }
    if (action === 'run') {
        allowed(role, ['ops']);
        const calc = calculate(s.inputs);
        s.errors = calc.errors;
        s.balances = calc.rows;
        s.lastRun = stamp();
        s.runSignature = calc.errors.length ? undefined : stable(plainInputs(s.inputs));
        if (s.errors.length) {
            event(s, role, 'DATA_HOLD', s.errors.join(' '));
            return s;
        }
        const groups = new Map<string, Need[]>();
        for (const n of s.inputs.needs) {
            const key = `${n.material}|${scopeOf(n)}`;
            groups.set(key, [...(groups.get(key) || []), n]);
        }
        for (const [key, needs] of groups) {
            const material = needs[0].material, scope = scopeOf(needs[0]);
            const times = new Set(needs.map(n => n.at));
            const balances = s.balances.filter(b => b.material === material && times.has(b.at));
            const b = balances.find(b => b.level !== 0);
            let c = s.cases.find(c => (c.eventKey || `${c.material}|${c.scope || c.due.slice(0, 7)}`) === key && c.status !== 'closed');
            if (!c && s.cases.some(c => c.eventKey === key && c.status === 'closed' && caseCurrent(c, s)))
                continue;
            if (!b) {
                if (c) {
                    c.status = 'needs_review';
                    c.reviewNote = 'Cân đối mới đã đủ. Có thể kết thúc theo xác minh với căn cứ và Giám đốc xác nhận.';
                }
                continue;
            }
            if (!c) {
                c = { id: `EX-${String(41 + s.cases.length).padStart(4, '0')}`, version: 1, material, name: b.name, status: 'draft', scope, needIds: needs.map(n => n.id), eventKey: key, balance: b, snapshot: structuredClone(s.inputs), snapshotVersion: s.inputVersion, createdAt: stamp(), due: b.at, claims: [], narrativeMode: '', proposal: null, evidence: [], execution: { qty: 0, at: '', quality: false, planExecuted: false, note: '' } };
                s.cases.push(c);
                event(s, role, 'Mở hồ sơ', `${key}; ${b.firm} tấn.`, c.id);
            }
            else if (!caseCurrent(c, s)) {
                c.balance = b;
                c.snapshot = structuredClone(s.inputs);
                c.snapshotVersion = s.inputVersion;
                c.needIds = needs.map(n => n.id);
                c.due = b.at;
                c.status = 'draft';
                c.claims = [];
                c.proposal = null;
                c.execution = { qty: 0, at: '', quality: false, planExecuted: false, note: '' };
                c.reviewNote = undefined;
            }
        }
        event(s, role, 'Chạy cân đối', `${calc.rows.length} mốc cân đối; hồ sơ theo nguyên liệu và phạm vi kế hoạch.`);
        return s;
    }
    const c = s.cases.find(c => c.id === p.caseId);
    check(c, 'Không tìm thấy hồ sơ.');
    if (!c)
        throw new DomainError('Không tìm thấy hồ sơ.', 404);
    check(c.status !== 'closed', 'Hồ sơ đã đóng.');
    if (['needs_info', 'rejected'].includes(c.status) && ['narrative', 'review_claim', 'proposal', 'evidence'].includes(action)) {
        archive(c);
        c.version++;
        c.status = 'draft';
        c.submittedAt = undefined;
        c.submission = undefined;
        c.approvedVersion = undefined;
        c.claims.forEach(x => x.status = 'pending');
        if (c.proposal) {
            c.proposal.confirmed = false;
            c.proposal.checks = {};
            c.proposal.version = c.version;
        }
    }
    const editable = () => check(['draft', 'needs_review', 'needs_info', 'rejected'].includes(c.status), 'Cần trả hồ sơ về trước khi thay nội dung.');
    if (action === 'narrative') {
        allowed(role, ['ops']);
        editable();
        const b = c.balance;
        c.narrativeMode = 'template';
        c.claims = [{ id: 'C1', text: `Tồn dùng được ${b.available} tấn; nhu cầu lũy kế ${b.demand} tấn. Số dư chắc chắn ${b.firm} tấn.`, sources: b.sources, status: 'pending' }, { id: 'C2', text: `Số dư kế hoạch ${b.planned} tấn. Nguồn dự kiến chưa phải nguồn thực tế; chuyến trễ/chưa rõ lịch không cộng trước hạn.`, sources: c.snapshot.shipments.filter(x => x.material === c.material).map(x => x.source), status: 'pending' }, { id: 'C3', text: c.proposal?.option === 'B' ? `Phương án B tách ${c.proposal.stages?.length} đợt đáp ứng ${c.proposal.stages?.reduce((a, x) => a + x.qty, 0)} tấn; chuyển ${c.proposal.carry?.qty} tấn sang ${c.proposal.carry?.planId}. Các đợt phụ thuộc nguồn phải xác minh thực tế trước thực hiện.` : `Cần bổ sung ${Math.max(0, b.reserve - b.firm)} tấn theo nguồn chắc chắn để giữ dự trữ ${b.reserve} tấn, hoặc lập kế hoạch tách đợt có điều kiện. Chưa xếp hạng kinh tế.`, sources: [c.snapshot.planVersion, ...(c.proposal ? [c.proposal.source] : [])], status: 'pending' }];
        event(s, role, 'Soạn nhận định', 'Mẫu từ số khóa; chờ kiểm tra.', c.id);
    }
    else if (action === 'review_claim') {
        allowed(role, ['ops']);
        editable();
        const x = c.claims.find(x => x.id === p.claimId);
        check(x, 'Không có nhận định.');
        check(['accepted', 'edited', 'rejected'].includes(p.status), 'Kết quả không hợp lệ.');
        if (p.status !== 'accepted') {
            check(p.reason?.trim(), 'Cần lý do sửa/bác bỏ.');
            check(['DATA', 'RULE', 'LLM', 'FLOW'].includes(p.errorCode), 'Cần mã lỗi DATA/RULE/LLM/FLOW.');
        }
        const before = x!.text;
        if (p.status === 'edited') {
            check(p.text?.trim(), 'Nội dung trống.');
            x!.original = before;
            x!.text = String(p.text).slice(0, 4000);
        }
        x!.status = p.status;
        x!.reason = p.reason;
        x!.errorCode = p.errorCode;
        (c.reviewLog ||= []).push({ at: stamp(), by: roles[role], version: c.version, claimId: x!.id, before, after: x!.text, status: p.status, reason: p.reason || 'Đã đối chiếu', errorCode: p.errorCode || null });
        event(s, role, 'Kiểm tra nhận định', `${x!.id} · ${p.status} · ${p.errorCode || ''} · ${p.reason || 'Đã đối chiếu'}`, c.id);
    }
    else if (action === 'proposal') {
        allowed(role, ['ops']);
        editable();
        check(p.proposal?.source?.trim(), 'Cần căn cứ phương án.');
        check(proposalBalance(c, p.proposal).valid, 'Phương án không cân đối tại mọi mốc, thiếu nguồn hoặc phần chuyển kỳ.');
        c.proposal = { ...p.proposal, confirmed: false, checks: {}, version: c.version };
        if (c.proposal!.option === 'A')
            c.proposal!.demand = scopedNeeds(c).reduce((sum, n) => sum + n.qty, 0);
        else {
            c.proposal!.demand = c.proposal!.stages!.reduce((a, x) => a + x.qty, 0);
            c.proposal!.readyAt = [...c.proposal!.stages!].sort((a, b) => time(b.at) - time(a.at))[0].at;
        }
        c.claims.forEach(x => x.status = 'pending');
        event(s, role, 'Lưu phương án', `${p.proposal.option}; cần kiểm tra lại nhận định và xác nhận chuyên môn.`, c.id);
    }
    else if (action === 'confirm_proposal') {
        editable();
        check(c.proposal, 'Chưa có phương án.');
        const req: Role[] = c.proposal!.option === 'A' ? ['supply'] : ['workshop', ...(c.proposal!.stages?.some(x => x.sources.some(id => id !== 'OPENING')) ? ['supply' as Role] : [])];
        allowed(role, req);
        c.proposal!.checks ||= {};
        c.proposal!.checks[role] = confirmation(role, p.reference || c.proposal!.source, stable({ version: c.version, proposal: { ...c.proposal, checks: undefined, confirmed: undefined } }));
        c.proposal!.confirmed = req.every(r => !!c.proposal!.checks?.[r]);
        c.proposalChecked = c.proposal!.confirmed;
        event(s, role, 'Xác minh phương án', `${c.proposal!.option}; ${c.proposal!.confirmed ? 'đủ bộ phận' : 'chờ bộ phận còn lại'}`, c.id);
    }
    else if (action === 'evidence' || action === 'reuse_evidence') {
        allowed(role, ['ops', 'qa', 'supply', 'accounting', 'workshop', 'director']);
        if (action === 'reuse_evidence') {
            const old = c.evidence.find(x => x.id === p.evidenceId);
            check(old && p.reason?.trim(), 'Chọn chứng từ cũ và ghi căn cứ còn áp dụng.');
            if (old!.kind === 'release')
                allowed(role, ['qa']);
            if (old!.kind === 'supply')
                allowed(role, ['supply']);
            if (['revised_plan', 'execution'].includes(old!.kind))
                allowed(role, ['workshop']);
            c.evidence.push({ ...old!, id: code(), version: c.version, by: roles[role], at: stamp(), reference: old!.reference + ' · xác nhận dùng lại: ' + p.reason });
        }
        else {
            check(p.reference?.trim(), 'Cần mã chứng từ.');
            check(['inventory', 'quality', 'plan', 'supply', 'order', 'receipt', 'release', 'execution', 'revised_plan', 'carry_plan', 'verification'].includes(p.kind), 'Loại chứng từ không hợp lệ.');
            if (p.kind === 'release')
                allowed(role, ['qa']);
            if (p.kind === 'supply')
                allowed(role, ['supply']);
            if (['revised_plan', 'execution'].includes(p.kind))
                allowed(role, ['workshop']);
            c.evidence.push({ id: code(), kind: p.kind, reference: String(p.reference).slice(0, 1000), filename: p.filename, key: p.key, by: roles[role], at: stamp(), version: Number.isInteger(p.version) && p.version > 0 ? p.version : c.version, executionId: p.executionId || undefined });
        }
        event(s, role, 'Thêm / xác nhận bằng chứng', `${p.kind || 'dùng lại'} · v${c.version}`, c.id);
    }
    else if (action === 'submit') {
        allowed(role, ['ops']);
        editable();
        const list = submissionChecklist(c, s);
        check(Object.values(list).every(Boolean), 'Chưa đủ: ' + Object.entries(list).filter(([, v]) => !v).map(([k]) => ({ data: 'dữ liệu/xác nhận đầu vào', evidence: 'bằng chứng đúng phiên bản', claims: 'kiểm tra từng nhận định', proposal: 'xác minh chuyên môn phương án' }[k])).join(', '));
        c.status = 'director_review';
        c.submittedAt = stamp();
        c.submission = { version: c.version, at: c.submittedAt, checklist: list, evidenceIds: c.evidence.filter(e => e.version === c.version).map(e => e.id) };
        (c.submissions ||= []).push(structuredClone(c.submission));
        event(s, role, 'Trình hồ sơ', `v${c.version}; đã chụp checklist tại thời điểm trình.`, c.id);
    }
    else if (action === 'forward' || action === 'approve') {
        allowed(role, [action === 'forward' ? 'director' : 'ceo']);
        check(c.status === (action === 'forward' ? 'director_review' : 'ceo_review'), 'Hồ sơ không chờ đúng bước.');
        check(caseCurrent(c, s) && Object.values(submissionChecklist(c, s)).every(Boolean), 'Quyết định không còn phù hợp dữ liệu / xác nhận hiện tại.');
        if (action === 'forward')
            c.status = 'ceo_review';
        else {
            c.status = 'executing';
            c.approvedAt = stamp();
            c.approvedVersion = c.version;
            (c.decisions ||= []).push({ version: c.version, at: c.approvedAt, by: roles[role], proposal: structuredClone(c.proposal!) });
        }
        event(s, role, action === 'forward' ? 'Trình Tổng Giám đốc' : 'Phê duyệt', `v${c.version}`, c.id);
    }
    else if (action === 'return' || action === 'reject') {
        allowed(role, ['director', 'ceo']);
        check((role === 'director' && c.status === 'director_review') || (role === 'ceo' && c.status === 'ceo_review'), 'Hồ sơ không chờ vai trò này.');
        check(p.note?.trim(), 'Cần lý do.');
        c.status = action === 'return' ? 'needs_info' : 'rejected';
        c.reviewNote = p.note;
        if (c.proposal) {
            c.proposal.confirmed = false;
            c.proposal.checks = {};
        }
        event(s, role, action === 'return' ? 'Yêu cầu bổ sung' : 'Từ chối', p.note, c.id);
    }
    else if (action === 'close_verified') {
        allowed(role, ['director']);
        const calc = calculate(s.inputs);
        check(!calc.errors.length && s.runSignature === stable(plainInputs(s.inputs)) && s.balances.length > 0, 'Phải chạy cân đối mới hợp lệ.');
        const rows = calc.rows.filter(x => x.material === c.material && (c.needIds || []).some(id => s.inputs.needs.some(n => n.id === id && n.at === x.at)));
        check(rows.length && rows.every(x => x.level === 0), 'Ngoại lệ chưa được xác minh là đã hết.');
        check(p.reason?.trim() && currentEvidence(c, 'verification'), 'Cần lý do và căn cứ xác minh đúng phiên bản.');
        c.snapshot = structuredClone(s.inputs);
        c.snapshotVersion = s.inputVersion;
        c.balance = rows[0];
        c.closeKind = 'verification';
        c.closeReason = p.reason;
        c.closedAt = stamp();
        c.status = 'closed';
        event(s, role, 'Kết thúc theo xác minh', p.reason, c.id);
    }
    else if (['execution', 'release', 'confirm_receipt', 'source_actual', 'confirm_source', 'stage_execution', 'confirm_stage', 'confirm_carry', 'close'].includes(action)) {
        check(c.status === 'executing' && c.approvedVersion === c.version && caseCurrent(c, s), 'Chưa có quyết định hợp lệ; phần thực thi phải chờ xem xét thay đổi.');
        if (action === 'execution') {
            allowed(role, ['ops', 'supply']);
            check(c.proposal?.option === 'A', 'B phải cập nhật từng đợt.');
            check(num(p.execution?.qty) && date(p.execution?.at) && p.execution?.receiptId?.trim(), 'Cần lượng, thời điểm và mã lần nhận hàng.');
            const previous = receiptSignature(c);
            c.execution = { ...c.execution, qty: p.execution.qty, at: p.execution.at, receiptId: p.execution.receiptId, note: String(p.execution.note || '').slice(0, 2000), planExecuted: false };
            if (previous !== receiptSignature(c)) {
                c.execution.quality = false;
                c.execution.checks = {};
            }
        }
        else if (action === 'release' || action === 'confirm_receipt') {
            allowed(role, action === 'release' ? ['qa'] : ['ops', 'accounting']);
            check(c.proposal?.option === 'A' && !!c.execution.receiptId, 'Cần lưu lần nhận phương án A.');
            check(currentEvidence(c, role === 'qa' ? 'release' : 'receipt', c.execution.receiptId), 'Cần chứng từ đúng phiên bản/lần nhận.');
            (c.execution.checks ||= {})[role] = confirmation(role, p.reference || c.execution.receiptId!, receiptSignature(c));
            c.execution.quality = !!c.execution.checks.qa;
        }
        else if (action === 'source_actual') {
            allowed(role, ['ops', 'supply']);
            check(c.proposal?.option === 'B', 'Chỉ áp dụng nguồn phụ thuộc B.');
            const x = p.source as SourceExecution;
            check(c.proposal!.stages?.some(st => st.sources.includes(x?.id)) && num(x?.qty) && ordered(x?.milestones) && x.reference?.trim(), 'Nguồn cần bốn mốc thực tế theo thứ tự, lượng và chứng từ.');
            c.execution.sources = (c.execution.sources || []).filter(s => s.id !== x.id);
            c.execution.sources.push({ ...x, checks: {} });
        }
        else if (action === 'confirm_source') {
            allowed(role, ['ops', 'qa', 'supply']);
            const x = c.execution.sources?.find(x => x.id === p.shipmentId);
            check(x && ordered(x.milestones), 'Chưa lưu bốn mốc nguồn thực tế.');
            x!.checks[role] = confirmation(role, p.reference || x!.reference, sourceSignature(x!));
        }
        else if (action === 'stage_execution') {
            allowed(role, ['ops']);
            const x = p.stage as StageExecution;
            const st = c.proposal?.stages?.find(st => st.id === x?.id);
            check(st && num(x.qty) && date(x.at) && x.reference?.trim(), 'Cần đợt, lượng, thời điểm, chứng từ thực hiện.');
            check(x.qty <= st!.qty, 'Thực hiện vượt lượng đợt đã duyệt.');
            c.execution.stages = (c.execution.stages || []).filter(s => s.id !== x.id);
            c.execution.stages.push({ ...x, checks: {}, confirmation: undefined });
        }
        else if (action === 'confirm_stage') {
            allowed(role, ['ops', 'workshop']);
            const x = c.execution.stages?.find(x => x.id === p.stageId), st = c.proposal?.stages?.find(x => x.id === p.stageId);
            check(x && st && x.qty === st.qty && time(x.at) <= time(st.at), 'Đợt chưa đủ lượng hoặc trễ lịch.');
            check(currentRevisedPlan(c), 'Cần kế hoạch điều chỉnh được duyệt, đúng mã và phiên bản trước khi xác nhận từng đợt.');
            check(currentEvidence(c, 'execution', x!.id), 'Thiếu chứng từ thực hiện đúng đợt.');
            check(st!.sources.filter(id => id !== 'OPENING').every(id => sourceReady(c, id, x!.at)), 'Nguồn phụ thuộc chưa thực sự sẵn sàng; không xác nhận hoàn tất.');
            check(executionBalance(c), 'Lịch thực hiện làm thiếu dự trữ tại một mốc lũy kế.');
            x!.checks ||= {};
            x!.checks[role as 'ops' | 'workshop'] = confirmation(role, p.reference || x!.reference, stageSignature(x!, c));
        }
        else if (action === 'confirm_carry') {
            allowed(role, ['director']);
            check(c.proposal?.carry && currentEvidence(c, 'carry_plan', c.proposal.carry.planId), 'Cần kế hoạch tiếp nhận phần chuyển kỳ đúng phiên bản.');
            c.execution.carryConfirmed = confirmation(role, p.reference || c.proposal!.carry!.approval, stable({ version: c.version, carry: c.proposal!.carry }));
        }
        else {
            allowed(role, ['director']);
            const issues = closureIssues(c);
            check(!issues.length, issues.join(' '));
            c.status = 'closed';
            c.closedAt = stamp();
            c.closeKind = 'execution';
            c.closeReason = `Hoàn tất thực thi ${c.proposal!.option}; ${c.proposal!.option === 'B' ? 'phần chuyển kỳ được tiếp nhận riêng, không coi là đã đáp ứng.' : ''}`;
        }
        event(s, role, action === 'close' ? 'Hoàn tất thực thi' : action, `v${c.version} · ${p.stageId || p.shipmentId || c.execution.receiptId || ''}`, c.id);
    }
    else
        throw new DomainError('Thao tác không được hỗ trợ.');
    return s;
}
function changedFields(a: any, b: any, path = ''): string[] {
    if (stable(a) === stable(b))
        return [];
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object')
        return [path];
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap(k => changedFields(a[k], b[k], path ? `${path}.${k}` : k));
}
