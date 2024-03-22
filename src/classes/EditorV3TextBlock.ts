import { cloneDeep } from "lodash";
import { defaultContentProps } from "./defaultContentProps";
import { IMarkdownSettings } from "./markdown/MarkdownSettings";
import { EditorV3RenderProps, EditorV3WordPosition } from "./interface";

export type EditorV3TextBlockType = "text" | "at";
export interface IEditorV3TextBlockOptionalParams {
  style?: string;
  type?: EditorV3TextBlockType;
  isLocked?: true | undefined;
  lineStartPosition?: number;
}
export interface IEditorV3TextBlock extends IEditorV3TextBlockOptionalParams {
  text: string;
}

// Class
export class EditorV3TextBlock implements IEditorV3TextBlock {
  private _defaultContentProps = cloneDeep(defaultContentProps);
  // Variables
  public text: string = "";
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
  get data(): IEditorV3TextBlock {
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

  // Constructor
  constructor(arg: IEditorV3TextBlock, forcedParams?: IEditorV3TextBlockOptionalParams) {
    this.text = arg.text;
    this.style = arg.style;
    this.type = arg.type ?? "text";
    this.isLocked = arg.isLocked;
    this.lineStartPosition = arg.lineStartPosition ?? 0;
    // Forced any parameters
    if (forcedParams) {
      if (forcedParams.style) this.style = forcedParams.style;
      if (forcedParams.isLocked) this.isLocked = forcedParams.isLocked;
      if (forcedParams.lineStartPosition) this.lineStartPosition = forcedParams.lineStartPosition;
    }
    if (this.type === undefined) this.type = "text";
  }

  // Content returns
  public toHtml(renderProps: EditorV3RenderProps): DocumentFragment {
    const text =
      this.text === ""
        ? "\u2009"
        : this.text
            .replace(/^ /, "\u00A0\uFEFF")
            .replace(/ $/, "\u00A0")
            .replaceAll(" ", "\u00A0\uFEFF");
    const ret = new DocumentFragment();
    if (this.type === "at") {
      throw new Error("Use EditorV3AtBlock for at blocks");
    } else {
      const words = text.split("\uFEFF");
      words
        .filter((w) => w !== "")
        .forEach((word) => {
          const span = document.createElement("span");
          span.classList.add("aiev3-tb");
          if (word.startsWith("@")) {
            span.classList.add("at-block");
            span.dataset.type = "at";
            // Always lock non-active at blocks
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
    if (renderProps.currentEl) renderProps.currentEl.append(ret);
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

  // // Protected functions
  // protected fromData(arg: IEditorV3TextBlock) {
  //   this.text = arg.text;
  //   this.style = arg.style;
  //   this.type = arg.type ?? "text";
  //   this.isLocked = arg.isLocked;
  //   this.lineStartPosition = arg.lineStartPosition ?? 0;
  // }

  // protected fromHtml(arg: HTMLSpanElement | Text) {
  //   this.text = arg.textContent ?? "";
  //   if (arg instanceof HTMLSpanElement) {
  //     this.style = arg.dataset.styleName ?? "";
  //     this.type = (arg.dataset.type ?? "text") as EditorV3TextBlockType;
  //     this.isLocked = arg.dataset.isLocked === "true" ? true : undefined;
  //     this.lineStartPosition = 0;
  //   }
  // }

  // Status updated functions
  public setActive(active: boolean) {
    this.isActive = active;
  }

  public setLineStartPosition(start: number) {
    this.lineStartPosition = start;
  }
}
