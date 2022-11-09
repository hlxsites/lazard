import {
  createOptimizedPicture,
  limitTextLength,
  lookupPages,
  URLtoPath,
} from '../../scripts/scripts.js';

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

function createCardElement(pagePath, pages, maxSubtitleLength = 40) {
  const cardLi = document.createElement('li');
  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('featured-articles-card-body');
  const imageDiv = document.createElement('div');
  bodyDiv.classList.add('featured-articles-card-image');
  const bodyTitleParagraph = document.createElement('p');
  const bodySubtitleParagraph = document.createElement('p');
  const bodyTitleParagraphStrong = document.createElement('strong');
  bodyDiv.appendChild(bodyTitleParagraph);
  bodyDiv.appendChild(bodySubtitleParagraph);
  bodyTitleParagraph.appendChild(bodyTitleParagraphStrong);

  const page = getPage(pagePath, pages);

  bodyTitleParagraphStrong.innerText = limitTextLength(page.title, maxSubtitleLength);
  bodySubtitleParagraph.innerText = limitTextLength(page.subtitle, maxSubtitleLength);

  const picture = createOptimizedPicture(page.image, '', false, [{ media: '(min-width: 400px)', width: '2000' }, { width: '750' }]);
  imageDiv.appendChild(picture);

  cardLi.appendChild(bodyDiv);
  cardLi.appendChild(imageDiv);

  return cardLi;
}

export default async function decorate(block) {
  const links = parseCardLinks(block);
  const pages = await lookupPages(links.flat(), 'main');

  // console.log(pages);
  // console.log(getPage(links[0][0], pages));

  const adiv = document.createElement('div');
  const aul = document.createElement('ul');
  adiv.appendChild(aul);
  adiv.classList.add('featured-articles', 'featured-articles-1st-row');

  const bdiv = document.createElement('div');
  const bul = document.createElement('ul');
  bdiv.appendChild(bul);
  bdiv.classList.add('featured-articles', 'featured-articles-2nd-row');

  aul.appendChild(createCardElement(links[0][0], pages));

  for (let i = 0; i < links[1].length; i += 1) {
    const path = links[1][i];
    const card = createCardElement(path, pages);
    bul.appendChild(card);
  }

  block.textContent = '';
  block.append(adiv);
  block.append(bdiv);
}
