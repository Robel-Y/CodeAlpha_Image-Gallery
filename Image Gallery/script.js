document.addEventListener("DOMContentLoaded", () => {
  // Select all necessary elements from the DOM
  const filterButtons = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".close-btn");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  let currentIndex = 0;
  let visibleItems = Array.from(galleryItems);

  // --- Filter Functionality ---
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Manage active button state
      document.querySelector(".filter-btn.active").classList.remove("active");
      button.classList.add("active");

      const filter = button.getAttribute("data-filter");

      // Reset visibleItems for accurate navigation
      visibleItems = [];

      galleryItems.forEach((item) => {
        if (filter === "all" || item.getAttribute("data-category") === filter) {
          item.classList.remove("hide");
          visibleItems.push(item);
        } else {
          item.classList.add("hide");
        }
      });
    });
  });

  // --- Lightbox Functionality ---
  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Find the index of the clicked item within the currently visible items
      const itemSrc = item.querySelector("img").src;
      currentIndex = visibleItems.findIndex(
        (visibleItem) => visibleItem.querySelector("img").src === itemSrc
      );

      showLightbox(itemSrc);
    });
  });

  function showLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  function hideLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "auto"; // Restore scrolling
  }

  function showNextImage() {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    const nextItemSrc = visibleItems[currentIndex].querySelector("img").src;
    lightboxImg.src = nextItemSrc;
  }

  function showPrevImage() {
    currentIndex =
      (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    const prevItemSrc = visibleItems[currentIndex].querySelector("img").src;
    lightboxImg.src = prevItemSrc;
  }

  // Event listeners for lightbox controls
  closeBtn.addEventListener("click", hideLightbox);
  nextBtn.addEventListener("click", showNextImage);
  prevBtn.addEventListener("click", showPrevImage);

  // Close lightbox when clicking outside the image
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      hideLightbox();
    }
  });

  // Keyboard navigation for lightbox
  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("active")) {
      if (e.key === "ArrowRight") {
        showNextImage();
      } else if (e.key === "ArrowLeft") {
        showPrevImage();
      } else if (e.key === "Escape") {
        hideLightbox();
      }
    }
  });
});
