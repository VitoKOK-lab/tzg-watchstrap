import {adminAccess} from '@/lib/admin-auth';
import {database} from '@/lib/database';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const access=await adminAccess();if(!access.allowed)return Response.json({error:'請以授權管理者帳號登入。'},{status:access.user?403:401,headers});
  if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'請從管理頁更新狀態。'},{status:403,headers});
  const {id}=await params;if(!/^[\da-f-]{36}$/i.test(id))return Response.json({error:'找不到這筆諮詢。'},{status:400,headers});
  let body:{status?:string};try{const raw=await request.text();if(raw.length>1000)throw new Error();body=JSON.parse(raw);}catch{return Response.json({error:'更新格式不正確。'},{status:400,headers});}
  if(!body||!['new','contacted'].includes(body.status||''))return Response.json({error:'請選擇有效的聯繫狀態。'},{status:400,headers});
  try{const result=await database().prepare('UPDATE inquiries SET status=? WHERE id=?').bind(body.status,id).run();if(!result.meta.changes)return Response.json({error:'找不到這筆諮詢，請重新整理。'},{status:404,headers});return Response.json({ok:true},{headers});}
  catch{console.error('Inquiry update unavailable');return Response.json({error:'更新未完成，請再試一次。'},{status:503,headers});}
}
