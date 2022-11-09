import { getArticlesIndex, lookupPages, addChevronToLinks } from '../../scripts/scripts.js';
import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';

function replaceBlockWithAside($block) {
  $block.innerHTML = `
    <aside class="sidebar-container"></aside>
  `;
}

async function handleAutoDataSidebar($block) {
  await getArticlesIndex('main');

  // Find the number of articles we should auto-fill
  const numEntries = Number.parseInt($block.querySelector(':scope > div > div:last-child').innerHTML, 10);
  const selectedArticles = window.pageIndex.main.data
    .filter((article) => article.description === 'Insights')
    .slice(0, numEntries);

  // Reset the block's html
  replaceBlockWithAside($block);

  // Parse the selected articles and create dom elements for them
  selectedArticles.forEach((article) => {
    const date = new Date(1970, 0, 1);
    date.setSeconds(article.lastModified);
    const dateString = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const $article = document.createElement('div');
    $article.innerHTML = `
    <div><span class="description">${article.description}</span><span class="date"> | ${dateString}</span></div>
    <a href="${article.path}"><h3>${article.title}</h3></a>
    <p>${article.subtitle}</p>
    `;

    $block.querySelector('.sidebar-container').appendChild($article);
  });

  const viewAllInsights = document.createElement('div');
  viewAllInsights.innerHTML = '<a href="https://www.lazardassetmanagement.com/us/en_us/research-insights/lazard-insights"><h3>View All Insights</h3></a>';

  $block.querySelector('.sidebar-container').appendChild(viewAllInsights);

  addChevronToLinks([...$block.querySelectorAll('.sidebar-container > div > a')]);
  await decorateIcons($block);
}

function authorCard(content) {
  const authorName = getMetadata('article:author');
  const authorTitle = getMetadata('article:author_title');
  const authorPic = getMetadata('article:author_thumbnail');

  content.innerHTML = `
        <h3>AUTHOR</h3>
        <p class="author-name">${authorName}</p>
        <img src="${authorPic}" alt="Portrait of ${authorName}" />
        <p class="text">${authorTitle}</p>
      `;
}

async function teaserCard(content) {
  const articleLink = new URL(content.querySelector('.button-container > a').href).pathname;
  const pages = await lookupPages([articleLink], 'main');
  const page = pages[0];
  if (page) {
    content.innerHTML = `
        <a href="${page.path}">
          <h3>${page.title}</h3>
          <img src="${page.image}" alt="Image symbolising title ${page.title}" />
          <p>${page.subtitle}</p>
        </a>
      `;
  }
}

function downloadCard(content) {
  const link = content.querySelector('a');
  link.setAttribute('target', '_blank');
  content.append(link);
  content.querySelector('.button-container').remove();
  link.innerHTML = '';
  link.append(content.querySelector('picture'));
  const title = document.createElement('h3');
  title.textContent = 'Download PDF';
  content.prepend(title);
  [...content.children].forEach((child) => {
    if (child.innerHTML.trim() === '') child.remove();
  });
}

async function handleSidebarContentVariation(variation, content) {
  content.classList.add(variation);

  // eslint-disable-next-line default-case
  switch (variation) {
    case 'download':
      downloadCard(content);
      break;
    case 'teaser':
      await teaserCard(content);
      break;
    case 'author':
      authorCard(content);
      break;
  }

  return content;
}

async function handleStaticDataSidebar($block) {
  const sidebarContentNodes = {};

  [...$block.children].forEach(($child) => {
    const type = $child.children[0].textContent;
    // eslint-disable-next-line prefer-destructuring
    sidebarContentNodes[type] = $child.children[1];
  });

  // Reset the block's html
  replaceBlockWithAside($block);

  // Insert the content nodes
  await Promise.allSettled(Object.keys(sidebarContentNodes).map(async (key) => {
    const newContent = await handleSidebarContentVariation(key, sidebarContentNodes[key]);
    $block.querySelector('aside').append(newContent);
  }));
}

export default async function decorate($block) {
  if ($block.classList.contains('auto-data')) {
    await handleAutoDataSidebar($block);
  } else {
    await handleStaticDataSidebar($block);
  }

  // set the grid row template according to number of children
  const sidebarContainer = document.querySelector('.articles-sidebar-container');
  const sidebarContainerChildren = sidebarContainer.children.length;
  sidebarContainer.style.gridTemplateRows = `repeat(${sidebarContainerChildren - 1}, auto)`;
}
