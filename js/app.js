/* app.js (fixed)
   - Works with #hash in window OR inside a scroll container
   - Optional: set data-scroll-root on the element that scrolls (e.g. .experience)
   - Active nav uses same scroll root
   - Reveal + Lightbox unchanged conceptually
*/

(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector("[data-header]");
  const headerOffset = () =>
    header ? Math.ceil(header.getBoundingClientRect().height) : 0;

  // If you have a scroll container (like .experience), add data-scroll-root to it.
  // Otherwise it will fall back to window scrolling.
  const scrollRoot = document.querySelector("[data-scroll-root]") || window;

  const isWindowRoot = scrollRoot === window;

  function getScrollTop() {
    return isWindowRoot ? window.scrollY : scrollRoot.scrollTop;
  }

  function setScrollTop(top) {
    if (isWindowRoot) {
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
    } else {
      scrollRoot.scrollTo({
        top,
        behavior: prefersReduced ? "auto" : "smooth",
      });
    }
  }

  function getTargetEl(hash) {
    if (!hash || hash === "#") return null;
    try {
      return document.querySelector(hash);
    } catch {
      return null;
    }
  }

  function scrollToHash(hash, { updateUrl = true } = {}) {
    const el = getTargetEl(hash);
    if (!el) return;

    // If you have different pages, only update URL if you're on the same page.
    if (updateUrl) history.pushState(null, "", hash);

    const offset = headerOffset() + 12;

    if (isWindowRoot) {
      const y = window.scrollY + el.getBoundingClientRect().top - offset;
      setScrollTop(y);
    } else {
      // element position relative to scrollRoot
      const rootRect = scrollRoot.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const y = getScrollTop() + (elRect.top - rootRect.top) - offset;
      setScrollTop(y);
    }
  }

  // ===== Click handler: only intercept real hash targets =====
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const target = getTargetEl(href);
    if (!target) return; // let browser handle if not found

    e.preventDefault();
    scrollToHash(href);
  });

  // ===== On load with hash =====
  window.addEventListener("load", () => {
    if (location.hash) scrollToHash(location.hash, { updateUrl: false });
  });

  // ===== Active nav (IntersectionObserver with correct root) =====
  const navLinks = Array.from(
    document.querySelectorAll("[data-nav] a[href^='#']")
  );
  const sections = Array.from(document.querySelectorAll("section[id]"));

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
          .sort(
            (a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0)
          )[0];

        if (visible && visible.target && visible.target.id) {
          setActive(visible.target.id);
        }
      },
      {
        root: isWindowRoot ? null : scrollRoot,
        threshold: [0.15, 0.3, 0.6],
        rootMargin: `-${headerOffset()}px 0px -45% 0px`,
      }
    );

    sections.forEach((s) => io.observe(s));
  }

  // ===== Reveal on scroll =====
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!prefersReduced) {
    revealEls.forEach((el) => el.classList.add("reveal-init"));

    if ("IntersectionObserver" in window) {
      const revealIO = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            en.target.classList.add("reveal-in");
            obs.unobserve(en.target);
          });
        },
        {
          root: isWindowRoot ? null : scrollRoot,
          threshold: 0.12,
          rootMargin: "0px 0px -10% 0px",
        }
      );

      revealEls.forEach((el) => revealIO.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("reveal-in"));
    }
  }

  // ===== Lightbox (unchanged, but robust) =====
  const lbImages = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (lbImages.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `
      <div class="lightbox__backdrop" data-lb-close></div>
      <figure class="lightbox__frame" role="dialog" aria-modal="true" aria-label="Image viewer">
        <button class="lightbox__close" type="button" aria-label="Close" data-lb-close>×</button>
        <img class="lightbox__img" alt="" />
        <figcaption class="lightbox__cap"></figcaption>
      </figure>
    `;
    document.body.appendChild(lb);

    const imgEl = lb.querySelector(".lightbox__img");
    const capEl = lb.querySelector(".lightbox__cap");

    const open = (src, alt, cap) => {
      imgEl.src = src;
      imgEl.alt = alt || "";
      capEl.textContent = cap || "";
      lb.classList.add("is-open");
      document.documentElement.style.overflow = "hidden";
    };

    const close = () => {
      lb.classList.remove("is-open");
      document.documentElement.style.overflow = "";
      imgEl.src = "";
      imgEl.alt = "";
      capEl.textContent = "";
    };

    lb.addEventListener("click", (e) => {
      if (e.target && e.target.closest("[data-lb-close]")) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lb.classList.contains("is-open")) close();
    });

    lbImages.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const src = el.getAttribute("href") || el.dataset.src;
        if (!src) return;
        open(src, el.dataset.alt || "", el.dataset.caption || "");
      });
    });
  }
})();
