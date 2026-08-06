// Header background toggle on scroll
const header = document.getElementById('siteHeader');
const onScroll = () => {
  if (window.scrollY > 12) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Theme toggle (light / dark), persisted in localStorage
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const STORAGE_KEY = 'sns-project-theme';

const systemPrefersDark = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme);
  themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  themeToggle.setAttribute(
    'aria-label',
    theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'
  );
};

const storedTheme = localStorage.getItem(STORAGE_KEY);
applyTheme(storedTheme || (systemPrefersDark() ? 'dark' : 'light'));

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(STORAGE_KEY, next);
});

// Reveal-on-scroll
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}
