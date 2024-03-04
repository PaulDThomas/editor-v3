import { IMarkdownSettings, defaultMarkdownSettings } from "./markdown/MarkdownSettings";

// Class
export class EditorV3TextBlock {
  // Variables
  text: string;
  style?: string;

  // Read only variables
  get data() {
    return { text: this.text, style: this.style };
  }
  get jsonString(): string {
    return JSON.stringify(this.data);
  }
  // Content returns
  public toHtml(): DocumentFragment {
    const text =
      this.text === ""
        ? "\u2009"
        : this.text.replace(/^ /, "\u00A0").replace(/ $/, "\u00A0").replaceAll(" ", "\u00A0\uFEFF");
    const words = text.split("\uFEFF");
    const ret = new DocumentFragment();
    words.forEach((word) => {
      const span = document.createElement("span");
      span.classList.add("aiev3-tb");
      const textNode = document.createTextNode(word);
      span.appendChild(textNode);
      if (this.style) {
        span.classList.add(`editorv3style-${this.style}`);
        span.dataset.styleName = this.style;
      }
      ret.append(span);
    });
    return ret;
  }
  public toMarkdown(markdownSettings: IMarkdownSettings = defaultMarkdownSettings): string {
    if (!this.style) return this.text;
    else {
      return `${markdownSettings.styleStartTag}${
        this.style !== markdownSettings.defaultStyle ? this.style : ""
      }${this.style !== markdownSettings.defaultStyle ? markdownSettings.styleNameEndTag : ""}${
        this.text
      }${markdownSettings.styleEndTag}`;
    }
  }

  // Overloads
  constructor(
    arg:
      | HTMLSpanElement
      | Text
      | EditorV3TextBlock
      | DocumentFragment
      | { text: string; style?: string }
      | string,
    style?: string,
  ) {
    // Initial
    this.text = "";

    // Text
    if (typeof arg === "string") {
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
    // Span element
    else if (arg instanceof HTMLSpanElement) {
      this.text = arg.textContent?.replaceAll("\u00A0", " ") ?? "";
      if (arg.classList.contains("aiev3-tb-space")) this.text = ` ${this.text}`;
      this.style = arg.dataset.styleName;
    }
    // Document Fragment element
    else if (arg instanceof DocumentFragment) {
      this.text = "";
      arg.childNodes.forEach((child) => {
        if (child instanceof HTMLSpanElement) {
          this.text += child.classList.contains("aiev3-tb-space")
            ? ` ${child.textContent}`
            : child.textContent;
          if (this.style && child.dataset.styleName !== this.style)
            throw "Multiple styles in fragment";
          else this.style = child.dataset.styleName;
        }
      });
      this.text = this.text.replaceAll("\u00A0", " ");
    }
    // Text node
    else if (arg instanceof Text) {
      this.text = arg.textContent?.replaceAll("\u00A0", " ") ?? "";
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
