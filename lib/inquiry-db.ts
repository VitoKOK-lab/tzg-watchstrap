import {database} from '@/lib/database';
import {referenceFor} from '@/lib/inquiry-email';
import type {EmailInquiry} from '@/lib/inquiry-email';

// Best-effort back-office record. Failures here must never block the
// customer-facing email flow, so callers should not await this on the
// success path — only log and move on.
export async function saveInquiry(input: EmailInquiry, quoteAmount: number | null) {
  const reference = referenceFor(input.requestId);
  const now = new Date().toISOString();
  await database().prepare(
    `INSERT INTO inquiries (id,reference,service,design,material,color,quote_amount,budget,name,contact_type,contact,watch_model,notes,consent_at,status,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'new',?)
     ON CONFLICT(id) DO NOTHING`,
  ).bind(
    input.requestId, reference, input.service, input.design, input.material, input.color,
    quoteAmount, input.budget, input.name, input.contactType, input.contact,
    input.watchModel, input.notes, now, now,
  ).run();
}
