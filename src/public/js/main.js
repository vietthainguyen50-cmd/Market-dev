document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.site-navbar');

  if (!navbar) {
    return;
  }

  const updateNavbar = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });
});
