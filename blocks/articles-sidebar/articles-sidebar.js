import { addChevronToLinks, getArticlesIndex } from '../../scripts/scripts.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

export default async function decorate($block) {
  await getArticlesIndex('main');

  const numEntries = Number.parseInt($block.querySelector(':scope > div > div:last-child').innerHTML, 10);

  const selectedArticles = window.pageIndex.main.data
    .filter((article) => article.description === 'Insights')
    .slice(0, numEntries);

  $block.innerHTML = `
    <aside class="sidebar-container"></aside>
  `;

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

  // set the grid row template according to number of children
  const sidebarContainer = document.querySelector('.articles-sidebar-container');
  const sidebarContainerChildren = sidebarContainer.children.length;
  sidebarContainer.style.gridTemplateRows = `repeat(${sidebarContainerChildren - 1}, auto)`;
}
