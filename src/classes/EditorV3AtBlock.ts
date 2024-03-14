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
    this.isActive && span.classList.add("is-active");
    if (this.isLocked || !this.isActive) {
      span.classList.add("is-locked");
      span.dataset.isLocked = "true";
    }
    const textNode = document.createTextNode(this.text.replaceAll("\uFEFF", ""));
    span.appendChild(textNode);
    if (this.style) {
      span.classList.add(`editorv3style-${this.style}`);
      span.dataset.styleName = this.style;
    }
    span.dataset.type = "at";
    return frag;
  }
}
