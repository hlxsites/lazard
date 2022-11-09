import { URLtoPath, lookupPages } from '../../scripts/scripts.js';

function parseCardLinks(block) {
  const rows = [...block.children];

  // Featured articles is a specific block made up
  // by two rows with a fixed number of columns: one
  // for the first row, three for the second
  if (rows.length !== 2 || rows[0].getElementsByTagName('div').length !== 1
    || rows[1].getElementsByTagName('div').length !== 3) {
    return [];
  }

  const bigCard = URLtoPath(rows[0].getElementsByTagName('a')[0].href);
  const smallCards = Array.from(rows[1].getElementsByTagName('div')).map((c) => URLtoPath(c.getElementsByTagName('a')[0].href));

  return [[bigCard], [...smallCards]];
}

function getPage(path, pages) {
  return pages.find((p) => p.path === path);
}

export default async function decorate(block) {
  const links = parseCardLinks(block);
  const pages = await lookupPages(links.flat(), 'main');

  // TODO: work on pages

  console.log(pages);

  console.log(getPage(links[0][0], pages));

  block.textContent = '';
}
