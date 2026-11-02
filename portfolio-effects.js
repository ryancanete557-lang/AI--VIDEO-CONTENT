/* Interactive portrait + scroll reveals, with reduced-motion support. */
(() => {
  const portrait = document.querySelector('.hero-grid > .profile');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!portrait) return;
  const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let tx = 0, ty = 0, sx = 0, raf = 0;
  function paint() {
    raf = 0;
    if (reduceMotion.matches) {
      portrait.style.setProperty('--mouse-x','0deg');
      portrait.style.setProperty('--mouse-y','0deg');
      portrait.style.setProperty('--scroll-y','0px');
      return;
    }
    portrait.style.setProperty('--mouse-x', `${tx.toFixed(2)}deg`);
    portrait.style.setProperty('--mouse-y', `${ty.toFixed(2)}deg`);
    portrait.style.setProperty('--scroll-y', `${sx.toFixed(1)}px`);
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(paint); }
  // Respond across the hero, not just when hovering directly on the photo.
  const hero = document.querySelector('.hero');
  hero?.addEventListener('pointermove', (event) => {
    if (!desktopPointer.matches || reduceMotion.matches) return;
    const rect = hero.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width - .5) * 2;
    const ny = ((event.clientY - rect.top) / rect.height - .5) * 2;
    tx = Math.max(-1,Math.min(1,nx)) * 7;
    ty = Math.max(-1,Math.min(1,-ny)) * 5;
    schedule();
  }, { passive:true });
  hero?.addEventListener('pointerleave', () => { tx=0; ty=0; schedule(); });
  function onScroll() {
    if (reduceMotion.matches) { sx=0; schedule(); return; }
    const rect=portrait.getBoundingClientRect();
    const position=(window.innerHeight*.55 - rect.top) / window.innerHeight;
    sx=Math.max(-16,Math.min(22,position*17));
    schedule();
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  reduceMotion.addEventListener?.('change', () => { tx=ty=sx=0; onScroll(); });
  onScroll();

  // Section reveal: visible by default when IntersectionObserver isn't supported.
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const items=[...document.querySelectorAll('#projects .section-heading, #projects .project, #services .section-heading, #services .service, #about .container, #contact .contact')];
    const observer=new IntersectionObserver((entries) => {
      entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, {threshold:.08, rootMargin:'0px 0px -25px 0px'});
    items.forEach(el => { el.classList.add('motion-reveal'); observer.observe(el); });
    document.documentElement.classList.add('js-motion');
  }

  // Optional silent video previews on hover; clicking controls still works normally.
  document.querySelectorAll('.project video').forEach(video => {
    if (!desktopPointer.matches || reduceMotion.matches) return;
    const card=video.closest('.project');
    let startedByHover=false;
    card?.addEventListener('mouseenter', () => {
      if (!video.paused || video.seeking) return;
      video.muted=true; startedByHover=true;
      video.play().catch(() => {startedByHover=false;});
    });
    card?.addEventListener('mouseleave', () => {
      if (startedByHover) {video.pause(); video.currentTime=0; startedByHover=false;}
    });
    video.addEventListener('volumechange', () => {
      if (!video.muted) startedByHover=false;
    });
  });
})();
