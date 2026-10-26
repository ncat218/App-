import { env } from 'cloudflare:workers';
import { owner } from '../demo/route';
import { DomainError } from '@/lib/engine';
export async function POST(request: Request) {
    try {
        const id = owner(request);
        const origin = request.headers.get('origin');
        if (origin && origin !== new URL(request.url).origin)
            throw new DomainError('Yêu cầu khác nguồn.', 403);
        if (!env.BUCKET)
            throw new DomainError('Kho tệp chưa được cấu hình.', 503);
        const form = await request.formData();
        const file = form.get('file');
        if (!(file instanceof File) || file.size > 5 * 1024 * 1024)
            throw new DomainError('Chọn tệp không quá 5 MB.');
        if (!/\.(pdf|png|jpg|jpeg|csv|txt|xlsx|docx)$/i.test(file.name))
            throw new DomainError('Hỗ trợ PDF, ảnh, CSV, TXT, XLSX và DOCX.');
        const key = `${id}/${crypto.randomUUID()}`;
        await env.BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: 'application/octet-stream' }, customMetadata: { filename: file.name } });
        return Response.json({ key, filename: file.name });
    }
    catch (e) {
        return Response.json({ error: e instanceof Error ? e.message : 'Không thể tải tệp.' }, { status: e instanceof DomainError ? e.status : 500 });
    }
}
export async function GET(request: Request) {
    try {
        const id = owner(request);
        const key = new URL(request.url).searchParams.get('key');
        if (!key?.startsWith(`${id}/`))
            throw new DomainError('Không có quyền xem tệp.', 403);
        const file = await env.BUCKET?.get(key);
        if (!file)
            throw new DomainError('Không tìm thấy tệp.', 404);
        return new Response(file.body, { headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.customMetadata?.filename || 'evidence')}`, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store' } });
    }
    catch (e) {
        return Response.json({ error: e instanceof Error ? e.message : 'Lỗi tải tệp.' }, { status: e instanceof DomainError ? e.status : 500 });
    }
}
