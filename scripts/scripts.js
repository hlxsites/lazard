import {
  buildBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateTemplateAndTheme,
  loadBlocks,
  loadCSS,
  loadFooter,
  loadHeader,
  sampleRUM,
  waitForLCP,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  const p = main.querySelectorAll('p')[1];
  const heroCards = main.querySelector('.cards.hero');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    if (p && heroCards) {
      section.append(buildBlock('hero', { elems: [picture, h1, p, heroCards] }));
    } else {
      section.append(buildBlock('hero', { elems: [picture, h1] }));
    }
    main.prepend(section);
  }
}

function buildArticleImageCaption(main) {
  const pictures = main.querySelectorAll('.article picture');
  pictures.forEach((picture) => {
    if (picture.parentElement.nextElementSibling && picture.parentElement.nextElementSibling.firstChild.tagName === 'EM') {
      picture.parentElement.nextElementSibling.classList.add('caption');
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildArticleImageCaption(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? main.querySelector(hash) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/icons/favicon.ico`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Looks up and returns pages from index in form of an array of objects.
 * @param {Array} pathnames Collection of paths
 * @param {String} collection ID of collection of indexes
 */
export async function getArticlesIndex(collection) {
  const indexPaths = {
    main: '/query-index.json',
  };
  const indexPath = indexPaths[collection];
  window.pageIndex = window.pageIndex || {};
  if (!window.pageIndex[collection]) {
    const resp = await fetch(indexPath);
    const json = await resp.json();
    const lookup = {};
    json.data.forEach((row) => {
      lookup[row.path] = row;
    });
    window.pageIndex[collection] = { data: json.data, lookup };
  }
}

/**
 * looks up pages from index.
 */
export async function lookupPages(pathnames, collection) {
  await getArticlesIndex(collection);

  /* guard for legacy URLs */
  pathnames.forEach((path, i) => {
    if (path.endsWith('/')) pathnames[i] = path.substr(0, path.length - 1);
  });
  const { lookup } = window.pageIndex[collection];
  return pathnames.map((path) => lookup[path])
    .filter((e) => e);
}

/**
 * Returns a picture element with webp and fallbacks
 * @param {string} src The image URL
 * @param {boolean} eager load image eager
 * @param {Array} breakpoints breakpoints and corresponding params (eg. width)
 */
export function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [{ media: '(min-width: 400px)', width: '2000' }, { width: '750' }]) {
  const url = new URL(src, window.location.href);
  const picture = document.createElement('picture');
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

  // webp
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    source.setAttribute('srcset', `${pathname}?width=${br.width}&format=webply&optimize=medium`);
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
      img.setAttribute('src', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
    }
  });

  return picture;
}

/**
 * Returns a relative path from a URL
 * @param {string} url The full URL to turn into a path relative to the root
 */
export function URLtoPath(url) {
  return (new URL(url)).pathname;
}

/**
 * Returns a wrapped/cut text
 * @param {string} srcText Source text
 * @param {string} maxLength Maximum length
 */
export function limitTextLength(srcText, maxLength) {
  return (srcText.length > maxLength) ? `${srcText.substring(0, maxLength)}...` : srcText;
}

/**
 * Adds a chevron to a group of link
 * @param group The group of link elements
 */
export function addChevronToLinks(group) {
  // Add chevron to links
  group.forEach(($button) => {
    const $linkIcon = document.createElement('span');
    $linkIcon.classList.add('icon', 'icon-chevron-right');
    $button.append($linkIcon);
  });
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
