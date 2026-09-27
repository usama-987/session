/** Move certificate sheets to body so dashboard chrome does not offset print. */
export function printCertificates() {
  const area = document.querySelector<HTMLElement>(".certificate-print-area");
  if (!area) {
    window.print();
    return;
  }

  const placeholder = document.createElement("div");
  placeholder.setAttribute("data-print-placeholder", "true");
  const parent = area.parentElement;
  parent?.insertBefore(placeholder, area);
  document.body.appendChild(area);
  area.classList.add("is-printing");

  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    area.classList.remove("is-printing");
    if (placeholder.parentElement) {
      placeholder.replaceWith(area);
    } else if (!area.parentElement) {
      document.body.appendChild(area);
    }
    window.removeEventListener("afterprint", restore);
  };

  window.addEventListener("afterprint", restore);
  window.print();
  window.setTimeout(restore, 1500);
}
