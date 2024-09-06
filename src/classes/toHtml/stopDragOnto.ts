export const stopDragOnto = (el: HTMLElement) => {
  el.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "none";
    el.style.cursor = "not-allowed";
  });
  el.addEventListener("dragleave", () => {
    el.style.cursor = "default";
  });
  el.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    el.style.cursor = "default";
  });
};
