// Vercel has neither Sites' identity gateway nor its D1 binding.
// Fail closed until a database and a verified login provider are configured.
export const env: { DB?: D1Database; ADMIN_EMAILS?: string; GMAIL_APP_PASSWORD?: string; RESEND_API_KEY?: string; INQUIRY_FROM_EMAIL?: string } = {
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  INQUIRY_FROM_EMAIL: process.env.INQUIRY_FROM_EMAIL,
};
export const supportsChatGPTAuth = false;
