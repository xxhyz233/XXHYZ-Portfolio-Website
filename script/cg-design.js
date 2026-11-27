function isPlainClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey &&
    !event.shiftKey && !event.altKey && !event.defaultPrevented;
}

let youtubeApi;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youtubeApi) {
    youtubeApi = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.addEventListener('error', reject, { once: true });
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      document.head.append(script);
    });
  }
  return youtubeApi;
}

document.querySelectorAll('a[data-embed], a[data-youtube-id], a[data-video-src]').forEach((trailerPoster) => {
  trailerPoster.addEventListener('click', (event) => {
    const { embed, youtubeId, videoSrc, playerTitle } = trailerPoster.dataset;
    if (!isPlainClick(event) || !(embed || youtubeId || videoSrc) ||
        (youtubeId && location.origin === 'null')) return;

    event.preventDefault();
    if (videoSrc) {
      const video = document.createElement('video');
      video.setAttribute('aria-label', playerTitle);
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      const poster = trailerPoster.querySelector('img');
      video.poster = poster.currentSrc || poster.dataset.mediaSrc || poster.src;
      video.src = videoSrc;
      trailerPoster.replaceWith(video);
      video.focus({ preventScroll: true });
      video.play().catch(() => {});
      return;
    }

    const player = document.createElement('iframe');
    player.title = playerTitle;
    player.tabIndex = 0;
    player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    player.allowFullscreen = true;
    if (youtubeId) {
      const url = new URL(`https://www.youtube.com/embed/${youtubeId}`);
      url.search = new URLSearchParams({ autoplay: '1', enablejsapi: '1', origin: location.origin });
      player.src = url.href;
    } else {
      player.src = embed;
    }
    trailerPoster.replaceWith(player);
    player.focus({ preventScroll: true });

    if (youtubeId) {
      const openOnYouTube = () => {
        if (!player.isConnected) return;
        delete trailerPoster.dataset.youtubeId;
        trailerPoster.setAttribute('aria-label', `Watch ${playerTitle} on YouTube`);
        player.replaceWith(trailerPoster);
        trailerPoster.focus({ preventScroll: true });
      };
      loadYouTubeApi().then((api) => {
        new api.Player(player, { events: { onError: openOnYouTube } });
      }).catch(openOnYouTube);
    }
  });
});

const lightbox = document.querySelector('.cg-design-lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  let enlargedImage = lightbox.querySelector('img');
  const galleryCount = lightbox.querySelector('[data-gallery-count]');
  const imageStatus = document.createElement('span');
  imageStatus.className = 'cg-project-lightbox-status';
  imageStatus.setAttribute('role', 'status');
  lightbox.append(imageStatus);

  let gallery = [];
  let activeIndex = 0;
  let activeImage;

  async function showStill(still) {
    const thumbnail = still.querySelector('img');
    const fullImage = new Image();
    activeImage?.removeAttribute('src');
    activeImage = fullImage;
    enlargedImage.alt = thumbnail.alt;
    enlargedImage.src = thumbnail.currentSrc || thumbnail.dataset.mediaSrc || thumbnail.src;
    imageStatus.textContent = 'Loading full image…';
    if (galleryCount) galleryCount.textContent = `${activeIndex + 1} / ${gallery.length}`;

    fullImage.alt = thumbnail.alt;
    fullImage.src = still.href;
    try {
      await fullImage.decode();
    } catch {
      if (activeImage === fullImage && lightbox.open) {
        activeImage = undefined;
        imageStatus.textContent = 'Full image unavailable';
      }
      return;
    }
    if (activeImage !== fullImage || !lightbox.open) return;

    enlargedImage.replaceWith(fullImage);
    enlargedImage = fullImage;
    activeImage = undefined;
    imageStatus.textContent = '';
  }

  function stepGallery(step) {
    activeIndex = (activeIndex + step + gallery.length) % gallery.length;
    showStill(gallery[activeIndex]);
  }

  document.querySelectorAll('.cg-design-still').forEach((still) => {
    still.addEventListener('click', (event) => {
      if (!isPlainClick(event)) return;

      event.preventDefault();
      if (galleryCount) {
        gallery = Array.from(still.closest('ul').querySelectorAll('.cg-design-still'));
        activeIndex = gallery.indexOf(still);
      }
      lightbox.showModal();
      showStill(still);
    });
  });

  if (galleryCount) {
    lightbox.querySelectorAll('[data-gallery-step]').forEach((button) => {
      button.addEventListener('click', () => stepGallery(Number(button.dataset.galleryStep)));
    });

    lightbox.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      stepGallery(event.key === 'ArrowLeft' ? -1 : 1);
    });
  }

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener('close', () => {
    if (lightbox.open) return;
    activeImage?.removeAttribute('src');
    activeImage = undefined;
    enlargedImage.removeAttribute('src');
    imageStatus.textContent = '';
  });
}

if ('IntersectionObserver' in window) {
  document.querySelectorAll('.cg-project-video').forEach((video) => {
    const preview = document.createElement('div');
    preview.className = 'cg-project-video-preview';
    const activation = document.createElement('button');
    activation.type = 'button';
    activation.setAttribute('aria-label', `Show video controls: ${video.getAttribute('aria-label')}`);

    video.before(preview);
    preview.append(video, activation);
    video.controls = false;

    activation.addEventListener('click', () => {
      video.controls = true;
      video.focus({ preventScroll: true });
      activation.remove();
      if (video.paused) video.play().catch(() => {});
    }, { once: true });
  });
}
