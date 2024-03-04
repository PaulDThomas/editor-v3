export const drawAt = (text: string, style?: string): DocumentFragment => {
  const frag = new DocumentFragment();
  const span = document.createElement("span");
  frag.appendChild(span);
  span.classList.add("aiev3-tb", "at-block");
  const textNode = document.createTextNode(text.replaceAll("\uFEFF", ""));
  span.appendChild(textNode);
  if (style) {
    span.classList.add(`editorv3style-${style}`);
    span.dataset.styleName = style;
  }
  return frag;
};
