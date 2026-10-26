import { owner, read } from '../demo/route';
import { renderReport } from '@/lib/report';
export async function GET(request: Request) { try {
    const s = await read(owner(request));
    const id = new URL(request.url).searchParams.get('caseId');
    const c = s.cases.find(c => c.id === id);
    if (!c)
        return new Response('Không tìm thấy hồ sơ.', { status: 404 });
    return new Response(renderReport(c, s), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
}
catch {
    return new Response('Không thể xuất hồ sơ.', { status: 500 });
} }
