// Public Supabase anon JWT is not an AstroAPI secret. The AstroAPI key stays in Edge Function Secrets.
const endpoint = 'https://lpznjxheeqxxmwdkkalj.supabase.co/functions/v1/astroapi-content';
const anonJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwem5qeGhlZXF4eG13ZGtrYWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxNzI0MjAsImV4cCI6MjExMDc0ODQyMH0.QGk_fleGWQpP6uZtY5A4fRs8KMIB2K01m0um4-JI50A';
export type AstroContentResponse = { source: string; type: string; data: unknown[]; links?: { next?: string | null } };
export async function fetchAstroContent(type: 'planet-in-sign' | 'planet-in-house' | 'aspect'): Promise<AstroContentResponse> {
  const url = new URL(endpoint);
  url.searchParams.set('type', type);
  url.searchParams.set('page', '0');
  const response = await fetch(url, {
    headers: { apikey: anonJwt, Authorization: 'Bearer ' + anonJwt },
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error('AstroAPI: помилка сервера (' + response.status + ')');
  if (!payload || typeof payload !== 'object' || !('data' in payload) || !Array.isArray(payload.data)) {
    throw new Error('AstroAPI повернув некоректну відповідь');
  }
  return payload as AstroContentResponse;
}
