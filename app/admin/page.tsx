import {adminAccess} from '@/lib/admin-auth';
import {chatGPTSignInPath,chatGPTSignOutPath} from '@/app/chatgpt-auth';
import AdminInquiries from '@/components/admin-inquiries';
export const dynamic='force-dynamic';
export const metadata={title:'諮詢名單管理｜泰熙爾札娜',robots:{index:false,follow:false}};
export default async function AdminPage(){
  const access=await adminAccess();
  if(!access.configured)return <main className="admin-lock"><p className="eyebrow">PRIVATE ATELIER</p><h1>後台尚未開放</h1><p>管理者登入與諮詢資料庫尚未完成設定。設定完成後，授權管理者即可在此查看名單。</p><a href="/">返回網站</a></main>;
  if(!access.user)return <main className="admin-lock"><p className="eyebrow">PRIVATE ATELIER</p><h1>諮詢名單管理</h1><p>此頁僅供授權管理者使用。請以管理者的 ChatGPT 帳號登入後查看客人的諮詢資料。</p><a className="gold-button" href={chatGPTSignInPath('/admin')} target="_top">使用 ChatGPT 登入</a><p><a href="/">返回網站</a></p></main>;
  if(!access.allowed)return <main className="admin-lock"><p className="eyebrow">PRIVATE ATELIER</p><h1>此帳號沒有查看權限</h1><p>目前登入：{access.user.email}</p><p>請切換至已授權的管理者帳號，才能查看諮詢名單。</p><a className="gold-button" href={chatGPTSignOutPath('/admin')} target="_top">登出並切換帳號</a><p><a href="/">返回網站</a></p></main>;
  return <main className="admin-shell"><header className="admin-heading"><div><p className="eyebrow">泰熙爾札娜 / PRIVATE ATELIER</p><h1>諮詢名單</h1><p>依客人留下的需求與預算，接續每一段對話。</p></div><div className="admin-actions"><a href="/">查看網站</a><a href={chatGPTSignOutPath('/')} target="_top">登出</a></div></header><AdminInquiries/><p className="admin-account">管理者：{access.user.email}</p></main>;
}
