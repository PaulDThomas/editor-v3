export const drawAt = (
  text: string,
  style?: string,
  isActive: boolean = false,
): DocumentFragment => {
  const frag = new DocumentFragment();
  const span = document.createElement("span");
  frag.appendChild(span);
  span.classList.add("aiev3-tb", "at-block");
  isActive && span.classList.add("is-active");
  const textNode = document.createTextNode(text.replaceAll("\uFEFF", ""));
  span.appendChild(textNode);
  if (style) {
    span.classList.add(`editorv3style-${style}`);
    span.dataset.styleName = style;
  }
  return frag;
};
