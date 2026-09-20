// Vercel has neither Sites' identity gateway nor its D1 binding.
// Fail closed until a database and a verified login provider are configured.
export const env: { DB?: D1Database; ADMIN_EMAILS?: string } = {
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
};
export const supportsChatGPTAuth = false;
