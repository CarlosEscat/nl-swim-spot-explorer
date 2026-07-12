/**
 * Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when the
 * CRON_SECRET env var is set on the project. Reject anything else.
 */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // unset = routes are disabled, never open
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
