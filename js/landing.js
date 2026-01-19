/* landing.js
   - active nav based on visible sections
   - reveal on scroll
   - theme toggle (dark/light) stored in localStorage
*/

(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== Year =====
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // ===== Theme toggle =====
  const root = document.documentElement;
  const key = "mauro_theme";
  const btn = document.querySelector("[data-toggle-theme]");

  const saved = localStorage.getItem(key);
  if (saved === "light" || saved === "dark")
    root.setAttribute("data-theme", saved);

  function toggleTheme() {
    const cur = root.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem(key, next);
  }

  if (btn) btn.addEventListener("click", toggleTheme);

  // ===== Active nav =====
  const header = document.querySelector("[data-header]");
  const headerOffset = () =>
    header ? header.getBoundingClientRect().height : 0;

  const nav = document.querySelector("[data-nav]");
  const navLinks = nav ? Array.from(nav.querySelectorAll("a[href^='#']")) : [];
  const sections = Array.from(document.querySelectorAll("main section[id]"));

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const isActive = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("is-active", isActive);
      a.setAttribute("aria-current", isActive ? "page" : "false");
    });
  };

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible && visible.target && visible.target.id)
          setActive(visible.target.id);
      },
      {
        threshold: [0.2, 0.4, 0.65],
        rootMargin: `-${headerOffset()}px 0px -55% 0px`,
      }
    );
    sections.forEach((s) => io.observe(s));
  }

  // ===== Reveal =====
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!prefersReduced) {
    revealEls.forEach((el) => el.classList.add("reveal-init"));

    if ("IntersectionObserver" in window) {
      const rio = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            en.target.classList.add("reveal-in");
            obs.unobserve(en.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
      );
      revealEls.forEach((el) => rio.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("reveal-in"));
    }
  }

  // ===== Smooth scroll with header offset =====
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    history.pushState(null, "", href);

    const y =
      window.scrollY + target.getBoundingClientRect().top - headerOffset() - 12;
    window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
  });
})();
