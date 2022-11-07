export default function decorate($block) {
  if ($block.classList.contains('hero')) {
    const tabPage = window.location.pathname.split('/').at(-1);

    const items = [...$block.querySelector('ul').children];
    items.forEach(($tabItem) => {
      const link = $tabItem.querySelector('a');
      if (link.href.split('/').at(-1) === tabPage) {
        $tabItem.setAttribute('aria-selected', true);
      }
    });
  }
}
