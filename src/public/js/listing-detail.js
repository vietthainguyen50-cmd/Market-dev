document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('[data-product-gallery]');

  if (!gallery) {
    return;
  }

  const mainImage = gallery.querySelector('[data-gallery-main]');
  const mainLink = gallery.querySelector('[data-gallery-link]');
  const counter = gallery.querySelector('[data-gallery-counter]');
  const thumbnails = Array.from(gallery.querySelectorAll('[data-gallery-thumbnail]'));

  if (!mainImage || thumbnails.length === 0) {
    return;
  }

  const selectImage = (thumbnail) => {
    const source = thumbnail.dataset.gallerySrc;
    const alt = thumbnail.dataset.galleryAlt;
    const index = thumbnail.dataset.galleryIndex;

    if (!source || thumbnail.getAttribute('aria-pressed') === 'true') {
      return;
    }

    mainImage.src = source;
    mainImage.alt = alt || mainImage.alt;

    if (mainLink) {
      mainLink.href = source;
    }

    if (counter && index) {
      counter.textContent = `Ảnh ${index} / ${thumbnails.length}`;
    }

    thumbnails.forEach((item) => {
      const isSelected = item === thumbnail;
      item.classList.toggle('is-active', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });
  };

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', () => selectImage(thumbnail));
  });
});
