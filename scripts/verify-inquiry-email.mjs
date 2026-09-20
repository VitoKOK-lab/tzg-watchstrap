import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

// Exercise the built route against a local provider double. No real email is sent.
const directory = await mkdtemp(join(tmpdir(), 'watchstrap-email-test-'));
const calls = [];
let providerStatus = 200;
const provider = createServer(async (request, response) => {
  let raw = '';
  for await (const chunk of request) raw += chunk;
  calls.push({headers: request.headers, body: JSON.parse(raw)});
  response.writeHead(providerStatus, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(providerStatus === 200 ? {id: 'test-provider-message'} : {message: 'Provider unavailable'}));
});
await new Promise(resolve => provider.listen(0, '127.0.0.1', resolve));
const mockUrl = `http://127.0.0.1:${provider.address().port}`;
const preload = join(directory, 'intercept.mjs');
await writeFile(preload, `const originalFetch = globalThis.fetch; globalThis.fetch = (input, options) => { const url = typeof input === 'string' ? input : input.url || input.href; return originalFetch(url === 'https://api.resend.com/emails' ? ${JSON.stringify(mockUrl)} : input, options); };`);
const server = spawn(process.execPath, ['--import', pathToFileURL(preload).href, 'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '5186'], {
  env: {...process.env, GMAIL_APP_PASSWORD: '', RESEND_API_KEY: 'test-only-key-no-real-access', INQUIRY_FROM_EMAIL: 'inquiries@example.com'},
  stdio: ['ignore', 'pipe', 'pipe'],
});
const base = 'http://localhost:5186';
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server startup timed out')), 20000);
    server.stdout.on('data', chunk => {if (String(chunk).includes('Ready in')) {clearTimeout(timer); resolve();}});
    server.once('error', error => {clearTimeout(timer); reject(error);});
    server.once('exit', code => {clearTimeout(timer); reject(new Error(`Server exited ${code}`));});
  });
  const home = await (await fetch(base)).text();
  assert.ok(!home.includes('線上表單尚未開放'));
  assert.ok(home.includes('送出諮詢'));
  assert.ok(!home.includes('test-only-key-no-real-access'));
  const input = {requestId: 'e9f9a10e-1a9d-4207-a1dc-ef6dfac02df0', service: 'collection', design: 'green', material: '925', color: 'white', budget: '300k-500k', name: '測試 <b>姓名</b>', contactType: 'email', contact: 'customer@example.com', watchModel: 'Series 10', notes: '<script>alert(1)</script>', consent: true, website: ''};
  const submit = (value = input, origin = base) => fetch(`${base}/api/inquiries`, {method: 'POST', headers: {'Content-Type': 'application/json', Origin: origin}, body: JSON.stringify(value)});
  const response = await submit({...input, to: 'attacker@example.com', quoteAmount: 1});
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.match(result.reference, /^TZ-[A-F0-9]{16}$/);
  const message = calls.at(-1).body;
  assert.deepEqual(message.to, ['tzgrotw@gmail.com', 'luxkey.tw@gmail.com']);
  assert.equal(message.reply_to, input.contact);
  assert.match(message.text, /G852-7 · 綠境星河/);
  assert.match(message.text, /NT\$ 450,000/);
  assert.match(message.text, /不含 Apple Watch 主機；四色同價/);
  assert.ok(!message.html.includes('<script>'));
  assert.ok(message.html.includes('&lt;script&gt;'));
  assert.match(message.subject, /綠境星河・白K/);
  assert.ok(!message.subject.includes('\n'));
  const retry = await submit();
  assert.deepEqual(await retry.json(), result);
  assert.deepEqual(calls[0], calls[1]);
  const previousCalls = calls.length;
  assert.equal((await submit(input, 'https://unrelated.example')).status, 403);
  assert.equal((await submit({...input, consent: false})).status, 400);
  assert.equal((await submit({...input, website: 'bot'})).status, 400);
  assert.equal((await submit({...input, material: 'made-up'})).status, 400);
  assert.equal((await submit({...input, contact: 'invalid-email'})).status, 400);
  assert.equal((await submit({...input, notes: 'x'.repeat(13000)})).status, 400);
  assert.equal(calls.length, previousCalls);
  await submit({...input, requestId: crypto.randomUUID(), design: 'circle', material: '925-case', color: 'yellow', contactType: 'phone', contact: '0912345678'});
  assert.match(calls.at(-1).body.text, /不含錶帶及 Apple Watch 主機/);
  assert.match(calls.at(-1).body.text, /NT\$ 89,000/);
  assert.equal(calls.at(-1).body.reply_to, undefined);
  for (const service of ['custom-band', 'jewellery-watch']) {
    assert.equal((await submit({...input, requestId: crypto.randomUUID(), service})).status, 201);
    assert.ok(!calls.at(-1).body.text.includes('綠境星河'));
    assert.ok(!calls.at(-1).body.text.includes('450,000'));
  }
  for (const status of [429, 500]) {
    providerStatus = status;
    const failure = await submit({...input, requestId: crypto.randomUUID()});
    assert.equal(failure.status, 503);
    assert.ok((await failure.json()).error.includes('仍保留'));
  }
  console.log('PASS: fixed dual recipients, catalog pricing, HTML escaping, retry stability, three service types, validation, provider failures, no secret in page.');
} finally {
  server.kill('SIGTERM');
  await new Promise(resolve => provider.close(resolve));
  await rm(directory, {recursive: true, force: true});
}
