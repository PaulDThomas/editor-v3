// Class
export class EditorV3TextBlock {
  // Variables
  text: string;
  style?: string;

  // Read only variables
  get html(): HTMLSpanElement {
    const span = document.createElement('span');
    if (this.style) {
      span.className = `editorv3style-${this.style}`;
      span.dataset.styleName = this.style;
    }
    span.innerHTML = this.text.replace(/ /g, '\u00A0');
    return span;
  }

  // Overloads
  constructor(text: string, style?: string) {
    this.text = text
      .replace(/[\u200B-\u200F\uFEFF\r]/g, '') // Remove undesirable non-printing chars
      .replace(/[\u202F|\u00A0]/g, ' '); // Only normal spaces here
    this.style = style;
  }
}
