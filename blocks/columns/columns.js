import { decorateIcons } from '../../scripts/lib-franklin.js';
import { addChevronToLinks } from '../../scripts/scripts.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  if (block.classList.contains('investment')) {
    const $left = block.querySelector(':scope > div > div');
    const $title = $left?.querySelector('h2');

    if ($left && $title) {
      const hr = document.createElement('hr');
      $left.insertBefore(hr, $title.nextSibling);
    }

    addChevronToLinks([...block.querySelectorAll('.button.primary')]);
    decorateIcons(block);
  }
}
