import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Exercise the actual production build, including the platform auth boundary.
const manifest=JSON.parse(await readFile('.next/routes-manifest.json','utf8'));
assert.ok(manifest.version);
const port=5184;
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env:{...process.env,GMAIL_APP_PASSWORD:'',RESEND_API_KEY:'',INQUIRY_FROM_EMAIL:''},stdio:['ignore','pipe','pipe']});
try {
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Production server startup timed out')),20000);
    server.stdout.on('data',chunk=>{if(String(chunk).includes('Ready in')){clearTimeout(timer);resolve();}});
    server.once('error',error=>{clearTimeout(timer);reject(error);});
    server.once('exit',code=>{clearTimeout(timer);reject(new Error(`Server exited: ${code}`));});
  });
  const base=`http://127.0.0.1:${port}`;
  const home=await fetch(base);
  assert.equal(home.status,200);
  assert.match(await home.text(),/線上表單尚未開放/);
  const forged={'oai-authenticated-user-id':'untrusted-client','oai-authenticated-user-email':'luxkey.tw@gmail.com'};
  const admin=await fetch(`${base}/admin`,{headers:forged});
  assert.equal(admin.status,200);
  assert.match(await admin.text(),/後台尚未開放/);
  const listing=await fetch(`${base}/api/admin/inquiries`,{headers:forged});
  assert.equal(listing.status,401);
  const update=await fetch(`${base}/api/admin/inquiries/example`,{method:'PATCH',headers:{...forged,'Content-Type':'application/json',Origin:base},body:JSON.stringify({status:'contacted'})});
  assert.equal(update.status,401);
  const submission=await fetch(`${base}/api/inquiries`,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:'{}'});
  assert.equal(submission.status,503);
  assert.match((await submission.json()).error,/尚未開放/);
  console.log('PASS: production routes, unavailable form, admin lock, forged-header rejection.');
} finally {
  server.kill('SIGTERM');
}
