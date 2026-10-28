import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { origin, pages } from '../seo/pages.mjs';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const escape = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const link = (href, label) => `<a href="${escape(href)}">${escape(label)}</a>`;
export async function generateSeo(outputRoot) {
  const template = await readFile(path.join(project, 'seo/page.html'), 'utf8');
  for (const page of pages) {
    const url = `${origin}/${page.slug}/`;
    const sections = page.sections
      .map(
        (section) =>
          `<section><h2>${escape(section.heading)}</h2>${section.text ? `<p>${escape(section.text)}</p>` : ''}${section.steps ? `<ol>${section.steps.map((step) => `<li>${escape(step)}</li>`).join('')}</ol>` : ''}${section.link ? link(section.link, section.label) : ''}</section>`,
      )
      .join('\n');
    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': url,
      url,
      name: page.heading,
      description: page.description,
      inLanguage: 'uk',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Головна', item: origin + '/' },
          { '@type': 'ListItem', position: 2, name: page.heading, item: url },
        ],
      },
      isPartOf: {
        '@type': 'WebSite',
        '@id': origin + '/#website',
        url: origin + '/',
        name: 'Neteru Theurgy',
      },
    }).replaceAll('<', '\\u003c');
    const values = {
      ...page,
      url,
      sections,
      schema,
      navigation: pages
        .map(
          (other) =>
            `<a href="/${other.slug}/"${other.slug === page.slug ? ' aria-current="page"' : ''}>${escape(other.label || (other.slug === 'magichni-poslugy' ? 'Усі сервіси' : other.slug === 'tarot-online' ? 'Таро' : other.slug === 'runy-online' ? 'Руни' : 'Дизайн людини'))}</a>`,
        )
        .join(''),
      faqs: page.faqs
        .map(
          ([question, answer]) =>
            `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`,
        )
        .join('\n'),
      related: pages
        .filter((other) => other.slug !== page.slug)
        .map((other) => `<li>${link('/' + other.slug + '/', other.heading)}</li>`)
        .join(''),
    };
    const raw = new Set(['sections', 'schema', 'navigation', 'faqs', 'related']);
    const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      raw.has(key) ? values[key] : escape(values[key]),
    );
    await mkdir(path.join(outputRoot, page.slug), { recursive: true });
    await writeFile(path.join(outputRoot, page.slug, 'index.html'), html);
  }
  // Retain reviewed guides that predate the shared page template.
  const existingRoot = path.join(project, 'seo/existing');
  const existing = await readdir(existingRoot);
  for (const slug of existing) {
    await cp(path.join(existingRoot, slug), path.join(outputRoot, slug), { recursive: true });
  }
  const urls = [
    origin + '/',
    ...pages.map((page) => `${origin}/${page.slug}/`),
    ...existing.map((slug) => `${origin}/${slug}/`),
  ];
  await writeFile(
    path.join(outputRoot, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`,
  );
  await writeFile(
    path.join(outputRoot, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
  );
  console.log(`Generated ${pages.length} searchable pages, sitemap.xml and robots.txt.`);
}
