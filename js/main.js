// JSが動く環境でのみフェードインを有効にする。
// このクラスが付くまで .reveal は非表示にならないため、JS無効時も本文は読める。
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canObserve = 'IntersectionObserver' in window;

// ヘッダー: スクロール時のみ下境界を出す
const header = document.getElementById('siteHeader');
const onScroll = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 4);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const revealEls = document.querySelectorAll('.reveal');
const showAll = () => revealEls.forEach((el) => el.classList.add('is-visible'));

// ---- スクロール時のフェードイン ----
// ページ内の動きはこれだけ。数値のカウントアップは廃止した
// （一桁の数字では演出として視認できず、意味を持たなかったため）。
if (reduceMotion || !canObserve) {
  showAll();
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // ---- 保険 ----
  // IntersectionObserver は描画が止まっているタブでは配信されない。
  // タイマーは走るので、一定時間後に取り残しがあれば強制的に表示する。
  // これがないと、条件次第で本文が opacity:0 のまま読めなくなる。
  setTimeout(() => {
    const stuck = [...revealEls].filter((el) => !el.classList.contains('is-visible'));
    // 1つも表示されていない = 監視が機能していないと判断し、全部出す
    if (stuck.length === revealEls.length) showAll();
  }, 2500);
}
