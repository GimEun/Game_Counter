const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const navigation = document.querySelector('[data-nav]');
const toast = document.querySelector('[data-toast]');
let toastTimer;

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '메뉴 열기');
  navigation.classList.remove('open');
  document.body.style.removeProperty('overflow');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
  navigation.classList.toggle('open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    if (link.hash) closeMenu();
  });
});

document.querySelectorAll('[data-pending]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    closeMenu();
    clearTimeout(toastTimer);
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  });
});

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', header.hasAttribute('data-solid-header') || window.scrollY > 24);
}, { passive: true });

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu();
});
