// Class
export class EditorV3TextBlock {
  // Variables
  text: string;
  style?: string;

  // Read only variables
  get el(): HTMLSpanElement {
    const span = document.createElement('span');
    if (this.style) {
      span.className = `editorv3style-${this.style}`;
      span.dataset.styleName = this.style;
    }
    span.innerHTML = (this.text !== '' ? this.text : '\u200B').replace(/ /g, '\u00A0');

    return span;
  }

  // Overloads
  constructor(arg: string | HTMLSpanElement | Text, style?: string) {
    this.text = arg instanceof HTMLSpanElement || arg instanceof Text ? arg.textContent ?? '' : arg;
    this.style =
      style ??
      (arg instanceof HTMLSpanElement && arg.dataset.styleName !== undefined
        ? arg.dataset.styleName
        : undefined);

    // Fix characters
    this.text = this.text
      .replace(/[\u200B-\u200F\uFEFF\t\r\n]/g, '') // Remove undesirable non-printing chars
      .replace(/[\u202F|\u00A0]/g, ' '); // Only normal spaces here
  }
}
