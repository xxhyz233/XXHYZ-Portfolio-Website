const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const updatePreviews = new Map();
const previewObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  for (const { target, isIntersecting } of entries) updatePreviews.get(target)(isIntersecting);
}) : null;

document.querySelectorAll('.cg-design-project-media[data-preview]').forEach((media) => {
  const project = media.closest('.cg-design-project');
  let preview;
  let hovered = false;
  let visible = !previewObserver;

  function updatePreview() {
    const shouldPlay = visible && !document.hidden && !reducedMotion.matches &&
      (hovered || project.matches(':focus-visible'));
    if (!shouldPlay) {
      preview?.pause();
      return;
    }

    if (!preview) {
      preview = document.createElement('video');
      preview.className = 'cg-design-preview';
      preview.setAttribute('aria-hidden', 'true');
      preview.muted = true;
      preview.loop = true;
      preview.playsInline = true;
      preview.addEventListener('playing', () => {
        if (!preview.paused) preview.classList.add('is-playing');
      });
      preview.addEventListener('pause', () => preview.classList.remove('is-playing'));
      preview.addEventListener('error', () => preview.classList.remove('is-playing'));
      preview.src = media.dataset.preview;
      media.append(preview);
    }

    // The still image stays visible when playback is blocked or interrupted.
    preview.play().catch(() => {});
  }

  project.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    updatePreview();
  });
  project.addEventListener('pointerleave', () => {
    hovered = false;
    updatePreview();
  });
  project.addEventListener('focus', updatePreview);
  project.addEventListener('blur', updatePreview);
  updatePreviews.set(media, (inViewport = visible) => {
    visible = inViewport;
    updatePreview();
  });
  previewObserver?.observe(media);
});

function syncPreviews() {
  updatePreviews.forEach((update) => update());
}

document.addEventListener('visibilitychange', syncPreviews);
reducedMotion.addEventListener('change', syncPreviews);
