/** Normalize published HTML URLs before Angular interprets the hash. */
export function legacyRoute(pathname: string, hash: string, search: string): string {
  const file = pathname.split('/').pop() || '';
  if (file === 'theurgy.html' && hash === '#/') return '/theurgy';
  if (hash.startsWith('#/')) return hash.slice(1);
  const raw = hash.slice(1);
  if (file === 'goetia-spirit.html' || file === 'shem-angel.html') {
    const id = new URLSearchParams(search).get('id') || '';
    const valid = /^\d{1,2}$/.test(id) && Number(id) >= 1 && Number(id) <= 72;
    return (
      '/' +
      (file === 'goetia-spirit.html' ? 'demonology' : 'angelology') +
      (valid ? '/' + Number(id) : '')
    );
  }
  if (file === 'theurgy.html')
    return raw === 'demonology' || raw === 'angelology' ? '/' + raw : '/theurgy';
  if (file === 'forum.html') {
    const id = new URLSearchParams(raw).get('topic');
    return id && /^[0-9a-f-]{36}$/i.test(id) ? '/forum/' + id : '/forum';
  }
  if (file === 'divination.html') return '/divination/' + (raw === 'runes' ? 'runes' : 'tarot');
  if (file === 'belial.html') return '/belial';
  if (/^article-[a-z-]+\.html$/.test(file)) return '/articles/' + file.slice(8, -5);
  if (['library', 'journal', 'about', 'start', 'faq'].includes(raw)) return '/#' + raw;
  return '/';
}
