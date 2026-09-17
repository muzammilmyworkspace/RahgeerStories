/* =========================================================
   RAHGEER STORIES  |  main.js
   GSAP + ScrollTrigger + Draggable + Lenis
   ========================================================= */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, Draggable);

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const isDesktop = () => window.innerWidth > 1024;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!REDUCED && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (target, offset = -70) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  /* ---------- Preloader ---------- */
  const preloader = $('#preloader');
  const seen = sessionStorage.getItem('rahgeer_loaded');
  const startSite = () => {
    document.body.classList.remove('is-loading');
    heroIntro();
  };
  if (preloader && !seen && !REDUCED) {
    document.body.classList.add('is-loading');
    if (lenis) lenis.stop();
    const count = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        preloader.style.display = 'none';
        sessionStorage.setItem('rahgeer_loaded', '1');
        if (lenis) lenis.start();
        startSite();
      }
    });
    tl.to('.preloader__logo', { opacity: 1, scale: 1, duration: .7, ease: 'expo.out' })
      .to('.preloader__line span', { width: '100%', duration: 1, ease: 'power2.inOut' }, '-=.3')
      .to(count, { v: 100, duration: 1, ease: 'power2.inOut', onUpdate: () => { $('.preloader__count').textContent = Math.round(count.v); } }, '<')
      .to('.preloader__content', { opacity: 0, y: -20, duration: .35, ease: 'power2.in' })
      .to('.preloader__panel--top', { yPercent: -100, duration: .9, ease: 'expo.inOut' }, '-=.1')
      .to('.preloader__panel--bottom', { yPercent: 100, duration: .9, ease: 'expo.inOut' }, '<');
  } else {
    if (preloader) preloader.style.display = 'none';
    window.addEventListener('load', startSite, { once: true });
    if (document.readyState === 'complete') startSite();
  }

  /* ---------- Contour line background ---------- */
  (function contour() {
    const canvas = $('#contour');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr, lines = 26, t = 0, raf;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let scrollY = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      lines = window.innerWidth < 768 ? 16 : 26;
    };
    const noise = (x, y, tt) =>
      Math.sin(x * 0.0021 + tt * 0.35 + y * 0.003) * 38 +
      Math.sin(x * 0.0057 - tt * 0.22 + y * 0.0015) * 22 +
      Math.cos(x * 0.0011 + y * 0.0062 + tt * 0.18) * 30;
    const draw = () => {
      t += REDUCED ? 0 : 0.008;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      ctx.clearRect(0, 0, w, h);
      const inHero = scrollY < window.innerHeight * 0.9;
      const heroMix = Math.max(0, 1 - scrollY / (window.innerHeight * 0.9));
      const gap = h / (lines - 2);
      const step = Math.max(10, Math.floor(w / 110));
      for (let i = 0; i < lines; i++) {
        const baseY = i * gap - (scrollY * dpr * 0.08) % gap;
        const glow = inHero && (i === 9 || i === 15);
        ctx.beginPath();
        for (let x = 0; x <= w + step; x += step) {
          let y = baseY + noise(x / dpr, i * 90, t) * dpr;
          const dx = x - mouse.x * dpr, dy = y - mouse.y * dpr;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 240 * dpr) { const f = (1 - d / (240 * dpr)); y -= f * f * 40 * dpr * Math.sign(dy || 1); }
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        if (glow) {
          ctx.strokeStyle = `rgba(243,156,43,${0.10 + 0.18 * heroMix})`;
          ctx.lineWidth = 1.4 * dpr;
          ctx.shadowColor = 'rgba(243,156,43,.8)';
          ctx.shadowBlur = 12 * heroMix;
        } else {
          ctx.strokeStyle = `rgba(143,211,232,${0.07 + (i % 3 === 0 ? 0.03 : 0)})`;
          ctx.lineWidth = 1 * dpr;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => { mouse.tx = e.clientX; mouse.ty = e.clientY; }, { passive: true });
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    if (lenis) lenis.on('scroll', (e) => { scrollY = e.scroll; });
    document.addEventListener('visibilitychange', () => { document.hidden ? cancelAnimationFrame(raf) : draw(); });
    draw();
  })();

  /* ---------- Custom cursor ---------- */
  (function cursor() {
    if (isTouch || REDUCED) return;
    document.body.classList.add('no-cursor');
    const c = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    const pos = { x: -100, y: -100 }, ringPos = { x: -100, y: -100 };
    window.addEventListener('mousemove', (e) => { pos.x = e.clientX; pos.y = e.clientY; }, { passive: true });
    gsap.ticker.add(() => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      dot.style.transform = `translate(${pos.x}px,${pos.y}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${ringPos.x}px,${ringPos.y}px) translate(-50%,-50%)`;
    });
    document.addEventListener('mouseover', (e) => {
      const lbl = e.target.closest('[data-cursor]');
      const inter = e.target.closest('a, button, .pchip, .chip, .creator, .postcard');
      if (lbl) { label.textContent = lbl.dataset.cursor; c.classList.add('is-label'); c.classList.remove('is-hover'); }
      else if (inter) { c.classList.add('is-hover'); c.classList.remove('is-label'); }
      else c.classList.remove('is-hover', 'is-label');
    });
  })();

  /* ---------- Nav ---------- */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  const menuBg = $('.menu__bg img');
  const onScroll = (y) => {
    nav.classList.toggle('is-scrolled', y > 80);
    const mb = $('#mobileBar');
    if (mb) mb.classList.toggle('is-on', y > window.innerHeight * 0.8 && !document.body.classList.contains('form-open'));
    const p = $('#scrollProgress');
    if (p) { const max = document.documentElement.scrollHeight - window.innerHeight; p.style.transform = `scaleX(${Math.min(1, y / max)})`; }
  };
  window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  if (lenis) lenis.on('scroll', (e) => onScroll(e.scroll));

  const closeMenu = () => { menu.classList.remove('is-open'); burger.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); if (lenis) lenis.start(); };
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open); burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  $$('.menu__links a').forEach((a) => {
    a.addEventListener('mouseenter', () => { if (a.dataset.img) { menuBg.style.opacity = 0; setTimeout(() => { menuBg.src = a.dataset.img; menuBg.style.opacity = 1; }, 200); } });
  });

  /* Anchor scroll + form presets */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-scroll]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    if (menu.classList.contains('is-open')) closeMenu();
    if (a.dataset.presetDest || a.dataset.presetWho) applyPreset(a.dataset.presetDest, a.dataset.presetWho);
    scrollToEl(href === '#top' ? document.body : href, href === '#top' ? 0 : -70);
  });

  /* Nav goes dark over light sections */
  $$('.section--light').forEach((sec) => {
    ScrollTrigger.create({ trigger: sec, start: 'top 70px', end: 'bottom 70px', onToggle: (self) => nav.classList.toggle('is-light', self.isActive) });
  });

  /* Active nav link */
  $$('main section[id]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 45%', end: 'bottom 45%',
      onToggle: (self) => { if (self.isActive) $$('.nav__links a').forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + sec.id)); }
    });
  });

  /* ---------- Split text ---------- */
  $$('.split').forEach((el) => {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'word';
            const inner = document.createElement('span'); inner.textContent = part; w.appendChild(inner);
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });

  const revealSplit = (el, delay = 0) => gsap.to(el.querySelectorAll('.word > span'), { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: 0.035, delay, overwrite: true });

  function heroIntro() {
    const hero = $('#hero');
    if (!hero) return;
    if (REDUCED) { gsap.set(hero.querySelectorAll('.reveal, .word > span'), { clearProps: 'all', opacity: 1 }); $$('.count', hero).forEach((el) => { el.textContent = el.dataset.to; }); return; }
    revealSplit(hero.querySelector('.split'), 0.1);
    gsap.to(hero.querySelectorAll('.reveal'), { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.12, delay: 0.35 });
    gsap.from('.nav__inner', { y: -30, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.2 });
    animateCounters(hero);
  }

  /* Section reveals */
  if (!REDUCED) {
    $$('.split').forEach((el) => { if (el.closest('#hero')) return; ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => revealSplit(el) }); });
    $$('.reveal').forEach((el) => { if (el.closest('#hero')) return; ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }) }); });
    $$('.reveal-img').forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => { gsap.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'expo.out' }); gsap.to(el.querySelector('img'), { scale: 1, duration: 1.8, ease: 'expo.out' }); } });
    });
    /* Hero parallax */
    gsap.to('.hero__content', { yPercent: 18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.final__media img', { yPercent: 10, scale: 1.02, ease: 'none', scrollTrigger: { trigger: '#final', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.planner__bg img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#planner', start: 'top bottom', end: 'bottom top', scrub: true } });
  } else {
    gsap.set('.reveal, .reveal-img, .word > span', { clearProps: 'all' });
  }

  /* ---------- Hero stories (auto cycling destination slides) ---------- */
  (function heroStories() {
    const slides = $$('.hero__slide'), segs = $$('#heroStories span');
    if (slides.length < 2) return;
    const place = $('#heroPlace'), sub = $('#heroSub'), idx = $('#heroIdx');
    const DUR = 6500; let i = 0, timer = null;
    document.documentElement.style.setProperty('--story-dur', DUR + 'ms');
    const setText = (el, txt) => {
      if (REDUCED) { el.textContent = txt; return; }
      gsap.to(el, { yPercent: 110, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => { el.textContent = txt; gsap.fromTo(el, { yPercent: -110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: 'expo.out' }); } });
    };
    const go = (n) => {
      n = (n + slides.length) % slides.length;
      slides[i].classList.remove('is-active');
      i = n;
      const s = slides[i];
      s.classList.add('is-active');
      segs.forEach((seg, k) => { seg.classList.remove('is-active', 'is-done'); if (k < i) seg.classList.add('is-done'); });
      void segs[i].offsetWidth; /* restart the fill animation */
      segs[i].classList.add('is-active');
      setText(place, s.dataset.place); setText(sub, s.dataset.sub);
      idx.textContent = String(i + 1).padStart(2, '0');
      clearTimeout(timer);
      if (!REDUCED) timer = setTimeout(() => go(i + 1), DUR);
    };
    segs.forEach((seg) => seg.addEventListener('click', () => go(parseInt(seg.dataset.go))));
    if (!REDUCED) timer = setTimeout(() => go(1), DUR);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else if (!REDUCED) timer = setTimeout(() => go(i + 1), 1500); });
    /* Mouse parallax depth */
    if (!isTouch && !REDUCED) {
      const wrap = $('#heroSlides'), content = $('.hero__content');
      $('#hero').addEventListener('mousemove', (e) => {
        const dx = (e.clientX / window.innerWidth - .5), dy = (e.clientY / window.innerHeight - .5);
        gsap.to(wrap, { x: dx * -28, y: dy * -18, duration: 1.2, ease: 'power3.out' });
        gsap.to(content, { x: dx * 10, y: dy * 6, duration: 1.2, ease: 'power3.out' });
      });
    }
  })();

  /* ---------- Counters ---------- */
  function animateCounters(scope = document) {
    $$('.count', scope).forEach((el) => {
      const to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || 0);
      const obj = { v: 0 };
      gsap.to(obj, { v: to, duration: 2, ease: 'power3.out', delay: 0.8, onUpdate: () => { el.textContent = obj.v.toFixed(dec); } });
    });
  }

  /* ---------- Rotating word ---------- */
  (function rot() {
    const words = $$('#rotWord b'); if (!words.length) return;
    let i = 0;
    gsap.set(words[0], { y: 0, opacity: 1 });
    setInterval(() => {
      const cur = words[i], next = words[(i + 1) % words.length];
      gsap.to(cur, { y: '-110%', opacity: 0, duration: .6, ease: 'expo.inOut' });
      gsap.fromTo(next, { y: '110%', opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'expo.inOut' });
      i = (i + 1) % words.length;
    }, 2200);
  })();

  /* ---------- Destinations horizontal ---------- */
  (function destinations() {
    const track = $('#destTrack'), pin = $('.dest__pin'); if (!track) return;
    const panels = $$('.dest__panel', track);
    const setActive = () => {
      const vw = window.innerWidth / 2; let best = null, bd = 1e9;
      panels.forEach((p) => { const r = p.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - vw); if (d < bd) { bd = d; best = p; } });
      panels.forEach((p) => p.classList.toggle('is-active', p === best));
    };
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1025px)', () => {
      if (REDUCED) return;
      const getScroll = () => track.scrollWidth - window.innerWidth + 40;
      gsap.to(track, {
        x: () => -getScroll(), ease: 'none',
        scrollTrigger: { trigger: pin, start: 'top 80px', end: () => '+=' + getScroll(), pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: setActive }
      });
    });
    pin.addEventListener('scroll', setActive, { passive: true });
    setActive();
  })();

  /* ---------- Trip style tabs ---------- */
  (function tabs() {
    const tabs = $$('.styles__tab'), imgs = $$('.styles__media img'), panels = $$('.styles__panel');
    const go = (i) => { tabs.forEach((t, k) => t.classList.toggle('is-active', k === i)); imgs.forEach((m, k) => m.classList.toggle('is-active', k === i)); panels.forEach((p, k) => p.classList.toggle('is-active', k === i)); };
    tabs.forEach((t, i) => { t.addEventListener('click', () => go(i)); if (!isTouch) t.addEventListener('mouseenter', () => go(i)); });
  })();

  /* ---------- Departure board ---------- */
  (function board() {
    const rows = $$('.board__row:not(.board__row--head)'); if (!rows.length) return;
    $$('.flip').forEach((f) => {
      const txt = f.dataset.text || ''; f.innerHTML = '';
      txt.split('').forEach((ch) => { const s = document.createElement('span'); if (ch === ' ') { s.className = 'space'; s.innerHTML = '&nbsp;'; } else s.textContent = ch; f.appendChild(s); });
    });
    const play = () => {
      rows.forEach((r, ri) => { gsap.to(r.querySelectorAll('.flip span'), { y: 0, opacity: 1, duration: .5, ease: 'back.out(1.6)', stagger: 0.012, delay: ri * 0.08, overwrite: true }); });
    };
    if (REDUCED) gsap.set('.flip span', { y: 0, opacity: 1 });
    else ScrollTrigger.create({ trigger: '#board', start: 'top 85%', once: true, onEnter: play });
    $$('.board__filters .chip').forEach((c) => c.addEventListener('click', () => {
      $$('.board__filters .chip').forEach((x) => x.classList.remove('is-active')); c.classList.add('is-active');
      const f = c.dataset.filter;
      rows.forEach((r) => r.classList.toggle('is-hidden', f !== 'all' && !r.dataset.cat.split(' ').includes(f)));
      ScrollTrigger.refresh();
    }));
  })();

  /* ---------- How it works path ---------- */
  (function how() {
    const path = $('#howPathGlow'); if (!path) return;
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    if (REDUCED) { gsap.set(path, { strokeDashoffset: 0 }); return; }
    gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.how__path', start: 'top 80%', end: 'bottom 55%', scrub: 0.6 } });
    $$('.how__marker').forEach((m) => gsap.from(m, { scale: 0, ease: 'back.out(2)', duration: .7, scrollTrigger: { trigger: m, start: 'top 85%', once: true } }));
  })();

  /* ---------- Film reel ---------- */
  (function reel() {
    const track = $('#reelTrack'), pin = $('.reel__pin'); if (!track) return;
    const frames = $$('.reel__frame', track);
    const setCenter = () => {
      const vw = window.innerWidth / 2; let best = null, bd = 1e9;
      frames.forEach((f) => { const r = f.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - vw); if (d < bd) { bd = d; best = f; } });
      frames.forEach((f) => f.classList.toggle('is-center', f === best));
    };
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1025px)', () => {
      if (REDUCED) return;
      const getScroll = () => track.scrollWidth - window.innerWidth + 40;
      gsap.to(track, { x: () => -getScroll(), ease: 'none', scrollTrigger: { trigger: pin, start: 'top 90px', end: () => '+=' + getScroll(), pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: setCenter } });
    });
    pin.addEventListener('scroll', setCenter, { passive: true });
    setCenter();
    /* Lightbox */
    const lb = $('#lightbox'), img = $('#lbImg'), cap = $('#lbCap'), by = $('#lbBy'); let idx = 0;
    const show = (i) => { idx = (i + frames.length) % frames.length; const f = frames[idx]; img.src = f.querySelector('img').src.replace('w=900', 'w=1600'); img.alt = f.querySelector('img').alt; cap.textContent = f.dataset.cap; by.textContent = f.dataset.by; };
    const open = (i) => { show(i); lb.classList.add('is-on'); lb.setAttribute('aria-hidden', 'false'); if (lenis) lenis.stop(); };
    const close = () => { lb.classList.remove('is-on'); lb.setAttribute('aria-hidden', 'true'); if (lenis) lenis.start(); };
    frames.forEach((f, i) => f.addEventListener('click', () => open(i)));
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => show(idx - 1));
    $('#lbNext').addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => { if (!lb.classList.contains('is-on')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
    let sx = 0; lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(dx < 0 ? idx + 1 : idx - 1); });
  })();

  /* ---------- Postcards ---------- */
  (function postcards() {
    const pile = $('#pile'); if (!pile) return;
    let z = 10;
    $$('.postcard', pile).forEach((card) => {
      Draggable.create(card, {
        type: 'x,y', bounds: pile, inertia: false, edgeResistance: 0.8,
        onPress() { card.style.zIndex = ++z; },
        onClick() { card.classList.toggle('is-flipped'); }
      });
      if (!REDUCED) gsap.from(card, { y: 80, opacity: 0, rotation: () => gsap.utils.random(-20, 20), duration: 1, ease: 'expo.out', scrollTrigger: { trigger: pile, start: 'top 80%', once: true }, delay: gsap.utils.random(0, .4) });
    });
  })();

  /* ---------- Creators orbit ---------- */
  (function orbit() {
    const ring = $('#orbitRing'), card = $('#creatorCard'); if (!ring) return;
    const set = (c) => { $('.creator-card__name').textContent = c.dataset.name; $('.creator-card__flag').innerHTML = `<img class="flag" src="https://flagcdn.com/w40/${c.dataset.flag}.png" alt="">`; $('.creator-card__handle').textContent = c.dataset.handle; $('.creator-card__quote').textContent = '“' + c.dataset.quote + '”'; $('.creator-card__fol').textContent = c.dataset.fol + ' followers'; gsap.fromTo(card, { y: 8, opacity: .6 }, { y: 0, opacity: 1, duration: .4, ease: 'expo.out' }); };
    $$('.creator', ring).forEach((c) => {
      c.addEventListener('mouseenter', () => { ring.classList.add('is-paused'); set(c); });
      c.addEventListener('mouseleave', () => ring.classList.remove('is-paused'));
      c.addEventListener('click', () => { ring.classList.toggle('is-paused'); set(c); });
    });
    set($$('.creator', ring)[0]);
  })();

  /* ---------- Accordions ---------- */
  $$('.check__head').forEach((b) => b.addEventListener('click', () => b.parentElement.classList.toggle('is-open')));
  $$('.faq__q').forEach((b) => b.addEventListener('click', () => {
    const item = b.parentElement, open = item.classList.contains('is-open');
    $$('.faq__item').forEach((i) => i.classList.remove('is-open'));
    if (!open) item.classList.add('is-open');
    setTimeout(() => ScrollTrigger.refresh(), 520);
  }));

  /* ---------- Testimonials stack ---------- */
  (function stack() {
    const cards = $$('.tcard'); if (!cards.length || REDUCED) return;
    cards.forEach((c, i) => {
      if (i === cards.length - 1) return;
      gsap.to(c, { scale: 0.92, opacity: 0.55, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top 80%', end: 'top 110px', scrub: true } });
    });
  })();

  /* ---------- Magnetic buttons + ripple ---------- */
  (function magnetic() {
    if (isTouch || REDUCED) return;
    $$('[data-magnetic]').forEach((btn) => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => { const r = btn.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; gsap.to(btn, { x: x * strength, y: y * strength, duration: .4, ease: 'power3.out' }); });
      btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }));
    });
  })();
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn--primary'); if (!btn) return;
    const r = btn.getBoundingClientRect(); const s = document.createElement('span'); s.className = 'ripple';
    const size = Math.max(r.width, r.height); s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    btn.appendChild(s); setTimeout(() => s.remove(), 650);
  });

  /* ---------- Trip planner form ---------- */
  const form = $('#tripForm');
  const F = (n) => form.elements[n];
  const state = { destination: [], who: '', duration: '', vibe: [] };
  let step = 0;
  const steps = $$('.form__step', form), markers = $$('.form__markers span', form), pathEl = $('#formPath');
  const prevBtn = $('#formPrev'), nextBtn = $('#formNext');
  const goStep = (n) => {
    steps.forEach((s, i) => { s.classList.toggle('is-active', i === n); s.classList.toggle('is-prev', i < n); s.classList.remove('has-error'); });
    markers.forEach((m, i) => { m.classList.toggle('is-active', i === n); m.classList.toggle('is-done', i < n); });
    gsap.to(pathEl, { strokeDashoffset: 1 - n / (steps.length - 1), duration: .6, ease: 'expo.out' });
    $('#stepNow').textContent = n + 1;
    prevBtn.disabled = n === 0;
    nextBtn.querySelector('span').textContent = n === steps.length - 1 ? 'Send My Plan Request' : 'Continue';
    step = n;
  };
  $$('.chips', form).forEach((group) => {
    const name = group.dataset.name, multi = group.dataset.multi === 'true';
    group.addEventListener('click', (e) => {
      const chip = e.target.closest('.pchip'); if (!chip) return;
      if (multi) { chip.classList.toggle('is-on'); state[name] = $$('.pchip.is-on', group).map((c) => c.dataset.val); }
      else { $$('.pchip', group).forEach((c) => c.classList.remove('is-on')); chip.classList.add('is-on'); state[name] = chip.dataset.val; }
      chip.closest('.form__step').classList.remove('has-error');
    });
  });
  $$('[data-step-btn]', form).forEach((b) => b.addEventListener('click', () => { const inp = F('travelers'); inp.value = Math.min(100, Math.max(1, parseInt(inp.value || 1) + parseInt(b.dataset.stepBtn))); }));
  const validate = (n) => {
    if (n === 0) return state.destination.length > 0;
    if (n === 1) return !!state.who;
    if (n === 2) return !!F('month').value && !!state.duration;
    if (n === 3) return state.vibe.length > 0;
    if (n === 4) return F('name').value.trim().length > 1 && F('phone').value.replace(/\D/g, '').length >= 10;
    return true;
  };
  nextBtn.addEventListener('click', () => {
    if (!validate(step)) { steps[step].classList.add('has-error'); gsap.fromTo(steps[step], { x: -6 }, { x: 0, duration: .4, ease: 'elastic.out(1,.3)' }); return; }
    if (step < steps.length - 1) goStep(step + 1); else submit();
  });
  prevBtn.addEventListener('click', () => goStep(step - 1));
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); nextBtn.click(); } });
  const buildMessage = () => [
    `Hi Rahgeer, I want to plan a trip.`,
    `Destination: ${state.destination.join(', ')}`,
    `Travelers: ${state.who}, ${F('travelers').value} people`,
    `When: ${F('month').value}, ${state.duration}`,
    `Vibe: ${state.vibe.join(', ')}`,
    `Name: ${F('name').value.trim()}`,
    `WhatsApp: ${F('phone').value.trim()}`,
    F('email').value ? `Email: ${F('email').value.trim()}` : '',
    F('notes').value ? `Notes: ${F('notes').value.trim()}` : ''
  ].filter(Boolean).join('\n');
  function submit() {
    const payload = { ...state, travelers: F('travelers').value, month: F('month').value, name: F('name').value, phone: F('phone').value, email: F('email').value, notes: F('notes').value, source: location.href, at: new Date().toISOString() };
    /* Wire this to your backend, Formspree, Google Sheet or CRM. */
    try { fetch(form.dataset.endpoint || '/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {}); } catch (e) {}
    console.info('[Rahgeer inquiry]', payload);
    $('#successWa').href = 'https://wa.me/923367244337?text=' + encodeURIComponent(buildMessage());
    $('#formSuccess').classList.add('is-on');
    gsap.to('#formPath', { strokeDashoffset: 0, duration: .5 });
    gsap.fromTo('.success__flag', { strokeDashoffset: 140 }, { strokeDashoffset: 0, duration: 1.2, ease: 'expo.out', delay: .2 });
    gsap.from('.form__success > *', { y: 20, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out' });
  }
  function applyPreset(dest, who) {
    if (dest) { const g = $('.chips[data-name="destination"]'); $$('.pchip', g).forEach((c) => { if (c.dataset.val === dest) { c.classList.add('is-on'); } }); state.destination = $$('.pchip.is-on', g).map((c) => c.dataset.val); }
    if (who) { const g = $('.chips[data-name="who"]'); $$('.pchip', g).forEach((c) => c.classList.toggle('is-on', c.dataset.val === who)); state.who = who; }
    if (dest && !who) goStep(1); else if (dest && who) goStep(2); else if (who) goStep(0);
  }
  goStep(0);

  /* ---------- WhatsApp float, mobile bar, popup, misc forms ---------- */
  (function wa() {
    const tip = $('#waTip'); if (!tip) return;
    let dismissed = false; try { dismissed = localStorage.getItem('rahgeer_wa_tip') === '1'; } catch (e) {}
    if (!dismissed) { setTimeout(() => tip.classList.add('is-on'), 4000); setTimeout(() => tip.classList.remove('is-on'), 14000); }
    $('#waTipClose').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); tip.classList.remove('is-on'); try { localStorage.setItem('rahgeer_wa_tip', '1'); } catch (err) {} });
  })();
  (function popup() {
    const pop = $('#popup'); if (!pop || isTouch) return;
    let shown = sessionStorage.getItem('rahgeer_popup') === '1';
    const open = () => { if (shown || $('#formSuccess').classList.contains('is-on')) return; shown = true; sessionStorage.setItem('rahgeer_popup', '1'); pop.classList.add('is-on'); pop.setAttribute('aria-hidden', 'false'); };
    const close = () => { pop.classList.remove('is-on'); pop.setAttribute('aria-hidden', 'true'); };
    setTimeout(open, 40000);
    document.addEventListener('mouseleave', (e) => { if (e.clientY <= 0) open(); });
    $('#popupClose').addEventListener('click', close);
    pop.addEventListener('click', (e) => { if (e.target === pop) close(); });
    $('#popupForm').addEventListener('submit', (e) => { e.preventDefault(); const n = e.target.querySelector('input').value; window.open('https://wa.me/923367244337?text=' + encodeURIComponent(`Hi Rahgeer, please send me the Gilgit Baltistan trip planning checklist. My number: ${n}`), '_blank'); close(); });
  })();
  const alertForm = $('#alertForm');
  if (alertForm) alertForm.addEventListener('submit', (e) => { e.preventDefault(); const n = $('#alertPhone').value; window.open('https://wa.me/923367244337?text=' + encodeURIComponent(`Hi Rahgeer, please add me to departure alerts. My number: ${n}`), '_blank'); alertForm.reset(); });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Debug helper: index.html?to=sectionId jumps to a section ---------- */
  const qp = new URLSearchParams(location.search), jump = qp.get('to'), only = qp.get('only');
  if (jump) window.addEventListener('load', () => setTimeout(() => { const el = document.getElementById(jump); if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 70; lenis ? lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y); } }, 600));
  if (only) { $$('main > section, .marquee-wrap, .footer').forEach((s) => { if (s.id !== only) s.style.display = 'none'; }); const t = document.getElementById(only); if (t) t.style.paddingTop = '100px'; }

  /* ---------- Refresh after images/fonts ---------- */
  window.addEventListener('load', () => setTimeout(() => ScrollTrigger.refresh(), 300));
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
