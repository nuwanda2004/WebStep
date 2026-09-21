/*
  Степь — общее поведение страниц: мягкое появление секций при
  прокрутке и лёгкий параллакс фонового изображения в шапке.
*/

document.addEventListener("DOMContentLoaded", () => {

  // Появление секций при прокрутке
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(node => io.observe(node));
  } else {
    reveals.forEach(node => node.classList.add("is-visible"));
  }

  // Лёгкий параллакс фона в героической секции
  const heroBg = document.querySelector("[data-hero-bg]");
  if (heroBg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        heroBg.style.transform = `translateY(${y * 0.15}px)`;
        ticking = false;
      });
    }, { passive: true });
  }
});
