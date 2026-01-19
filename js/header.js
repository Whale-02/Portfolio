(() => {
  const drawer = document.querySelector("[data-drawer]");
  const openBtn = document.querySelector("[data-drawer-open]");
  const closeBtns = document.querySelectorAll("[data-drawer-close]");
  const panel = drawer?.querySelector(".drawer__panel");

  if (!drawer || !openBtn || !panel) return;

  const setOpen = (isOpen) => {
    drawer.classList.toggle("is-open", isOpen);
    drawer.setAttribute("aria-hidden", String(!isOpen));
    openBtn.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) panel.focus();
  };

  openBtn.addEventListener("click", () => setOpen(true));
  closeBtns.forEach((btn) =>
    btn.addEventListener("click", () => setOpen(false))
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open"))
      setOpen(false);
  });
})();
