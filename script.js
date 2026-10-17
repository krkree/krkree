const qqDialog = document.querySelector('#qq-dialog');
const douyinDialog = document.querySelector('#douyin-dialog');
const copyDialog = document.querySelector('#copy-dialog');
const dialogs = [qqDialog, douyinDialog, copyDialog];
const toast = document.querySelector('#toast');
let toastTimer;
let language = 'zh';
const t = key => translations[language][key];

function setLanguage(next, remember = false) {
  language = next === 'ja' ? 'ja' : 'zh';
  document.documentElement.lang = language === 'ja' ? 'ja' : 'zh-CN';
  document.title = t('title');
  document.querySelector('meta[name="description"]').content = t('description');
  // Translation markup is a fixed, local dictionary; no remote or user HTML is inserted.
  document.querySelectorAll('[data-i18n]').forEach(node => {
    node.innerHTML = t(node.dataset.i18n);
  });
  for (const attribute of ['aria-label', 'alt']) {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(node => {
      node.setAttribute(attribute, t(node.getAttribute(`data-i18n-${attribute}`)));
    });
  }
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
  toast.classList.remove('visible');
  updateSceneControls();
  if (remember) {
    try { localStorage.setItem('krkree-language', language); } catch { /* Storage may be disabled. */ }
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState(null, '', url);
  }
}

document.querySelectorAll('[data-language]').forEach(button => {
  button.addEventListener('click', () => setLanguage(button.dataset.language, true));
});
document.querySelector('#year').textContent = new Date().getFullYear();

const topbar = document.querySelector('#topbar');
const onScroll = () => topbar.classList.toggle('is-scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(el => io.observe(el));
} else {
  items.forEach(el => el.classList.add('is-in'));
}

function drawBarcode(node, seed) {
  let h = 2166136261;
  const bars = document.createDocumentFragment();
  for (let i = 0; i < 44; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i * 31;
    h = Math.imul(h, 16777619);
    const span = document.createElement('span');
    span.style.height = `${40 + (Math.abs(h) % 60)}%`;
    span.style.width = `${(Math.abs(h >> 7) % 3 === 0) ? 3 : 2}px`;
    bars.append(span);
  }
  node.append(bars);
}
document.querySelectorAll('[data-barcode]').forEach(node => drawBarcode(node, node.dataset.barcode));
for (const card of document.querySelectorAll('.link-card, .contact-card:not([aria-disabled])')) {
  card.addEventListener('pointermove', event => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });
}

for (const [opener, dialog] of [['#hero-qq', qqDialog], ['#open-qq', qqDialog], ['#open-douyin', douyinDialog]]) {
  document.querySelector(opener).addEventListener('click', () => dialog.showModal());
}
for (const [close, dialog] of [['#close-qq', qqDialog], ['#close-douyin', douyinDialog], ['#close-copy', copyDialog]]) {
  document.querySelector(close).addEventListener('click', () => dialog.close());
}
// Native dialogs contain focus, handle Escape, and restore focus to the opener.
for (const dialog of dialogs) {
  let startedOutside = false;
  const outside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => { startedOutside = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (startedOutside && event.target === dialog && outside(event)) dialog.close();
    startedOutside = false;
  });
}
function notify(message) {
  clearTimeout(toastTimer);
  (dialogs.findLast(dialog => dialog.open) || document.body).append(toast);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}
for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      notify(`${t(button.dataset.copyLabel)} ${t('copied')} · ${value}`);
    } catch {
      const field = document.querySelector('#copy-fallback');
      field.value = value;
      copyDialog.showModal();
      field.focus();
      field.select();
    }
  });
}

// Two image layers crossfade only after the incoming local image is fully decoded.
const slides = [...document.querySelectorAll('.hero-slide')];
slides[1].src = slides[0].src;
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
let sceneIndex = 0;
let activeLayer = 0;
let paused = motion.matches;
let heroVisible = true;
let changing = false;
let sceneTimer;
const pauseButton = document.querySelector('#scene-pause');
function updateSceneControls() {
  document.querySelector('#scene-count').innerHTML = `${String(sceneIndex + 1).padStart(2, '0')} <i>/ ${String(backgroundSources.length).padStart(2, '0')}</i>`;
  pauseButton.setAttribute('aria-label', t(paused ? 'resume' : 'pause'));
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
}
function scheduleScene() {
  clearTimeout(sceneTimer);
  if (!paused && !document.hidden && heroVisible) sceneTimer = setTimeout(() => changeScene(1), 7000);
}
async function changeScene(direction) {
  if (changing) return;
  changing = true;
  clearTimeout(sceneTimer);
  const nextIndex = (sceneIndex + direction + backgroundSources.length) % backgroundSources.length;
  const incoming = slides[1 - activeLayer];
  const outgoing = slides[activeLayer];
  document.querySelectorAll('#scene-next, #scene-prev').forEach(button => { button.disabled = true; });
  try {
    incoming.src = backgroundSources[nextIndex];
    await incoming.decode();
    incoming.classList.add('is-current');
    outgoing.classList.remove('is-current');
    sceneIndex = nextIndex;
    activeLayer = 1 - activeLayer;
    updateSceneControls();
    // Do not reuse a layer before its fade has completed.
    if (!motion.matches) await new Promise(resolve => setTimeout(resolve, 1200));
  } catch {
    incoming.src = outgoing.src;
    notify(t('sceneError'));
  } finally {
    changing = false;
    document.querySelectorAll('#scene-next, #scene-prev').forEach(button => { button.disabled = false; });
    scheduleScene();
  }
}
document.querySelector('#scene-next').addEventListener('click', () => changeScene(1));
document.querySelector('#scene-prev').addEventListener('click', () => changeScene(-1));
pauseButton.addEventListener('click', () => {
  paused = !paused;
  updateSceneControls();
  scheduleScene();
});
document.addEventListener('visibilitychange', scheduleScene);
motion.addEventListener('change', () => {
  if (motion.matches) paused = true;
  updateSceneControls();
  scheduleScene();
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    scheduleScene();
  });
  observer.observe(document.querySelector('.hero'));
}
let initialLanguage = new URL(location.href).searchParams.get('lang');
if (!['zh', 'ja'].includes(initialLanguage)) {
  try { initialLanguage = localStorage.getItem('krkree-language'); } catch { /* Use Chinese. */ }
}
setLanguage(initialLanguage);
scheduleScene();
