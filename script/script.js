// Fullscreen image and video script
const columnItem = document.querySelectorAll(".column-item");
const fullscreenView = document.querySelector(".fullscreen-view");
const fullscreenImage = document.querySelector(".fullscreen-image");
const fullscreenVideo = document.querySelector(".fullscreen-video");
const closeBtn = document.querySelector(".close");

// Debugging fullscreen view
if (!fullscreenView || (!fullscreenImage && !fullscreenVideo) || !closeBtn) {
  console.error("Necessary elements not found");
}

columnItem.forEach((item) => {
  item.addEventListener("click", () => {
    // Check if the columnItem contains a video or image
    const hasVideo = item.querySelector("video") !== null;
    const hasImg = item.querySelector("img") !== null;
    const hasBigVideo = item.querySelector(".big-video") !== null;

    // Clear sources to avoid displaying old content
    fullscreenImage.style.display = 'none';
    fullscreenVideo.style.display = 'none';
    // Display the corresponding video OR image element
    if (hasVideo) {
      const vidSrc = item.querySelector("video").getElementsByTagName("source")[0].src;
      fullscreenVideo.src = vidSrc;
      fullscreenVideo.load();
      fullscreenVideo.muted = true;
      fullscreenVideo.play();
      fullscreenVideo.style.display = 'block';
      fullscreenImage.src = '';
    }
    else if (hasImg) {
      const image = item.querySelector("img");
      const imgSrc = image.dataset.fullSrc || image.currentSrc || image.dataset.mediaSrc || image.src;
      fullscreenImage.src = imgSrc;
      fullscreenImage.style.display = 'block';
      fullscreenVideo.src = '';
    }
    // Don't fullscreen .big-video
    if (hasBigVideo) {
      fullscreenView.classList.remove("show");
    }
    else {
      fullscreenView.classList.add("show");
    }
    // Fade-in animation
    gsap.from(
      hasVideo ? fullscreenVideo : fullscreenImage,
      { opacity: 0, duration: 0.2, ease: "none" }
    );
  });
});

if (closeBtn) {
  closeBtn.addEventListener("click", closeFullscreen);
} else {
  console.error("Close button element not found.");
}

fullscreenView.addEventListener("click", (event) => {
  if (event.target === fullscreenView || event.target === closeBtn) {
    closeFullscreen();
  }
});

fullscreenImage.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevent clicks on the image from bubbling to fullscreenView
});

function closeFullscreen() {
  // Clears the source for img and vid
  fullscreenImage.src = '';
  fullscreenVideo.src = '';
  fullscreenView.classList.remove("show");
}


// The custom header is available after the deferred scripts have run.
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".sticky");
  if (!header || !window.gsap) return;

  let lastScrollTop = 0;
  const scrollElements = gsap.utils.toArray(".scAni");

  window.addEventListener("scroll", () => {
    const scrollTop = Math.max(0, window.scrollY);
    if (scrollTop === lastScrollTop) return;

    const scrollingDown = scrollTop > lastScrollTop;
    gsap.to(header, { y: scrollingDown ? "-100%" : "0%", duration: 0.3 });
    gsap.to(scrollElements, {
      y: scrollingDown ? "-500%" : "0%",
      duration: scrollingDown ? 0.2 : 0.3,
      stagger: 0.04,
    });
    lastScrollTop = scrollTop;
  }, { passive: true });
});
