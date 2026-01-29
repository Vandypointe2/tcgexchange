document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('nav-burger');
  const menu = document.getElementById('nav-menu');
  if (!burger || !menu) return;

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

  // close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('open')) return;
    const t = e.target;
    if (burger.contains(t) || menu.contains(t)) return;
    close();
  });

  // close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
});
