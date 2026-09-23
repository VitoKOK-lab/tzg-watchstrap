import {budgets, colors, designs, money, services} from '@/lib/catalog';

export function inquiryLineSummary(input: Record<string, unknown>, requestId: string) {
  const value = (key: string) => typeof input[key] === 'string' ? input[key] as string : '';
  const service = services.find(item => item.id === value('service'));
  const design = value('service') === 'collection' ? designs.find(item => item.id === value('design')) : undefined;
  const option = design?.options.find(item => item.id === value('material'));
  const lines = ['您好，我在網站填寫諮詢時無法確認送出結果，想透過 LINE 接續諮詢。'];
  if (/^[\da-f-]{36}$/i.test(requestId)) lines.push(`諮詢辨識碼：TZ-${requestId.replace(/-/g, '').slice(0, 16).toUpperCase()}`);
  lines.push(`需求：${service?.full || '請協助建議'}`);
  if (design) {
    lines.push(`款式：${design.model} · ${design.name}`, `材質：${option?.label || '尚未決定'}`, `顏色：${colors.find(item => item.id === value('color'))?.label || '尚未決定'}`);
    if (option) lines.push(`網站定價：${money(option.total ?? option.shell)}`, option.total === null ? '單品錶殼，不含錶帶及 Apple Watch 主機。' : '錶殼＋錶帶，不含 Apple Watch 主機。');
  }
  lines.push(`預算：${budgets.find(item => item.id === value('budget'))?.label || '尚未決定'}`, `稱呼：${value('name')}`, `${value('contactType') === 'email' ? 'Email' : '電話'}：${value('contact')}`);
  if (value('service') !== 'jewellery-watch' && value('watchModel')) lines.push(`${value('service') === 'collection' ? 'Apple Watch 型號／尺寸' : '腕錶品牌／型號／尺寸'}：${value('watchModel')}`);
  if (value('notes')) lines.push(`補充需求：${value('notes')}`);
  return lines.join('\n');
}
