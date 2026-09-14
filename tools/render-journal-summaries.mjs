import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const articlesRoot = join(root, 'content/articles');

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const summaryToHtml = (markdown) => markdown
  .split(/\n\s*\n/)
  .filter((block) => block.trim() && !block.startsWith('# '))
  .map((block) => `<p>${escapeHtml(block.replace(/\n/g, ' '))}</p>`)
  .join('\n');

const page = (meta, summary) => {
  const external = meta.externalPublication?.url;
  const publishedAt = meta.publishedAt
    ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
        .format(new Date(`${meta.publishedAt}T12:00:00+03:00`))
    : '14 сентября 2026';
  const linkBlock = external
    ? `<a class="article-original-link" href="${escapeHtml(external)}" rel="noopener noreferrer">Прочитать полную статью на внешней площадке</a>`
    : '<p class="article-source-note">Оригинальная внешняя публикация готовится к размещению. Ссылка появится после фактической публикации.</p>';

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(meta.description)}">
  <link rel="canonical" href="${escapeHtml(meta.targetUrl)}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/_astro/BaseLayout.BzKzIvHH.css">
  <link rel="stylesheet" href="/journal/journal.css">
  <title>${escapeHtml(meta.title)} | Журнал 007fin</title>
</head>
<body>
  <a class="skip-link" href="#article">Перейти к материалу</a>
  <header class="portal-header">
    <a class="brand" href="/" aria-label="007 fin, главная"><strong>007</strong><span>fin</span></a>
    <nav class="portal-nav" aria-label="Основная навигация"><a href="/">Подбор</a><a href="/journal/" aria-current="page">Журнал</a><a href="/legal/terms">Условия</a><a href="/contacts">Контакты</a></nav>
  </header>
  <main class="article-main" id="article">
    <nav class="article-breadcrumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span>/</span><a href="/journal/">Журнал</a><span>/</span><span>Публикации</span></nav>
    <header class="article-head"><div><p class="article-kicker">Внешняя публикация</p><h1>${escapeHtml(meta.title)}</h1><p class="article-deck">${escapeHtml(meta.description)}</p></div><div class="article-meta"><p><strong>${escapeHtml(meta.author)}</strong><br>Редакция 007fin</p><p>${escapeHtml(publishedAt)}</p></div></header>
    <div class="article-layout"><article class="article-body">${summaryToHtml(summary)}<div class="article-callout"><strong>Важно</strong><p>007fin не является кредитором, не гарантирует одобрение и не принимает решение по заявке. Оценивайте финансовые возможности и риски.</p></div>${linkBlock}</article><aside class="article-aside"><strong>Полный текст</strong><p>На 007fin опубликована отдельная карточка, а не копия внешнего материала.</p><a href="/journal/">Вернуться в журнал</a></aside></div>
  </main>
  <footer class="portal-footer"><a class="brand" href="/"><strong>007</strong><span>fin</span></a><div><p>Информационный сервис. Не банк и не кредитор.</p><p>Материалы не заменяют индивидуальную финансовую консультацию.</p></div><a href="/legal/advertising">Информация о рекламе</a></footer>
</body>
</html>`;
};

for (const directory of await readdir(articlesRoot, { withFileTypes: true })) {
  if (!directory.isDirectory() || directory.name.startsWith('001-')) continue;
  const contentDir = join(articlesRoot, directory.name);
  const meta = JSON.parse(await readFile(join(contentDir, 'meta.json'), 'utf8'));
  const summary = await readFile(join(contentDir, 'portal-summary.md'), 'utf8');
  const outputDir = join(root, 'journal', meta.slug);
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, 'index.html'), page(meta, summary));
}
