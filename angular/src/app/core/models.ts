export type CatalogKind = 'demons' | 'angels';
export interface Source { title: string; url: string; }
export interface Illustration { kind: 'portrait' | 'seal' | 'document'; src: string; page: string; caption: string; note: string; width: number; height: number; }
export interface Fact { label: string; value: string; }
export interface CatalogEntry {
  id: number; kind: CatalogKind; name: string; latin: string; hebrew?: string;
  element: string; planets: string[]; sign: string; sector: string;
  description: string; appearance: string; original: string; originalLanguage: string;
  symbol: string; symbolCaption: string; illustration: Illustration | null;
  rank?: string; legions?: number; facts: Fact[]; notes: string[];
  invocation: { label: string; text: string; note: string; source: Source };
  sources: Source[];
}
export type CatalogState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; entries: CatalogEntry[] };
export function isCatalog(value: unknown): value is CatalogEntry[] {
  if (!Array.isArray(value) || value.length !== 72) return false;
  const ids = new Set<number>();
  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || !Number.isInteger(entry.id) || entry.id < 1 || entry.id > 72 || ids.has(entry.id)) return false;
    ids.add(entry.id);
    if (!['demons', 'angels'].includes(entry.kind) || ['name', 'latin', 'description', 'appearance', 'symbol', 'element', 'sign', 'sector', 'original'].some(key => typeof entry[key] !== 'string')) return false;
    if (!Array.isArray(entry.planets) || !entry.planets.every((x: unknown) => typeof x === 'string') || !Array.isArray(entry.sources) || !Array.isArray(entry.notes) || !Array.isArray(entry.facts)) return false;
    if (entry.illustration !== null && (!entry.illustration || !['portrait', 'seal', 'document'].includes(entry.illustration.kind) || typeof entry.illustration.src !== 'string' || !entry.illustration.page)) return false;
    if (!entry.invocation || typeof entry.invocation.text !== 'string' || !entry.invocation.text) return false;
  }
  return true;
}
