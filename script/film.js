const preloader = document.getElementById('preloader');
const mainContent = document.getElementById('main-content');
let navigationTimer;

// Use the portfolio's existing preloader and one-second page transition.
window.addEventListener('load', () => {
  preloader.classList.add('fade-out');
  mainContent.classList.add('fade-in');
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    clearTimeout(navigationTimer);
    preloader.style.removeProperty('opacity');
    mainContent.style.removeProperty('opacity');
  }
});

function isPlainClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey &&
    !event.shiftKey && !event.altKey && !event.defaultPrevented;
}

document.querySelectorAll('.film-nav a, .film-card, .film-back, .film-footer .film-wordmark')
  .forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!isPlainClick(event)) return;

      event.preventDefault();
      preloader.style.opacity = '1';
      mainContent.style.opacity = '0';
      clearTimeout(navigationTimer);
      navigationTimer = setTimeout(() => {
        window.location.href = link.href;
      }, 1000);
    });
  });

const trailerPoster = document.querySelector('.film-trailer-poster');
if (trailerPoster) {
  trailerPoster.addEventListener('click', (event) => {
    if (!isPlainClick(event)) return;

    event.preventDefault();
    const player = document.createElement('iframe');
    player.src = trailerPoster.dataset.embed;
    player.title = 'Evanescence (Trailer)';
    player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    player.allowFullscreen = true;
    trailerPoster.replaceWith(player);
    player.focus({ preventScroll: true });
  });
}

const lightbox = document.querySelector('.film-lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const enlargedImage = lightbox.querySelector('img');

  document.querySelectorAll('.film-still').forEach((still) => {
    still.addEventListener('click', (event) => {
      if (!isPlainClick(event)) return;

      event.preventDefault();
      enlargedImage.alt = still.querySelector('img').alt;
      enlargedImage.src = still.href;
      lightbox.showModal();
    });
  });

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener('close', () => {
    enlargedImage.removeAttribute('src');
  });
}
