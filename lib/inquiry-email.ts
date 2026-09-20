import {env} from '@/lib/platform';
import {budgets, colors, designs, money, services} from '@/lib/catalog';

// Server-side only. Recipients never come from the public form.
export const INQUIRY_RECIPIENTS = ['tzgrotw@gmail.com', 'luxkey.tw@gmail.com'];
type EmailEnvironment = {RESEND_API_KEY?: string; INQUIRY_FROM_EMAIL?: string};
export function inquiryEmailConfig() {
  const config = env as EmailEnvironment;
  const apiKey = config.RESEND_API_KEY?.trim();
  const from = config.INQUIRY_FROM_EMAIL?.trim();
  return apiKey && from && /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(from) ? {apiKey, from} : null;
}

export type EmailInquiry = {
  requestId: string; service: string; design: string; material: string; color: string;
  budget: string; name: string; contactType: 'phone'|'email'; contact: string;
  watchModel: string; notes: string;
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]!));
const oneLine = (value: string) => value.replace(/[\r\n\u0000-\u001f\u007f]+/g, ' ').trim();

export function inquiryEmail(input: EmailInquiry, from: string) {
  const reference = `TZ-${input.requestId.replace(/-/g, '').slice(0, 16).toUpperCase()}`;
  const service = services.find(item => item.id === input.service)!;
  const design = input.service === 'collection' ? designs.find(item => item.id === input.design) : undefined;
  const option = design?.options.find(item => item.id === input.material);
  const color = design ? colors.find(item => item.id === input.color)?.label : undefined;
  const rows: [string, string][] = [
    ['諮詢編號', reference], ['服務', service.full], ['稱呼', input.name],
    ['聯絡方式', `${input.contactType === 'email' ? 'Email' : '電話'}：${input.contact}`],
    ['預算（新臺幣）', budgets.find(item => item.id === input.budget)!.label],
  ];
  if (input.service === 'collection') rows.push(
    ['款式', design ? `${design.model} · ${design.name}` : '尚未決定，請協助推薦'],
    ['材質與鑲嵌', option?.label || '請協助建議'], ['顏色', color || '尚未決定'],
    ['網站定價', option ? money(option.total ?? option.shell) : '依選定款式與材質確認'],
    ['包含內容', option?.total === null ? '單品錶殼，不含錶帶及 Apple Watch 主機；四色同價。' : '錶殼＋錶帶，不含 Apple Watch 主機；四色同價。'],
  );
  if (input.service !== 'jewellery-watch') rows.push(['Apple Watch 型號／尺寸', input.watchModel || '未填寫']);
  rows.push(['補充需求', input.notes || '未填寫'], ['資料使用同意', '客人已勾選同意供本次諮詢聯繫使用。']);
  const subject = `【新諮詢】${design?.name || service.title}${color ? `・${color}` : ''}｜${oneLine(input.name)}｜${reference}`;
  const text = rows.map(([label, value]) => `${label}：${value}`).join('\n\n') + '\n\n此為諮詢申請，並非付款或成立訂單。請依客人留下的聯絡方式跟進。';
  const html = `<div lang="zh-Hant" style="font-family:Helvetica,Arial,sans-serif;color:#222;max-width:640px;margin:auto;padding:24px"><p style="color:#b12468;letter-spacing:2px">泰熙爾札娜 · JEWELLERY &amp; TIME</p><h1 style="font-size:24px">收到新的網站諮詢</h1><table style="width:100%;border-collapse:collapse">${rows.map(([label, value]) => `<tr><th scope="row" style="text-align:left;vertical-align:top;width:135px;padding:12px 8px;border-bottom:1px solid #eee">${escapeHtml(label)}</th><td style="padding:12px 8px;border-bottom:1px solid #eee;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`).join('')}</table><p style="font-size:13px;color:#666">此為諮詢申請，並非付款或成立訂單。請依客人留下的聯絡方式跟進。</p></div>`;
  return {reference, message: {from: `泰熙爾札娜網站諮詢 <${from}>`, to: INQUIRY_RECIPIENTS, subject, html, text,
    ...(input.contactType === 'email' ? {reply_to: input.contact} : {}),
  }};
}

export async function sendInquiryEmail(input: EmailInquiry) {
  const config = inquiryEmailConfig();
  if (!config) throw new Error('Email not configured');
  const {reference, message} = inquiryEmail(input, config.from);
  // Stable content + key allow Resend to deduplicate retries for 24 hours.
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: {'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `watchstrap-inquiry/${input.requestId}`},
    body: JSON.stringify(message), signal: AbortSignal.timeout(15000), cache: 'no-store',
  });
  const result = await response.json() as {id?: string};
  if (!response.ok || !result.id) {
    // Do not log submitted contact details, provider body, or secrets.
    console.error('Inquiry email provider rejected request', response.status);
    throw new Error('Email not accepted');
  }
  return reference;
}
