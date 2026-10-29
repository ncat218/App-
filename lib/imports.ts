import type { Inputs } from './engine.ts';
const columns = ['type', 'id', 'material', 'name', 'qty', 'held', 'allocated', 'reserve', 'unit', 'source', 'confirmed', 'at', 'status', 'cutoff', 'planVersion', 'details'];
function parse(text: string) {
    const rows: string[][] = [];
    let row: string[] = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            if (quoted && text[i + 1] === '"') {
                field += '"';
                i++;
            }
            else
                quoted = !quoted;
        }
        else if (c === ',' && !quoted) {
            row.push(field);
            field = '';
        }
        else if ((c === '\n' || c === '\r') && !quoted) {
            if (c === '\r' && text[i + 1] === '\n')
                i++;
            row.push(field);
            if (row.some(Boolean))
                rows.push(row);
            row = [];
            field = '';
        }
        else
            field += c;
    }
    if (quoted)
        throw new Error('CSV có dấu ngoặc kép chưa đóng.');
    row.push(field);
    if (row.some(Boolean))
        rows.push(row);
    return rows;
}
export function importCsv(text: string): Inputs {
    const [header, ...rows] = parse(text.replace(/^\uFEFF/, ''));
    if (!header?.includes('type'))
        throw new Error('CSV không đúng mẫu. Hãy tải mẫu CSV trong app.');
    const records = rows.map(r => Object.fromEntries(header.map((k, i) => [k.trim(), r[i] || ''])));
    const extra = (r: any) => r.details ? JSON.parse(r.details) : {};
    const meta = records.find(r => r.type === 'meta');
    if (!meta)
        throw new Error('Thiếu dòng meta.');
    const number = (r: any, k: string) => {
        const v = r[k];
        if (v === '' || !Number.isFinite(Number(v)))
            throw new Error(`${r.id}: ${k} không phải số.`);
        return Number(v);
    };
    return { cutoff: meta.cutoff, planVersion: meta.planVersion, stocks: records.filter(r => r.type === 'stock').map(r => ({ id: r.id, name: r.name, qty: number(r, 'qty'), held: number(r, 'held'), allocated: number(r, 'allocated'), reserve: number(r, 'reserve'), unit: r.unit, source: r.source, confirmed: r.confirmed === 'true', ...extra(r) })), needs: records.filter(r => r.type === 'need').map(r => ({ id: r.id, material: r.material, qty: number(r, 'qty'), at: r.at, source: r.source, ...extra(r) })), shipments: records.filter(r => r.type === 'shipment').map(r => ({ id: r.id, material: r.material, qty: number(r, 'qty'), readyAt: r.at, status: r.status as any, source: r.source, ...extra(r) })) };
}
export function exportCsv(i: Inputs) { const records: any[] = [{ type: 'meta', cutoff: i.cutoff, planVersion: i.planVersion }, ...i.stocks.map(x => ({ type: 'stock', ...x, details: JSON.stringify({ reconciliation: x.reconciliation, outsideOrders: x.outsideOrders, checks: x.checks }) })), ...i.needs.map(x => ({ type: 'need', ...x, details: JSON.stringify({ scope: x.scope }) })), ...i.shipments.map(x => ({ type: 'shipment', ...x, at: x.readyAt, details: JSON.stringify({ lotId: x.lotId, includedQty: x.includedQty, openingReceipt: x.openingReceipt, openingCutoff: x.openingCutoff, forecast: x.forecast, actual: x.actual, actualReference: x.actualReference, actualChecks: x.actualChecks }) }))]; const quote = (v: unknown) => '"' + String(v ?? '').replaceAll('"', '""') + '"'; return [columns.map(quote).join(','), ...records.map(r => columns.map(k => quote(r[k])).join(','))].join('\r\n'); }
