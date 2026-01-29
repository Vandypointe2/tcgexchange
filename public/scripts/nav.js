// Nav gets injected dynamically via util.js, so we expose an init function
// and call it after injection.
function initNav() {
  const burger = document.getElementById('nav-burger');
  const menu = document.getElementById('nav-menu');
  if (!burger || !menu) return;

  // avoid double-binding
  if (burger.dataset.bound === 'true') return;
  burger.dataset.bound = 'true';

  const open = () => {
    burger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    menu.classList.add('open');
  };

  const close = () => {
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    menu.classList.remove('open');
  };

  burger.addEventListener('click', () => {
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    if (expanded) close(); else open();
  });

  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('open')) return;
    const t = e.target;
    if (burger.contains(t) || menu.contains(t)) return;
    close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

// make available globally
window.initNav = initNav;

document.addEventListener('DOMContentLoaded', () => {
  // in case nav is already in DOM (e.g. no injection)
  initNav();
});
