import {
  createOptimizedPicture,
  limitTextLength,
  lookupPages,
  URLtoPath,
} from '../../scripts/scripts.js';

function timestampToMonthYear(timestamp) {
  const dt = new Date(timestamp * 1000);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const textMonth = months[dt.getMonth()];
  return `${textMonth} ${dt.getFullYear()}`;
}

function parseCardLinks(block) {
  const rows = [...block.children];

  // Featured articles is a specific block made up
  // by two rows with a fixed number of columns: one
  // for the first row, three for the second
  if (
    rows.length !== 2
    || rows[0].getElementsByTagName('div').length !== 1
    || rows[1].getElementsByTagName('div').length !== 3
  ) {
    return [];
  }

  const bigCard = URLtoPath(rows[0].getElementsByTagName('a')[0].href);
  const smallCards = Array.from(rows[1].getElementsByTagName('div')).map((c) => URLtoPath(c.getElementsByTagName('a')[0].href));

  return [[bigCard], [...smallCards]];
}

function getPage(path, pages) {
  return pages.find((p) => p.path === path);
}

function createCardElement(pagePath, pages) {
  const card = document.createElement('div');
  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('featured-articles-card-body');
  const imageDiv = document.createElement('div');
  imageDiv.classList.add('featured-articles-card-image');
  const bodyDateParagraph = document.createElement('p');
  bodyDateParagraph.classList.add('featured-articles-card-body-date');
  const bodyTitleParagraph = document.createElement('p');
  bodyTitleParagraph.classList.add('featured-articles-card-body-title');
  const bodySubtitleParagraph = document.createElement('p');
  const bodyTitleParagraphStrong = document.createElement('strong');
  const bodyTitleLink = document.createElement('a');
  bodyTitleParagraphStrong.appendChild(bodyTitleLink);
  bodyDiv.appendChild(bodyDateParagraph);
  bodyDiv.appendChild(bodyTitleParagraph);
  bodyDiv.appendChild(bodySubtitleParagraph);
  bodyTitleParagraph.appendChild(bodyTitleParagraphStrong);

  const page = getPage(pagePath, pages);

  bodyDateParagraph.innerText = `${page.description.toUpperCase()} | ${timestampToMonthYear(parseInt(page.publicationDate, 10))}`;
  bodySubtitleParagraph.innerText = limitTextLength(
    page.subtitle,
    120,
  );
  bodyTitleLink.innerText = limitTextLength(
    page.subtitle,
    50,
  );
  bodyTitleLink.href = page.path;

  const picture = createOptimizedPicture(page.image, '', false, [
    { media: '(min-width: 400px)', width: '2000' },
    { width: '750' },
  ]);
  imageDiv.appendChild(picture);

  card.appendChild(imageDiv);
  card.appendChild(bodyDiv);

  return card;
}

export default async function decorate(block) {
  const links = parseCardLinks(block);
  const pages = await lookupPages(links.flat(), 'main');

  // console.log(pages);
  // console.log(getPage(links[0][0], pages));

  // const adiv = document.createElement('div');
  // const aul = document.createElement('ul');
  // adiv.appendChild(aul);
  // adiv.classList.add('featured-articles', 'featured-articles-1st-row');

  // const bdiv = document.createElement('div');
  // const bul = document.createElement('ul');
  // bdiv.appendChild(bul);
  // bdiv.classList.add('featured-articles', 'featured-articles-2nd-row');

  // aul.appendChild(createCardElement(links[0][0], pages));

  // for (let i = 0; i < links[1].length; i += 1) {
  //   const path = links[1][i];
  //   const card = createCardElement(path, pages);
  //   bul.appendChild(card);
  // }

  // block.textContent = '';
  // block.append(adiv);
  // block.append(bdiv);
  block.textContent = '';
  const articleList = document.createElement('ul');
  for (let i = 0; i < links.length; i += 1) {
    for (let j = 0; j < links[i].length; j += 1) {
      const path = links[i][j];
      const cardItem = document.createElement('li');
      cardItem.classList.add(`featured-articles-row-${i + 1}`);
      const card = createCardElement(path, pages);
      cardItem.appendChild(card);
      articleList.appendChild(cardItem);
    }
  }

  block.append(articleList);
}
