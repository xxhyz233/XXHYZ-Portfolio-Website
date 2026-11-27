(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const loaderImage = new URL('../media/images/branding/preloader.webp', document.currentScript.src);
  const autoplaySelector = '[data-viewport-autoplay], .cg-project-video, .cg-about-showreel';
  const leadImage = document.querySelector(':is(main, #main-content) img[fetchpriority="high"]');

  function showInitialLoader() {
    if (reducedMotion.matches) return;

    try {
      if (sessionStorage.getItem('xxhyz:initialized')) return;
      sessionStorage.setItem('xxhyz:initialized', 'true');
    } catch {
      // Use the previous page when session storage is unavailable.
      if (document.referrer && new URL(document.referrer).origin === location.origin) return;
    }

    const loader = document.createElement('div');
    loader.className = 'site-preloader';
    loader.setAttribute('aria-hidden', 'true');
    const logo = new Image(100, 100);
    logo.alt = '';
    logo.src = loaderImage.href;
    loader.append(logo);
    document.body.append(loader);

    const earliestFinish = performance.now() + 220;
    let fadeTimer;

    function finish() {
      clearTimeout(deadline);
      clearTimeout(fadeTimer);
      leadImage?.removeEventListener('load', finish);
      leadImage?.removeEventListener('error', finish);
      fadeTimer = setTimeout(() => {
        loader.classList.add('is-finished');
        setTimeout(() => loader.remove(), 180);
      }, Math.max(0, earliestFinish - performance.now()));
    }

    const deadline = setTimeout(finish, 900);
    if (!leadImage || leadImage.complete) {
      finish();
    } else {
      leadImage.addEventListener('load', finish);
      leadImage.addEventListener('error', finish);
    }
  }

  function initScrollFades() {
    const targets = document.querySelectorAll([
      '.cg-design-projects > li',
      '.cg-project-gallery > li',
      '.cg-project-main > :is(.cg-project-intro, .cg-project-player)',
      '.cg-project-section > :is(h2, .cg-project-festivals, .cg-project-video-preview)',
      '.cg-about-main > section',
      '#main-content > :is(h2, video, .archive-video, .hover-container)',
      '#main-content :is(.column-item:not(:has(.column-item)), .processing-column-item)',
    ].join(','));

    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting, boundingClientRect, rootBounds } of entries) {
        if (isIntersecting || boundingClientRect.top < (rootBounds?.bottom ?? innerHeight)) {
          if (target.dataset.scrollReveal === 'pending') {
            target.dataset.scrollReveal = 'visible';
          }
          observer.unobserve(target);
        } else {
          target.dataset.scrollReveal = 'pending';
        }
      }
    });

    targets.forEach((target) => observer.observe(target));
  }

  function revealImage(image) {
    image.dataset.mediaState = 'loading';
    return image.decode().then(() => {
      image.dataset.mediaState = 'ready';
    }, () => {
      image.dataset.mediaState = 'error';
    });
  }

  function initMediaLoading() {
    const leadReady = leadImage && !leadImage.complete ? revealImage(leadImage) : Promise.resolve();
    const media = document.querySelectorAll(`img[data-media-src], ${autoplaySelector}`);
    const anchors = new Map();
    const pending = new Set();
    let draining = false;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function start(item) {
      if (item instanceof HTMLVideoElement) {
        if (item.dataset.mediaPoster) {
          item.poster = item.dataset.mediaPoster;
          // Give the poster request a head start before autoplay can compete with it.
          await wait(120);
        }
        item.dispatchEvent(new Event('site-media-eligible'));
        return;
      }

      if (item.dataset.mediaSrcset) item.srcset = item.dataset.mediaSrcset;
      item.src = item.dataset.mediaSrc;
      // A stalled image can finish independently while the queue continues below it.
      await Promise.race([revealImage(item), wait(160)]);
    }

    async function drain() {
      if (draining) return;
      draining = true;
      await Promise.race([leadReady, wait(160)]);

      while (pending.size) {
        const [anchor] = Array.from(pending, (item) => [item, item.getBoundingClientRect()])
          .sort(([, a], [, b]) => a.top - b.top || a.left - b.left)[0];
        pending.delete(anchor);
        observer?.unobserve(anchor);
        await start(anchors.get(anchor));
      }

      draining = false;
    }

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) pending.add(target);
        else pending.delete(target);
      }
      drain();
    }, { rootMargin: '0px 0px 220px' }) : null;

    for (const item of media) {
      item.hidden = false;
      const anchor = item.closest(
        '.cg-design-project-media, .cg-design-still, .cg-design-trailer-frame, .cg-project-video-preview'
      ) || item;
      anchors.set(anchor, item);
      if (observer) observer.observe(anchor);
      else pending.add(anchor);
    }
    if (!observer) drain();
  }

  function initViewportVideos(videos) {
    const visible = new Set();
    const eligible = new WeakSet();
    const isManual = (video) => video.matches('.cg-project-video') && video.controls;

    function sync(video) {
      if (isManual(video)) {
        visible.delete(video);
        observer?.unobserve(video);
        return;
      }

      if (document.hidden || reducedMotion.matches) {
        video.pause();
      } else {
        if (!eligible.has(video)) return;
        if (video.dataset.src && !video.hasAttribute('src')) video.src = video.dataset.src;
        video.play().catch(() => {});
      }
    }

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
      for (const { target: video, isIntersecting } of entries) {
        if (isManual(video)) {
          visible.delete(video);
          observer.unobserve(video);
          continue;
        }
        if (isIntersecting) {
          visible.add(video);
          sync(video);
        } else {
          visible.delete(video);
          video.pause();
        }
      }
    }) : null;

    for (const video of videos) {
      video.addEventListener('playing', () => {
        video.dataset.siteFrame = '';
      }, { once: true });
      video.addEventListener('site-media-eligible', () => {
        eligible.add(video);
        if (visible.has(video)) sync(video);
      }, { once: true });
      if (observer) {
        observer.observe(video);
      } else if (video.matches('.cg-about-showreel')) {
        visible.add(video);
        sync(video);
      }
    }

    const syncVisible = () => visible.forEach(sync);
    document.addEventListener('visibilitychange', syncVisible);
    reducedMotion.addEventListener('change', syncVisible);
  }

  showInitialLoader();
  if ('IntersectionObserver' in window) initScrollFades();

  const videos = document.querySelectorAll(autoplaySelector);
  if (videos.length) initViewportVideos(videos);
  initMediaLoading();
})();
