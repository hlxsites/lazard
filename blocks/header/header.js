import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch nav content
  const navPath = cfg.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.innerHTML = html;
    decorateIcons(nav);

    const classes = ['brand', 'sections', 'investors', 'tools'];
    classes.forEach((e, j) => {
      const section = nav.children[j];
      if (section) section.classList.add(`nav-${e}`);
    });

    const navSections = [...nav.children][1];
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          collapseAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
      });
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
    hamburger.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      document.body.style.overflowY = expanded ? '' : 'hidden';
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    decorateIcons(nav);
    block.append(nav);

    // Extract search bar config
    const $searchAnchor = block.querySelector('.nav-tools p a');
    const $searchPara = block.querySelector('.nav-tools p');
    if ($searchAnchor) {
      const searchHref = $searchAnchor.getAttribute('href');
      const searchIconClass = $searchAnchor.querySelector('span')?.classList;
      $searchPara.innerHTML = `
        <form action="${searchHref}">
            <input name="query" type="text" placeholder="Search" />
            <button type="submit" aria-label="submit search query">
                <span class="${searchIconClass.toString()}"></span>
            </button>
        </form>
      `;
      decorateIcons($searchPara);
    }

    // Add extra tools to toolbar
    const extraTools = document.createElement('div');
    extraTools.innerHTML = `
        <div class="lang-selector">
            <div><span class="icon icon-us" /></div>
          <span>United States</span>|<span>English</span>
        </div>
        <div class="website-settings">
          <div>
              <span class="icon icon-briefcase-fill" />
          </div>
          Access My Content
        </div>
    `;
    extraTools.classList.add('nav-extra-tools');

    const $navTools = block.querySelector('nav');
    $navTools.prepend(extraTools);
    decorateIcons($navTools);
  }
}
