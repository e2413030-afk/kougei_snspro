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
const counters = document.querySelectorAll('.count');

const showAll = () => revealEls.forEach((el) => el.classList.add('is-visible'));
const finishAll = () => counters.forEach((el) => { el.textContent = el.dataset.countTo; });

// ---- スクロール時のフェードイン ----
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
}

// ---- 稼働の目安の数値カウントアップ ----
const runCount = (el) => {
  const target = Number(el.dataset.countTo);
  if (!Number.isFinite(target)) return;

  const duration = 900;
  const start = performance.now();
  let done = false;

  const settle = () => {
    if (done) return;
    done = true;
    el.textContent = String(target);
  };

  const step = (now) => {
    if (done) return;
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);   // ease-out。終盤の減速で止まる位置を読ませる
    el.textContent = String(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(step); else settle();
  };

  el.textContent = '0';
  requestAnimationFrame(step);
  // rAFが走らない環境（描画が止まっているタブなど）でも最終値には必ず到達させる
  setTimeout(settle, duration + 400);
};

if (counters.length) {
  if (reduceMotion || !canObserve) {
    finishAll();
  } else {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          countObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => countObserver.observe(el));
  }
}

// ---- 保険 ----
// IntersectionObserver は描画が止まっているタブでは配信されない。
// タイマーは走るので、一定時間後に取り残しがあれば強制的に表示する。
// これがないと、条件次第で本文が opacity:0 のまま読めなくなる。
if (!reduceMotion && canObserve) {
  setTimeout(() => {
    const stuck = [...revealEls].filter((el) => !el.classList.contains('is-visible'));
    if (stuck.length === revealEls.length) {
      // 1つも表示されていない = 監視が機能していないと判断し、全部出す
      showAll();
      finishAll();
    }
  }, 2500);
}
