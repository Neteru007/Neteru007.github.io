/** Resolve the initial Angular route from the single document's URL hash. */
export function initialRoute(hash: string): string {
  if (hash.startsWith('#/')) return hash.slice(1);
  const anchor = hash.slice(1);
  return ['library', 'journal', 'about', 'start', 'faq'].includes(anchor) ? '/#' + anchor : '/';
}
