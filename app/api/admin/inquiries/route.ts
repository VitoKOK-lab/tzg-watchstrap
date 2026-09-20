import {adminAccess} from '@/lib/admin-auth';
import {database} from '@/lib/database';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','Vary':'Cookie'};
export async function GET(request:Request){
  const access=await adminAccess();if(!access.allowed)return Response.json({error:'請以授權管理者帳號登入。'},{status:access.user?403:401,headers});
  const url=new URL(request.url);const status=url.searchParams.get('status')||'all';const offset=Number(url.searchParams.get('offset')||0);
  if(!['all','new','contacted'].includes(status)||!Number.isInteger(offset)||offset<0||offset>100000)return Response.json({error:'篩選條件有誤，請重新整理。'},{status:400,headers});
  try{const db=database();const result=await db.batch([
    db.prepare('SELECT id,reference,service,design,material,color,quote_amount,budget,name,contact_type,contact,watch_model,notes,status,created_at FROM inquiries WHERE (?=\'all\' OR status=?) ORDER BY created_at DESC,id DESC LIMIT 51 OFFSET ?').bind(status,status,offset),
    db.prepare('SELECT count(*) AS total,COALESCE(SUM(CASE WHEN status=\'new\' THEN 1 ELSE 0 END),0) AS pending FROM inquiries'),
  ]);return Response.json({items:result[0].results.slice(0,50),hasMore:result[0].results.length>50,counts:result[1].results[0]},{headers});}
  catch{console.error('Inquiry list unavailable');return Response.json({error:'暫時無法讀取名單，請稍後重新整理。'},{status:503,headers});}
}
