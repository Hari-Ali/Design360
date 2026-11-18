import '../styles/main.css';
import '../styles/reconstruction.css';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const menu = document.querySelector<HTMLDialogElement>('#mobile-menu')!;
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const closeButton = menu.querySelector<HTMLButtonElement>('.menu-close')!;
const motion = document.querySelector<HTMLButtonElement>('.motion-toggle')!;
let stored = false;
let menuTimer = 0;
try { stored = localStorage.getItem('form-low-motion') === 'true'; } catch {}

let restorePosition = performance.getEntriesByType('navigation')
  .some(entry => (entry as PerformanceNavigationTiming).type === 'back_forward');
const cancelRestoration = () => { restorePosition = false; };
window.addEventListener('wheel', cancelRestoration, {passive: true});
window.addEventListener('touchstart', cancelRestoration, {passive: true});
window.addEventListener('keydown', cancelRestoration);

function restoreScroll() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const position = history.state?.formScroll;
    if (restorePosition && typeof position === 'number') {
      window.scrollTo({top: position, behavior: 'instant'});
    }
  }));
}

window.addEventListener('pagehide', () => {
  try { history.replaceState({...history.state, formScroll: window.scrollY}, ''); } catch {}
});
window.addEventListener('pageshow', event => {
  if (event.persisted) restorePosition = true;
  if (restorePosition) restoreScroll();
});

function updateMotion() {
  const low = reduced.matches || stored;
  root.classList.toggle('low-motion', low);
  motion.setAttribute('aria-pressed', String(low));
  motion.textContent = low ? 'Reduce motion: On' : 'Reduce motion: Off';
  motion.disabled = reduced.matches;
  window.dispatchEvent(new Event('motionchange'));
}

function finishClose() {
  clearTimeout(menuTimer);
  menu.close();
  menu.dataset.state = '';
  root.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.focus({preventScroll: true});
}

function closeMenu() {
  if (!menu.open || menu.dataset.state === 'closing') return;
  if (root.classList.contains('low-motion')) return finishClose();
  menu.dataset.state = 'closing';
  menuTimer = window.setTimeout(finishClose, 360);
}

toggle.addEventListener('click', () => {
  menu.dataset.state = 'opening';
  menu.showModal();
  root.classList.add('menu-open');
  toggle.setAttribute('aria-expanded', 'true');
  closeButton.focus({preventScroll: true});
});
closeButton.addEventListener('click', closeMenu);
menu.addEventListener('cancel', event => {
  event.preventDefault();
  closeMenu();
});
menu.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const last = menu.querySelector<HTMLAnchorElement>('.menu-contact a');
  if (event.shiftKey && document.activeElement === closeButton) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    closeButton.focus();
  }
});
menu.addEventListener('click', event => {
  const link = (event.target as HTMLElement).closest('a');
  if (event.target === menu) {
    const bounds = menu.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu();
  }
  if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) closeMenu();
});
window.addEventListener('pagehide', () => { if (menu.open) finishClose(); });

motion.addEventListener('click', () => {
  stored = !stored;
  try { localStorage.setItem('form-low-motion', String(stored)); } catch {}
  updateMotion();
});
reduced.addEventListener('change', updateMotion);

const scene = document.querySelector<HTMLElement>('.scene');
const service = document.querySelector<HTMLElement>('.service-stage');
const loader = document.querySelector<HTMLElement>('.intro-loader')!;
let heroReady: () => void = () => {};
const firstFrame = new Promise<void>(resolve => { heroReady = resolve; });
scene?.addEventListener('sceneready', heroReady, {once: true});

function mountWhenNear(host: HTMLElement, mount: (module: typeof import('../three/hero-scene')) => void) {
  let nearby = false;
  let mounted = false;
  async function start() {
    if (mounted || !nearby || root.classList.contains('low-motion')) return;
    mounted = true;
    observer.disconnect();
    window.removeEventListener('motionchange', start);
    try { mount(await import('../three/hero-scene')); }
    catch { if (host === scene) heroReady(); }
  }
  const observer = new IntersectionObserver(([entry]) => {
    nearby = entry.isIntersecting;
    void start();
  }, {rootMargin: '160px'});
  observer.observe(host);
  window.addEventListener('motionchange', start);
}
if (scene) mountWhenNear(scene, module => module.createHeroScene(scene));
if (service) mountWhenNear(service, module => module.createStoneScene(service));

const lightSections = [...document.querySelectorAll<HTMLElement>('[data-surface="light"]')];
function updateHeader() {
  root.classList.toggle('light-header', lightSections.some(element => {
    const box = element.getBoundingClientRect();
    return box.top <= 44 && box.bottom > 44;
  }));
}
window.addEventListener('scroll', updateHeader, {passive: true});
window.addEventListener('resize', updateHeader);
window.addEventListener('pageshow', updateHeader);
updateHeader();

try {
  if (scene && !sessionStorage.getItem('form-visited') && !reduced.matches && !stored && !restorePosition) {
    const reels = loader.querySelectorAll<HTMLElement>('.loader-counter > span > span');
    let ready = 0;
    let leaving = false;
    function progress(value: number) {
      ready = Math.max(ready, value);
      for (const [index, digit] of String(ready).padStart(3, '0').split('').entries()) {
        reels[index].style.setProperty('--digit', digit);
      }
    }
    function finish(immediate = false) {
      if (leaving) return;
      leaving = true;
      progress(100);
      root.classList.remove('intro-playing');
      if (immediate) {
        loader.hidden = true;
        return;
      }
      requestAnimationFrame(() => loader.classList.add('leaving'));
      window.setTimeout(() => { loader.hidden = true; }, 750);
    }
    root.classList.add('intro-playing');
    loader.hidden = false;
    progress(10);
    loader.querySelector('button')?.addEventListener('click', () => finish(true), {once: true});
    window.addEventListener('motionchange', () => {
      if (root.classList.contains('low-motion')) finish(true);
    });
    const image = scene.querySelector('img')!;
    void image.decode().catch(() => {}).then(() => progress(56));
    void document.fonts.ready.then(() => progress(78));
    const guard = new Promise<void>(resolve => window.setTimeout(resolve, 2600));
    void Promise.race([Promise.allSettled([image.decode(), document.fonts.ready, firstFrame]), guard])
      .then(() => finish());
    sessionStorage.setItem('form-visited', 'true');
  }
} catch {}

let requestedReveals = false;
function loadReveals() {
  if (requestedReveals || root.classList.contains('low-motion')) return;
  requestedReveals = true;
  void import('./reveals').then(module => {
    module.setupReveals();
    if (restorePosition) restoreScroll();
  }).catch(() => {});
}
window.addEventListener('motionchange', loadReveals);
updateMotion();

const routeKey = 'form-route-arrival';
let routeTimer = 0;

try {
  const arrival = sessionStorage.getItem(routeKey);
  sessionStorage.removeItem(routeKey);
  if (arrival === location.href && !root.classList.contains('low-motion')) {
    root.classList.add('route-arriving');
    window.setTimeout(() => root.classList.remove('route-arriving'), 570);
  }
} catch {}

document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey ||
      event.shiftKey || event.altKey || root.classList.contains('low-motion')) return;
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
  if (!link || link.target || link.hasAttribute('download')) return;
  const destination = new URL(link.href);
  if (destination.origin !== location.origin || destination.pathname === location.pathname ||
      destination.hash || !destination.pathname.endsWith('.html')) return;
  try { sessionStorage.setItem(routeKey, destination.href); } catch { return; }
  event.preventDefault();
  window.clearTimeout(routeTimer);
  root.classList.remove('route-arriving');
  root.classList.add('route-leaving');
  routeTimer = window.setTimeout(() => {
    location.assign(destination.href);
    window.setTimeout(() => root.classList.remove('route-leaving'), 4000);
  }, 440);
});
window.addEventListener('pagehide', () => {
  clearTimeout(routeTimer);
  root.classList.remove('route-leaving', 'route-arriving');
});

document.querySelector<HTMLFormElement>('#enquiry')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const body = `Name: ${fields.get('name')}\nEmail: ${fields.get('email')}\n\n${fields.get('message')}`;
  window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent('Project enquiry')}&body=${encodeURIComponent(body)}`;
  document.querySelector('#form-status')!.textContent =
    'Your email draft is ready. If your email application did not open, use the email link on this page.';
});
