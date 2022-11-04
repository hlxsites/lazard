import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;
  await decorateIcons(footer);
  block.append(footer);

  ['top-footer', 'main-footer', 'bottom-footer'].forEach((cls, i) => {
    footer.children[i].classList.add(cls);
  });

  // Add lang selector
  const extraTools = document.createElement('li');
  extraTools.innerHTML = `
        <div class="lang-selector">
            <div><span class="icon icon-us" /></div>
          <span>United States</span>|<span>English</span>
        </div>
    `;
  extraTools.classList.add('footer-extra-tools');

  const $navTools = block.querySelector('.top-footer ul');
  $navTools.append(extraTools);
  decorateIcons($navTools);
}
