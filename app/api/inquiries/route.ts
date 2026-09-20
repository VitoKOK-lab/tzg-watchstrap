import {z} from 'zod';
import {database} from '@/lib/database';
import {budgets,colors,designs,services} from '@/lib/catalog';
export const dynamic='force-dynamic';
const schema=z.object({
  requestId:z.string().uuid(),service:z.string().refine(v=>services.some(s=>s.id===v)),
  budget:z.string().refine(v=>budgets.some(b=>b.id===v)),name:z.string().trim().min(1).max(60),
  contactType:z.enum(['phone','email']),contact:z.string().trim().min(3).max(160),
  design:z.string().max(40).default(''),material:z.string().max(40).default(''),color:z.string().max(40).default(''),
  watchModel:z.string().trim().max(100).default(''),notes:z.string().trim().max(1500).default(''),consent:z.literal(true),website:z.string().max(500).optional(),
});
function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
async function boundedJson(request:Request){
  const reader=request.body?.getReader();if(!reader)throw new Error('empty');const chunks:Uint8Array[]=[];let length=0;
  while(true){const chunk=await reader.read();if(chunk.done)break;length+=chunk.value.byteLength;if(length>12000){await reader.cancel();throw new Error('large');}chunks.push(chunk.value);}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return JSON.parse(new TextDecoder().decode(bytes));
}
export async function POST(request:Request){
  const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return json({error:'請回到網站重新送出諮詢。'},403);
  if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'表單格式不正確，請重新整理後再試。'},415);
  let input:unknown;try{input=await boundedJson(request);}catch{return json({error:'表單內容過長或格式有誤，請縮短補充需求後再試。'},400);}
  const parsed=schema.safeParse(input);if(!parsed.success)return json({error:'請確認需求、預算、稱呼、聯絡方式與資料使用同意均已填寫。'},400);
  const p=parsed.data;if(p.website)return json({error:'表單無法送出，請重新整理後再試。'},400);
  if(p.contactType==='email'&&!z.string().email().safeParse(p.contact).success)return json({error:'請填寫完整的 Email，例如 name@example.com。'},400);
  if(p.contactType==='phone'&&(!/^[+\d\s().#-]+$/.test(p.contact)||p.contact.replace(/\D/g,'').length<7||p.contact.replace(/\D/g,'').length>18))return json({error:'請填寫有效的電話號碼，包含區碼或國碼。'},400);
  const design=p.service==='collection'?designs.find(d=>d.id===p.design):undefined;
  const option=design?.options.find(o=>o.id===p.material);
  if(p.service==='collection'&&((p.design&&!design)||(p.material&&!option)||(p.color&&!colors.some(c=>c.id===p.color))))return json({error:'款式、材質或顏色選擇有誤，請重新選擇。'},400);
  const reference=`TZ-${crypto.randomUUID().replace(/-/g,'').slice(0,12).toUpperCase()}`;
  const now=new Date().toISOString();
  try{
    const db=database();
    await db.prepare(`INSERT INTO inquiries (id,reference,service,design,material,color,quote_amount,budget,name,contact_type,contact,watch_model,notes,consent_at,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'new',?) ON CONFLICT(id) DO NOTHING`).bind(p.requestId,reference,p.service,design?.id||'',option?.id||'',design?p.color:'',option?(option.total??option.shell):null,p.budget,p.name,p.contactType,p.contact,p.service==='jewellery-watch'?'':p.watchModel,p.notes,now,now).run();
    const saved=await db.prepare('SELECT reference FROM inquiries WHERE id=?').bind(p.requestId).first<{reference:string}>();
    if(!saved)throw new Error('Save unavailable');return json({reference:saved.reference},201);
  }catch{console.error('Inquiry save failed');return json({error:'目前無法確認送出結果，請稍後再試。內容仍保留，重試不會重複建立諮詢。'},503);}
}
