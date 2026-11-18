import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

export function setupReveals() {
  gsap.registerPlugin(ScrollTrigger);
  let animation: gsap.Context | undefined;

  function clear() {
    animation?.revert();
    animation = undefined;
  }

  function sync() {
    if (document.documentElement.classList.contains('low-motion')) return clear();
    if (animation) return;
    animation = gsap.context(() => {
      function reveal(target: Element, trigger = target, extra: gsap.TweenVars = {}) {
        gsap.fromTo(target, {y: 30, clipPath: 'inset(0% 0% 100% 0%)'}, {
          y: 0, clipPath: 'inset(0% 0% 0% 0%)', ease: 'power3.out', duration: .85,
          scrollTrigger: {trigger, start: 'top 88%', once: true},
          ...extra,
        });
      }

      for (const item of document.querySelectorAll('.home-about h2, .section-heading h2, .process h2, .footer-content .big-link, .perspective blockquote')) {
        reveal(item);
      }
      for (const item of document.querySelectorAll('.project-image, .project-detail > img')) reveal(item);
      for (const item of document.querySelectorAll('.service-list details')) {
        gsap.from(item, {x: -20, opacity: .4, duration: .6, ease: 'power2.out',
          scrollTrigger: {trigger: item, start: 'top 90%', once: true}});
      }

      const hero = document.querySelector<HTMLElement>('.hero');
      if (hero) {
        function updateHero(trigger: ScrollTrigger) {
          hero!.style.setProperty('--hero-progress', String(trigger.progress));
          hero!.dataset.holdTarget = String(trigger.start + (trigger.end - trigger.start) * .55);
        }
        ScrollTrigger.create({
          trigger: hero, pin: true, start: 'top top', end: '+=145%',
          onUpdate: updateHero, onRefresh: updateHero,
        });
        animationCleanup.push(() => {
          hero.style.removeProperty('--hero-progress');
          delete hero.dataset.holdTarget;
        });
      }
      const about = document.querySelector('.home-about');
      if (about) {
        gsap.fromTo(about.querySelector('.body-copy'), {opacity: .4}, {
          opacity: 1, ease: 'none',
          scrollTrigger: {trigger: about, start: 'top 80%', end: 'center 50%', scrub: .35},
        });
      }
      const vision = document.querySelector('.vision');
      if (vision) {
        gsap.to(vision.querySelectorAll('.vision-stripes i'), {
          scaleY: 1, stagger: {each: .065, from: 'end'}, ease: 'none',
          scrollTrigger: {trigger: vision, start: 'center 38%', end: 'bottom 25%', scrub: .35},
        });
      }
      for (const value of document.querySelectorAll<HTMLElement>('[data-value]')) {
        const final = value.textContent!;
        const count = {value: 0};
        gsap.to(count, {
          value: Number(value.dataset.value), duration: 1.2, ease: 'power2.out',
          onUpdate: () => { value.textContent = String(Math.round(count.value)).padStart(final.length, '0'); },
          scrollTrigger: {trigger: value, start: 'top 84%', once: true},
        });
        returnTextOnRevert(value, final);
      }
      const work = document.querySelector<HTMLElement>('.work-section');
      if (work) {
        const desktop = gsap.matchMedia();
        desktop.add('(min-width: 1025px) and (min-height: 670px)', () => {
          const viewport = work.querySelector<HTMLElement>('.work-viewport')!;
          const track = work.querySelector<HTMLElement>('.projects')!;
          work.classList.add('animated-work');
          gsap.to(track, {
            x: () => -(track.scrollWidth - viewport.clientWidth), ease: 'none',
            scrollTrigger: {trigger: work, start: 'top top', end: '+=155%', pin: work,
              scrub: .6, invalidateOnRefresh: true},
          });
          const events = new AbortController();
          for (const card of track.querySelectorAll('a')) {
            const showCard = () => {
              const element = card.closest<HTMLElement>('.project')!;
              const delta = element.getBoundingClientRect().left - viewport.getBoundingClientRect().left;
              if (Math.abs(delta) < 20) return;
              const trigger = ScrollTrigger.getAll().find(item => item.trigger === work);
              if (trigger) window.scrollTo({
                top: trigger.start + (trigger.end - trigger.start) *
                  (element.offsetLeft / Math.max(1, track.scrollWidth - viewport.clientWidth)),
                behavior: 'instant',
              });
            };
            card.addEventListener('focus', showCard, {signal: events.signal});
          }
          return () => {
            events.abort();
            work.classList.remove('animated-work');
          };
        });
        animationCleanup.push(() => desktop.revert());
      }
      const service = document.querySelector<HTMLElement>('.service-stage');
      if (service) {
        const screen = service.querySelector('.service-screen')!;
        const titles = service.querySelectorAll('h2 span');
        const captions = service.querySelectorAll('.service-caption p');
        service.classList.add('animated');
        const state = {progress: 0};
        const timeline = gsap.timeline({
          scrollTrigger: {trigger: service, start: 'top top', end: '+=205%', pin: screen, scrub: .55},
          onUpdate: () => service.style.setProperty('--scene-progress', state.progress.toFixed(3)),
        });
        timeline.to(state, {progress: 1, ease: 'none', duration: 4}, 0)
          .fromTo(screen, {backgroundColor: '#dadadd', color: '#1a1a1a'},
            {backgroundColor: '#090b10', color: '#f1f0ef', duration: .5}, 0)
          .fromTo(titles, {yPercent: 42, opacity: .35},
            {yPercent: 0, opacity: 1, duration: .42, stagger: .07}, 0)
          .to(titles, {yPercent: -65, opacity: 0, duration: .45, stagger: .07}, 1);
        captions.forEach((caption, index) => {
          timeline.fromTo(caption, {autoAlpha: 0, y: 15},
            {autoAlpha: 1, y: 0, duration: .23}, 1.45 + index * .57);
          if (index < captions.length - 1) timeline.to(caption, {autoAlpha: 0, y: -10, duration: .18}, 1.85 + index * .57);
        });
        animationCleanup.push(() => {
          service.classList.remove('animated');
          service.style.removeProperty('--scene-progress');
        });
      }

      const gallery = document.querySelector('.exploration');
      if (gallery) {
        const desktop = gsap.matchMedia();
        desktop.add('(min-width: 768px) and (min-height: 620px)', () => {
          const cards = gallery.querySelectorAll('.exploration-panels a');
          gsap.timeline({
            scrollTrigger: {trigger: gallery, start: 'top top', end: '+=95%',
              pin: gallery.querySelector('.exploration-stage'), scrub: .6},
          })
            .fromTo(cards, {xPercent: i => -78 + i * 14, yPercent: i => 100 - i * 32,
              rotationY: i => 44 - i * 12, rotationZ: i => -18 + i * 5, z: -250},
            {xPercent: i => -12 + i * 8, yPercent: i => 16 - i * 12,
              rotationY: i => 18 - i * 13, rotationZ: 0, z: -100, duration: .56, ease: 'none'})
            .to(cards, {xPercent: 0, yPercent: 0, rotationY: 0, z: 0, duration: .44, ease: 'none'});
        });
        animationCleanup.push(() => desktop.revert());
      }
      return () => animationCleanup.splice(0).forEach(cleanup => cleanup());
    });
  }

  const animationCleanup: Array<() => void> = [];
  function returnTextOnRevert(target: HTMLElement, text: string) {
    animationCleanup.push(() => { target.textContent = text; });
  }

  window.addEventListener('motionchange', sync);
  window.addEventListener('pagehide', event => { if (!event.persisted) clear(); });
  window.addEventListener('pageshow', event => { if (event.persisted && animation) ScrollTrigger.refresh(); });
  void document.fonts.ready.then(() => { if (animation) ScrollTrigger.refresh(); });
  sync();
}
