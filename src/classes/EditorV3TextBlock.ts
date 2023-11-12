// Class
export class EditorV3TextBlock {
  // Variables
  text: string;
  style?: string;

  // Read only variables
  get el(): HTMLSpanElement {
    const span = document.createElement("span");
    span.classList.add("aiev3-tb");
    if (this.style) {
      span.classList.add(`editorv3style-${this.style}`);
      span.dataset.styleName = this.style;
    }
    span.innerHTML = this.text !== "" ? this.text : "\u2009";

    return span;
  }
  get jsonString(): string {
    return JSON.stringify(this);
  }

  // Overloads
  constructor(
    arg: HTMLSpanElement | Text | EditorV3TextBlock | { text: string; style?: string } | string,
    style?: string,
  ) {
    // Initial
    this.text = "";

    // Text
    if (typeof arg === "string") {
      if (arg.match(/^<span.*<\/span>$/)) {
        const div = document.createElement("template");
        div.innerHTML = arg;
        this.text = div.content.children[0].textContent ?? "";
        this.style = (div.content.children[0] as HTMLSpanElement).dataset?.styleName;
      } else {
        try {
          const jsonInput = JSON.parse(arg);
          if (jsonInput.text) {
            this.text = jsonInput.text;
          } else {
            throw "No text";
          }
          if (jsonInput.style) this.style = jsonInput.style;
        } catch {
          this.text = arg;
        }
      }
    }
    // Span element
    else if (arg instanceof HTMLSpanElement) {
      this.text = arg.textContent ?? "";
      this.style = arg.dataset.styleName;
    }
    // Text node
    else if (arg instanceof Text) {
      this.text = arg.textContent ?? "";
    }
    // Must be object
    else {
      this.text = arg.text;
      this.style = arg.style;
    }

    // Always take style if provided
    if (style) this.style = style;

    // Fix characters
    this.text = this.text.replace(/[\u2009-\u200F\uFEFF\t\r\n]/g, ""); // Remove undesirable non-printing chars
  }
}
