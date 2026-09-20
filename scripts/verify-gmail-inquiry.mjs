import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

// Replace only Nodemailer's SMTP transport in this child process. No email leaves this machine.
const directory = await mkdtemp(join(tmpdir(), 'watchstrap-gmail-test-'));
const calls = [];
let mode = 'success';
const mock = createServer(async (request, response) => {
  let raw = '';
  for await (const chunk of request) raw += chunk;
  calls.push(JSON.parse(raw));
  response.writeHead(mode === 'failure' ? 500 : 200, {'Content-Type':'application/json'});
  response.end(JSON.stringify({accepted: mode === 'partial' ? ['luxkey.tw@gmail.com'] : ['luxkey.tw@gmail.com','tzgrotw@gmail.com']}));
});
await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
const mockUrl = `http://127.0.0.1:${mock.address().port}`;
const preload = join(directory, 'smtp-mock.mjs');
await writeFile(preload, `import nodemailer from ${JSON.stringify(import.meta.resolve('nodemailer'))};
nodemailer.createTransport = options => ({
  async sendMail(message) {
    const response = await fetch(${JSON.stringify(mockUrl)}, {method:'POST',body:JSON.stringify({options,message})});
    if(!response.ok) throw new Error('Simulated SMTP rejection');
    return response.json();
  }, close() {},
});`);
const server = spawn(process.execPath, ['--import', pathToFileURL(preload).href, 'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '5187'], {
  env: {...process.env, GMAIL_APP_PASSWORD: 'abcd efgh ijkl mnop', RESEND_API_KEY: '', INQUIRY_FROM_EMAIL: ''},
  stdio: ['ignore','pipe','pipe'],
});
const base = 'http://localhost:5187';
try {
  await new Promise((resolve,reject) => {
    const timer = setTimeout(() => reject(new Error('Startup timed out')), 20000);
    server.stdout.on('data', chunk => {if(String(chunk).includes('Ready in')){clearTimeout(timer);resolve();}});
    server.once('error', error => {clearTimeout(timer);reject(error);});
    server.once('exit', code => {clearTimeout(timer);reject(new Error(`Exited ${code}`));});
  });
  const home = await (await fetch(base)).text();
  assert.ok(home.includes('送出諮詢'));
  assert.ok(!home.includes('線上表單尚未開放'));
  assert.ok(!home.includes('abcdefghijklmnop'));
  assert.ok(!home.includes('abcd efgh ijkl mnop'));
  const input = {requestId: crypto.randomUUID(), service:'collection', design:'green', material:'925', color:'rose', budget:'300k-500k', name:'測試客人', contactType:'email', contact:'customer@example.com', notes:'只測試，不是真實諮詢', consent:true};
  const submit = value => fetch(`${base}/api/inquiries`, {method:'POST', headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(value)});
  const response = await submit({...input, to:'not-authorized@example.com', from:'not-authorized@example.com', quoteAmount:1});
  assert.equal(response.status, 201, `Gmail response ${response.status}; provider calls: ${calls.length}`);
  const result = await response.json();
  const first = calls[0];
  assert.equal(first.options.host, 'smtp.gmail.com');
  assert.equal(first.options.port, 465);
  assert.equal(first.options.secure, true);
  assert.deepEqual(first.options.auth, {user:'luxkey.tw@gmail.com',pass:'abcdefghijklmnop'});
  assert.equal(first.options.disableFileAccess, true);
  assert.equal(first.options.disableUrlAccess, true);
  assert.equal(first.message.from, '"泰熙爾札娜珠寶錶帶諮詢單-「測試客人」" <luxkey.tw@gmail.com>');
  assert.ok(first.message.subject.startsWith('泰熙爾札娜珠寶錶帶諮詢單-「測試客人」'));
  assert.deepEqual(first.message.to, ['tzgrotw@gmail.com','luxkey.tw@gmail.com']);
  assert.equal(first.message.replyTo, input.contact);
  assert.equal(first.message.reply_to, undefined);
  assert.match(first.message.text, /NT\$ 450,000/);
  assert.match(first.message.subject, /綠境星河・玫瑰金/);
  assert.equal(first.message.headers['X-Inquiry-Reference'], result.reference);
  const retry = await submit(input);
  assert.deepEqual(await retry.json(), result);
  assert.equal(calls[1].message.messageId, first.message.messageId);
  const phone = await submit({...input, requestId:crypto.randomUUID(), contactType:'phone', contact:'0912345678'});
  assert.equal(phone.status, 201);
  assert.equal(calls.at(-1).message.replyTo, undefined);
  for (const failure of ['partial','failure']) {
    mode = failure;
    const response = await submit({...input, requestId:crypto.randomUUID()});
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /仍保留/);
  }
  console.log('PASS: Gmail sender, TLS, dual recipients, Reply-To, catalog price, secret isolation, stable message ID, partial and full SMTP failures. No real email sent.');
} finally {
  server.kill('SIGTERM');
  await new Promise(resolve => mock.close(resolve));
  await rm(directory, {recursive:true, force:true});
}
