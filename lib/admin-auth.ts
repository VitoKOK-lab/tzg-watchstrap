import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export async function adminAccess(){
  const user=await getChatGPTUser();
  const allowed=(env.ADMIN_EMAILS||'').split(',').map(email=>email.trim().toLowerCase()).filter(Boolean);
  return {user,allowed:!!user&&allowed.includes(user.email.toLowerCase()),configured:allowed.length>0};
}
