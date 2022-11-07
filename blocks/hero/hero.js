import { decorateIcons, addChevronToLinks } from '../../scripts/lib-franklin.js';

export default function decorate($block) {
  const $title = $block.querySelector('h1');
  const $description = $block.querySelector('.button-container');

  addChevronToLinks([...$block.querySelectorAll('.button.primary')]);

  const title = $title.innerHTML;
  const description = $description.innerHTML;

  // Add orange wrapper div to headline
  const $orangeWrapper = document.createElement('div');
  $orangeWrapper.classList.add('orange-wrapper');
  $orangeWrapper.append(description);
  $title.replaceWith($orangeWrapper);
  $description.remove();
  $orangeWrapper.innerHTML = `
    <h1>${title}</h1>
    <hr />
    <p>${description}</p>
  `;

  // Structure cards
  [...$block.querySelectorAll('.cards.hero > div')].forEach(($card) => {
    const $image = $card.children[0];
    const $rest = $card.children[1];

    const $cardTitle = $rest.children[0];
    $rest.insertBefore($image, $cardTitle.nextSibling);

    const $hr = document.createElement('hr');
    $rest.insertBefore($hr, $image);
  });

  decorateIcons($block);
}
