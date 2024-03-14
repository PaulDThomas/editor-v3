import { cloneDeep } from "lodash";
import { defaultContentProps } from "./defaultContentProps";
import { IMarkdownSettings } from "./markdown/MarkdownSettings";
import { EditorV3WordPosition } from "./interface";

export type EditorV3TextBlockType = "text" | "at";
export interface IEditorV3TextBlock {
  text: string;
  style?: string;
  type?: EditorV3TextBlockType;
  isLocked?: true | undefined;
  lineStartPosition?: number;
}

// Class
export class EditorV3TextBlock implements IEditorV3TextBlock {
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
  /**
   * Get the word positions within the text block
   * @returns Array of word positions
   */
  get wordPositions() {
    const ret: EditorV3WordPosition[] = [];
    let _counted = 0;
    while (_counted < this.text.length && this.text.slice(_counted).search(/\S/) > -1) {
      const remainingText = this.text.slice(_counted);
      const nextWord = remainingText.match(/\S+/);
      if (nextWord) {
        ret.push({
          line: -1,
          startChar: this.lineStartPosition + _counted + remainingText.search(/\S/),
          endChar:
            this.lineStartPosition + _counted + remainingText.search(/\S/) + nextWord[0].length,
          isLocked: this.isLocked === true,
        });
        _counted += remainingText.search(/\S/) + nextWord[0].length;
      }
    }
    return ret;
  }

  // Content returns
  public toHtml(): DocumentFragment {
    const text =
      this.text === ""
        ? "\u2009"
        : this.text.replace(/^ /, "\u00A0").replace(/ $/, "\u00A0").replaceAll(" ", "\u00A0\uFEFF");
    const ret = new DocumentFragment();
    if (this.type === "at") {
      throw new Error("Use EditorV3AtBlock for at blocks");
    } else {
      const words = text.split("\uFEFF");
      words.forEach((word) => {
        const span = document.createElement("span");
        span.classList.add("aiev3-tb");
        if (word.startsWith("@")) {
          span.classList.add("at-block");
          if (this.isActive) span.classList.add("is-active");
          else {
            span.classList.add("is-locked");
            span.dataset.isLocked = "true";
          }
        }
        const textNode = document.createTextNode(word);
        span.appendChild(textNode);
        if (this.style) {
          span.classList.add(`editorv3style-${this.style}`);
          span.dataset.styleName = this.style;
        }
        if (this.isActive) span.classList.add("is-active");
        ret.append(span);
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
  constructor({ text, style, type, isLocked, lineStartPosition }: IEditorV3TextBlock) {
    this.text = text;
    this.style = style;
    this.type = type ?? "text";
    this.isLocked = isLocked;
    this.lineStartPosition = lineStartPosition ?? 0;
  }

  public setActive(active: boolean) {
    this.isActive = active;
  }

  public setLineStartPosition(start: number) {
    this.lineStartPosition = start;
  }
}
