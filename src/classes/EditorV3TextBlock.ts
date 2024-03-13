import { cloneDeep } from "lodash";
import { drawAt } from "../functions/drawAt";
import { defaultContentProps } from "./EditorV3Content";
import { IMarkdownSettings } from "./markdown/MarkdownSettings";

export type EditorV3TextBlockType = "text" | "at";

// Class
export class EditorV3TextBlock {
  private _defaultContentProps = cloneDeep(defaultContentProps);
  // Variables
  public text: string;
  public style?: string;
  public type: EditorV3TextBlockType = "text";
  public isActive: boolean = false;
  public isLocked: true | undefined;
  public lineStartPosition: number = 0;
  get lineEndPosition() {
    return this.lineStartPosition + this.text.replaceAll("\uFEFF", "").length;
  }

  get typeStyle(): string {
    return `${this.type}:${this.style ?? ""}`;
  }

  // Read only variables
  get data() {
    return { text: this.text, style: this.style, type: this.type, isLocked: this.isLocked };
  }
  get jsonString(): string {
    const ret = cloneDeep(this.data);
    Object.keys(ret).forEach((k) => {
      const key = k as keyof typeof ret;
      if (ret[key] === undefined) delete ret[key];
    });
    return JSON.stringify(ret);
  }
  // Content returns
  public toHtml(): DocumentFragment {
    const text =
      this.text === ""
        ? "\u2009"
        : this.text.replace(/^ /, "\u00A0").replace(/ $/, "\u00A0").replaceAll(" ", "\u00A0\uFEFF");
    const ret = new DocumentFragment();
    if (this.type === "at") {
      ret.append(drawAt(text, this.style, this.isActive, this.isLocked));
    } else {
      const words = text.split("\uFEFF");
      words.forEach((word) => {
        if (word.startsWith("@")) {
          ret.append(drawAt(word, this.style, this.isActive, this.isLocked));
        } else {
          const span = document.createElement("span");
          span.classList.add("aiev3-tb");
          const textNode = document.createTextNode(word);
          span.appendChild(textNode);
          if (this.style) {
            span.classList.add(`editorv3style-${this.style}`);
            span.dataset.styleName = this.style;
          }
          if (this.isActive) span.classList.add("is-active");
          ret.append(span);
        }
      });
    }
    return ret;
  }
  public toMarkdown(
    markdownSettings: IMarkdownSettings = this._defaultContentProps.markdownSettings,
  ): string {
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
      | {
          text: string;
          style?: string;
          type?: EditorV3TextBlockType;
          isLocked?: true | undefined;
          lineStartPosition?: number;
        }
      | string,
    style?: string,
    type?: EditorV3TextBlockType,
    isLocked?: true | undefined,
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
        if (jsonInput.type) this.type = jsonInput.type;
        if (jsonInput.isLocked) this.isLocked = jsonInput.isLocked;
        if (jsonInput.lineStartPosition) this.lineStartPosition = jsonInput.lineStartPosition;
      } catch {
        this.text = arg;
      }
    }
    // Span element
    else if (arg instanceof HTMLSpanElement) {
      this.text = arg.textContent?.replaceAll("\u00A0", " ") ?? "";
      if (arg.classList.contains("aiev3-tb-space")) this.text = ` ${this.text}`;
      this.style = arg.dataset.styleName;
      this.type = (arg.dataset.type as EditorV3TextBlockType | undefined) ?? "text";
      if (arg.dataset.isLocked) this.isLocked = true;
    }
    // Document Fragment element
    else if (arg instanceof DocumentFragment) {
      this.text = "";
      arg.childNodes.forEach((child, ix) => {
        // Set style
        if (child instanceof HTMLSpanElement) {
          this.text += child.classList.contains("aiev3-tb-space")
            ? ` ${child.textContent}`
            : child.textContent;
          if (this.style && child.dataset.styleName !== this.style)
            throw "Multiple styles in fragment";
          else this.style = child.dataset.styleName;
          // Set type
          if (ix === 0)
            this.type = (child.dataset.type as EditorV3TextBlockType | undefined) ?? "text";
          // Uncomment this later, then type is always added to the dataset
          // else if (
          //   (child.dataset.type as EditorV3TextBlockType | undefined) &&
          //   child.dataset.type !== this.type
          // )
          //   throw "Multiple types in fragment";
          // Set isLocked
          if (ix === 0 && child.dataset.isLocked) this.isLocked = true;
          else if (
            (child.dataset.isLocked && !this.isLocked) ||
            (this.isLocked && !child.dataset.isLocked)
          )
            throw "Multiple isLocked in fragment";
        }
      });
      this.text = this.text.replaceAll("\u00A0", " ");
    }
    // Text node
    else if (arg instanceof Text) {
      this.text = arg.textContent?.replaceAll("\u00A0", " ") ?? "";
      this.type = "text";
      this.style = undefined;
      this.isLocked = undefined;
    }
    // Must be object
    else {
      this.text = arg.text;
      this.style = arg.style;
      this.type = arg.type ?? "text";
      this.isLocked = arg.isLocked;
      this.lineStartPosition = arg.lineStartPosition ?? 0;
    }

    // Always take other arguments if provided
    if (style) this.style = style;
    if (type) this.type = type;
    if (isLocked) this.isLocked = isLocked;

    // Fix characters
    this.text = this.text.replace(/[\u2009-\u200F\uFEFF\t\r\n]/g, ""); // Remove undesirable non-printing chars
    if (this.text.startsWith("@")) this.type = "at";
  }

  public setActive(active: boolean) {
    this.isActive = active;
  }

  public setLineStartPosition(start: number) {
    this.lineStartPosition = start;
  }
}
