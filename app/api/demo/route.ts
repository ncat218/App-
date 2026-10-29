import { env } from 'cloudflare:workers';
import { seed, transition, upgrade, DomainError, roles, type Role, type State } from '@/lib/engine';
import { generateNarrative } from '@/lib/narrative';
export const dynamic = 'force-dynamic';
export function owner(request: Request) {
    const user = request.headers.get('oai-authenticated-user-id');
    if (user)
        return user;
    if (['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname))
        return 'local-demo';
    throw new DomainError('Vui lòng đăng nhập để sử dụng app.', 401);
}
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export async function read(id: string): Promise<State> {
    if (!env.DB)
        throw new Error('Chưa cấu hình database DB. Chạy npm run setup.');
    let row = await env.DB.prepare('SELECT payload, revision FROM app_states WHERE owner = ?').bind(id).first<{
        payload: string;
        revision: number;
    }>();
    if (!row) {
        const initial = seed();
        await env.DB.prepare('INSERT OR IGNORE INTO app_states(owner,payload,revision) VALUES(?,?,0)').bind(id, JSON.stringify(initial)).run();
        row = await env.DB.prepare('SELECT payload, revision FROM app_states WHERE owner = ?').bind(id).first<{
            payload: string;
            revision: number;
        }>();
    }
    if (!row)
        throw new Error('Không thể khởi tạo database.');
    return { ...upgrade({ ...JSON.parse(row.payload), revision: row.revision }), aiConfig: { status: env.GEMINI_API_KEY ? 'Đã cấu hình · chưa gọi' : 'Chưa cấu hình', model: env.GEMINI_MODEL || 'gemini-2.5-flash' } };
}
export async function GET(request: Request) {
    try {
        return json(await read(owner(request)));
    }
    catch (e) {
        return failure(e);
    }
}
export async function POST(request: Request) {
    try {
        const id = owner(request);
        const origin = request.headers.get('origin');
        if (origin && origin !== new URL(request.url).origin)
            throw new DomainError('Yêu cầu khác nguồn bị từ chối.', 403);
        if (Number(request.headers.get('content-length') || 0) > 1500000)
            throw new DomainError('Dữ liệu quá lớn.', 413);
        const body = await request.json() as {
            revision: number;
            role: Role;
            action: string;
            payload: any;
        };
        if (!Object.hasOwn(roles, body.role))
            throw new DomainError('Vai trò demo không hợp lệ.');
        const current = await read(id);
        if (body.revision !== current.revision)
            throw new DomainError('Dữ liệu đã thay đổi ở cửa sổ khác. Tải lại rồi thao tác.', 409);
        if (body.payload?.key && !body.payload.key.startsWith(`${id}/`))
            throw new DomainError('Tệp không thuộc phiên làm việc này.', 403);
        const next = transition(current, body.role, body.action, body.payload || {});
        next.revision = current.revision + 1;
        if (body.action === 'narrative') {
            const c = next.cases.find(c => c.id === body.payload.caseId)!;
            await generateNarrative(c, { key: env.GEMINI_API_KEY, model: env.GEMINI_MODEL });
            next.events[0].detail = `Nhận định ${c.narrativeMode}; model ${c.ai?.model || 'không gọi'}; bắt buộc kiểm tra từng mục.`;
        }
        const result = await env.DB!.prepare('UPDATE app_states SET payload = ?, revision = ? WHERE owner = ? AND revision = ?').bind(JSON.stringify(next), next.revision, id, current.revision).run();
        if (result.meta.changes !== 1)
            throw new DomainError('Có cập nhật đồng thời. Tải lại dữ liệu trước khi thao tác.', 409);
        return json(next);
    }
    catch (e) {
        return failure(e);
    }
}
function failure(e: unknown) { console.error(e instanceof Error ? e.message : e); return json({ error: e instanceof DomainError ? e.message : e instanceof SyntaxError ? 'Dữ liệu JSON không hợp lệ.' : 'Không thể xử lý dữ liệu. Kiểm tra database hoặc nhật ký server.' }, e instanceof DomainError ? e.status : 500); }
