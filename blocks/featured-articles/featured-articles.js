import {
  createOptimizedPicture,
  latestPages,
  limitTextLength,
  lookupPages,
  URLtoPath,
} from '../../scripts/scripts.js';

import {
  readBlockConfig,
} from '../../scripts/lib-franklin.js';

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

function getPageFromPath(path, pages) {
  return pages.find((p) => p.path === path);
}

function createCardBodyDatedescription(page) {
  const bodyDatedescriptionParagraph = document.createElement('p');
  const bodyDateSpan = document.createElement('span');
  const bodyDatedescriptionSeparator = document.createElement('span');
  const bodyDescriptionSpan = document.createElement('span');

  bodyDatedescriptionParagraph.classList.add('featured-articles-card-body-datedescription');
  bodyDateSpan.classList.add('featured-articles-card-body-date');
  bodyDescriptionSpan.classList.add('featured-articles-card-body-description');

  bodyDatedescriptionSeparator.innerText = ' | ';

  bodyDatedescriptionParagraph.appendChild(bodyDescriptionSpan);
  bodyDatedescriptionParagraph.appendChild(bodyDatedescriptionSeparator);
  bodyDatedescriptionParagraph.appendChild(bodyDateSpan);

  bodyDateSpan.innerText = `${timestampToMonthYear(parseInt(page.publicationDate, 10))}`;
  bodyDescriptionSpan.innerText = `${page.description}`;

  return bodyDatedescriptionParagraph;
}

function createCardBodyTitle(page) {
  const bodyTitleParagraph = document.createElement('p');
  const bodyTitleParagraphStrong = document.createElement('strong');
  const bodyTitleLink = document.createElement('a');

  bodyTitleParagraph.classList.add('featured-articles-card-body-title');

  bodyTitleParagraphStrong.appendChild(bodyTitleLink);
  bodyTitleParagraph.appendChild(bodyTitleParagraphStrong);

  bodyTitleLink.innerText = page.title;
  bodyTitleLink.href = page.path;

  return bodyTitleParagraph;
}

function createCardBodySubtitle(page) {
  const bodySubtitleParagraph = document.createElement('p');
  bodySubtitleParagraph.classList.add('featured-articles-card-body-subtitle');

  bodySubtitleParagraph.innerText = limitTextLength(
    page.subtitle,
    250,
  );

  return bodySubtitleParagraph;
}

function createCardElement(page) {
  const card = document.createElement('div');
  const bodyDiv = document.createElement('div');
  const imageDiv = document.createElement('div');

  bodyDiv.classList.add('featured-articles-card-body');
  imageDiv.classList.add('featured-articles-card-image');

  const bodyDatedescriptionParagraph = createCardBodyDatedescription(page);
  const bodyTitleParagraph = createCardBodyTitle(page);
  const bodySubtitleParagraph = createCardBodySubtitle(page);

  bodyDiv.appendChild(bodyDatedescriptionParagraph);
  bodyDiv.appendChild(bodyTitleParagraph);
  bodyDiv.appendChild(bodySubtitleParagraph);

  const picture = createOptimizedPicture(page.image, '', false, [
    { media: '(min-width: 400px)', width: '2000' },
    { width: '750' },
  ]);

  imageDiv.appendChild(picture);
  card.appendChild(imageDiv);
  card.appendChild(bodyDiv);

  return card;
}

async function decorateWithAutoData(block) {
  const cfg = readBlockConfig(block);
  const entries = parseInt(cfg.entries, 10);
  const pages = await latestPages(entries, 'main');

  block.textContent = '';
  const articleList = document.createElement('ul');

  articleList.classList.add('featured-articles-auto-data');

  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i];
    const cardItem = document.createElement('li');
    if (i > 0) {
      cardItem.classList.add('featured-articles-row-2', 'featured-articles-row-2-auto-data');
    } else {
      cardItem.classList.add('featured-articles-row-1', 'featured-articles-row-1-auto-data');
    }

    if (pages.length % 2 === 0 && i === pages.length - 1) {
      cardItem.classList.add('featured-articles-row-last-auto-data');
    }

    const card = createCardElement(page);
    cardItem.appendChild(card);
    articleList.appendChild(cardItem);
  }

  block.append(articleList);
}

async function decorateWithProvidedLinks(block) {
  const links = parseCardLinks(block);
  const pages = await lookupPages(links.flat(), 'main');

  block.textContent = '';
  const articleList = document.createElement('ul');
  for (let i = 0; i < links.length; i += 1) {
    for (let j = 0; j < links[i].length; j += 1) {
      const path = links[i][j];
      const cardItem = document.createElement('li');
      cardItem.classList.add(`featured-articles-row-${i + 1}`);
      const page = getPageFromPath(path, pages);
      const card = createCardElement(page);
      cardItem.appendChild(card);
      articleList.appendChild(cardItem);
    }
  }

  block.append(articleList);
}

export default async function decorate(block) {
  const hasAutoData = block.classList.contains('auto-data');
  if (hasAutoData) {
    decorateWithAutoData(block);
  } else {
    decorateWithProvidedLinks(block);
  }
}
