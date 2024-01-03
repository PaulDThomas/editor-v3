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
  public toHtml(): HTMLSpanElement {
    const span = document.createElement("span");
    span.classList.add("aiev3-tb");
    const textNode = document.createTextNode(
      this.text === ""
        ? "\u2009"
        : this.text.replace(/^ /, "\u2002").replace(/ $/, "\u2002").replaceAll("  ", "\u2002 "),
    );
    span.appendChild(textNode);
    if (this.style) {
      span.classList.add(`editorv3style-${this.style}`);
      span.dataset.styleName = this.style;
    }
    return span;
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
      this.text = arg.textContent?.replaceAll("\u2002", " ") ?? "";
      this.style = arg.dataset.styleName;
    }
    // Text node
    else if (arg instanceof Text) {
      this.text = arg.textContent?.replaceAll("\u2002", " ") ?? "";
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
