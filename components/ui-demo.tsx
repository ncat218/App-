'use client';
import type { ReactNode } from 'react';
import { FolderCheck } from 'lucide-react';
export const statuses: Record<string, string> = { draft: 'Nháp · chờ xác minh', needs_review: 'Cần xem xét lại', needs_info: 'Yêu cầu bổ sung', rejected: 'Đã từ chối', director_review: 'Chờ GĐ Nhà máy', ceo_review: 'Chờ TGĐ SFG', executing: 'Đang thực hiện', closed: 'Hoàn tất thực thi' };
export const evidenceLabels: Record<string, string> = { inventory: 'Đối soát tồn kho', quality: 'Trạng thái chất lượng', plan: 'Kế hoạch ban đầu', supply: 'Xác nhận nguồn/lịch', order: 'Lệnh mua / điều động', receipt: 'Chứng từ thực nhận', release: 'Giải phóng chất lượng', execution: 'Chứng từ thực hiện từng đợt', revised_plan: 'Kế hoạch điều chỉnh đã duyệt', carry_plan: 'Kế hoạch tiếp nhận chuyển kỳ', verification: 'Xác minh hết ngoại lệ' };
export const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(n);
export const dt = (v?: string) => v ? new Date(v.endsWith('Z') || /[+-]\d\d:\d\d$/.test(v) ? v : v + '+07:00').toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa xác nhận';
export function Pill({ children, tone = 'green' }: {
    children: ReactNode;
    tone?: string;
}) { return <span className={'pill ' + tone}>{children}</span>; }
export function Button({ children, onClick, secondary = false, disabled = false, danger = false, ...rest }: any) { return <button {...rest} disabled={disabled} onClick={onClick} className={'btn ' + (danger ? 'danger' : secondary ? 'secondary' : 'primary')}>{children}</button>; }
export function Card({ title, subtitle, children, action, className = '' }: {
    title?: string;
    subtitle?: string;
    children: ReactNode;
    action?: ReactNode;
    className?: string;
}) { return <section className={'card ' + className}>{title && <div className="card-head"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>}{children}</section>; }
export function Empty({ text, action }: {
    text: string;
    action?: ReactNode;
}) { return <div className="empty"><FolderCheck size={34}/><h3>{text}</h3>{action}</div>; }
export function download(name: string, text: string, type = 'application/json') { const u = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); }
export function Stat({ label, value, note, icon, tone = 'green' }: any) { return <div className={'stat ' + tone}><div><span>{label}</span><i>{icon}</i></div><b>{typeof value === 'number' ? String(value).padStart(2, '0') : value}</b><p>{note}</p></div>; }
