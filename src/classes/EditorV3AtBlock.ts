import { EditorV3TextBlock, IEditorV3TextBlock } from "./EditorV3TextBlock";

export class EditorV3AtBlock extends EditorV3TextBlock {
  constructor(props: IEditorV3TextBlock) {
    super(props);
    this.type = "at";
  }

  // Content returns
  public toHtml(): DocumentFragment {
    const frag = new DocumentFragment();
    const span = document.createElement("span");
    frag.appendChild(span);
    span.classList.add("aiev3-tb", "at-block");
    if (this.isLocked || !this.isActive) {
      span.classList.add("is-locked");
      span.dataset.isLocked = "true";
    } else if (this.isActive) span.classList.add("is-active");
    const textNode = document.createTextNode(
      this.text.replaceAll("\uFEFF", "").replace(/^ /, "\u00A0").replace(/ $/, "\u00A0"),
      // .replaceAll(" ", "\u00A0\uFEFF"),
    );
    span.appendChild(textNode);
    if (this.style) {
      span.classList.add(`editorv3style-${this.style}`);
      span.dataset.styleName = this.style;
    }
    span.dataset.type = "at";
    return frag;
  }
}
