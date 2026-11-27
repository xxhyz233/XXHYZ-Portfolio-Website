(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const loaderImage = new URL('../media/images/branding/preloader.webp', document.currentScript.src);

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

    const leadImage = document.querySelector('main img[fetchpriority="high"]');
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

  function initViewportVideos(videos) {
    const visible = new Set();
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

  const videos = document.querySelectorAll('[data-viewport-autoplay], .cg-project-video, .cg-about-showreel');
  if (videos.length) initViewportVideos(videos);
})();
