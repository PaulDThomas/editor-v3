import { drawAt } from "../functions/drawAt";
import { IMarkdownSettings, defaultMarkdownSettings } from "./markdown/MarkdownSettings";

export type EditorV3TextBlockType = "text" | "at";

// Class
export class EditorV3TextBlock {
  // Variables
  text: string;
  style?: string;
  type: EditorV3TextBlockType = "text";

  get typeStyle(): string {
    return `${this.type}:${this.style ?? ""}`;
  }

  // Read only variables
  get data() {
    return { text: this.text, style: this.style, type: this.type };
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
    const ret = new DocumentFragment();
    if (this.type === "at") {
      ret.append(drawAt(text, this.style));
    } else {
      const words = text.split("\uFEFF");
      words.forEach((word) => {
        if (word.startsWith("@")) {
          ret.append(drawAt(word, this.style));
        } else {
          const span = document.createElement("span");
          span.classList.add("aiev3-tb");
          const textNode = document.createTextNode(word);
          span.appendChild(textNode);
          if (this.style) {
            span.classList.add(`editorv3style-${this.style}`);
            span.dataset.styleName = this.style;
          }
          ret.append(span);
        }
      });
    }
    return ret;
  }
  public toMarkdown(markdownSettings: IMarkdownSettings = defaultMarkdownSettings): string {
    return (
      `${this.type === "at" ? markdownSettings.atStartTag : this.style ? markdownSettings.styleStartTag : ""}` +
      `${this.style && this.style !== markdownSettings.defaultStyle ? this.style + markdownSettings.styleNameEndTag : ""}` +
      this.text +
      `${this.type === "at" ? markdownSettings.atEndTag : this.style ? markdownSettings.styleEndTag : ""}`
    );
  }

  // Overloads
  constructor(
    arg:
      | HTMLSpanElement
      | Text
      | EditorV3TextBlock
      | DocumentFragment
      | { text: string; style?: string; type?: EditorV3TextBlockType }
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
      this.type = arg.type ?? "text";
    }

    // Always take style if provided
    if (style) this.style = style;

    // Fix characters
    this.text = this.text.replace(/[\u2009-\u200F\uFEFF\t\r\n]/g, ""); // Remove undesirable non-printing chars
    if (this.text.startsWith("@")) this.type = "at";
  }
}
