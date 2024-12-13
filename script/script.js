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
      const imgSrc = item.querySelector("img").src;
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


// DOM load before GSAP animation 
document.addEventListener("DOMContentLoaded", (event) => {
  event.preventDefault;
  // Header scroll animation
  let lastScrollTop = 0;
  const header = document.querySelector('.sticky');
  // Make the scrollable elements in the header into an array to create stagger
  const scrollElements = gsap.utils.toArray(".scAni");
  window.addEventListener('scroll', function() {
      let scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop) {
          // Scroll down animation
          gsap.to(header, { y: '-100%', duration: 0.3 });
          gsap.to(scrollElements, { y: '-500%', duration: 0.2, stagger: 0.04});
      } else {
          // Scroll up animation
          gsap.to(header, { y: '0%', duration: 0.3 });
          gsap.to(scrollElements, { y: '0%', duration: 0.2, stagger: 0.04});
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }, false);

  // Page load animation
  const loadAni = gsap.utils.toArray(".loadAni");
  gsap.fromTo(
    loadAni,
    {
      opacity: 0,
    },
    {
      opacity: 1,
      delay: 0.5,
      duration: 0.8,
      stagger: 0.1,
    }
  );
  
  // For slower pages like FILM/INFO
  const slowLoadAni = gsap.utils.toArray(".slowLoadAni");
  gsap.fromTo(
    slowLoadAni,
    {
      opacity: 0,
    },
    {
      opacity: 1,
      delay: 1,
      duration: 2,
      stagger: 0.6,
    }
  );

  // Preload Transition
  const preloader = document.getElementById('preloader');
  const mainContent = document.getElementById('main-content');

  // Wait for the page to load, then fade-out the preloader
  window.addEventListener('load', function() {
        preloader.classList.add('fade-out'); // Fade out the black screen
        mainContent.classList.add('fade-in'); // Fade in the main content
    });

  // Fade-out effect before navigating to a new page  
  const links = document.querySelectorAll('a');
  links.forEach(link => {
      link.addEventListener('click', function(event) {
          event.preventDefault(); // Prevent immediate navigation

            // Trigger the fade-out
          preloader.style.opacity = '1'; // Show the black screen
          mainContent.style.opacity = '0'; // Hide the content

            // Wait for the transition to complete, then navigate
          setTimeout(() => {
              window.location.href = this.href; // Redirect to the new page
          }, 1000); // Wait for 1 second (matching the CSS transition duration)
        });
    });
});
