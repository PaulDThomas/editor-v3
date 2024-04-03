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
    return this.lineStartPosition + this.text.replaceAll("\u200c", "").length;
  }

  get typeStyle(): string {
    return `${this.type}:${this.style ?? ""}`;
  }

  // Read only variables
  get data(): IEditorV3TextBlock {
    return { text: this.text, style: this.style, type: this.type, isLocked: this.isLocked };
  }

  /**
   * Get the word positions within the text block
   * @returns Array of word positions
   */
  get wordPositions() {
    const ret: EditorV3WordPosition[] = [];
    let _counted = 0;
    if (this.isLocked) {
      ret.push({
        line: -1,
        startChar: this.lineStartPosition,
        endChar: this.lineStartPosition + this.text.length,
        isLocked: true,
      });
    } else
      while (_counted < this.text.length && this.text.slice(_counted).search(/\S/) > -1) {
        const remainingText = this.text.slice(_counted);
        const nextWord = remainingText.match(/\S+/);
        if (nextWord) {
          ret.push({
            line: -1,
            startChar: this.lineStartPosition + _counted + remainingText.search(/\S/),
            endChar:
              this.lineStartPosition + _counted + remainingText.search(/\S/) + nextWord[0].length,
            isLocked: false,
          });
          _counted += remainingText.search(/\S/) + nextWord[0].length;
        }
      }
    return ret;
  }

  // Constructor
  constructor(
    arg?: IEditorV3TextBlock | HTMLSpanElement | DocumentFragment,
    forcedParams?: IEditorV3TextBlockOptionalParams,
  ) {
    // Document Fragment processing
    if (arg instanceof DocumentFragment) {
      this.text = "";
      const errors: string[] = [];
      arg.childNodes.forEach((child, ix) => {
        if (child instanceof Text || child instanceof HTMLSpanElement) {
          const childData = this.fromHtml(child);
          // Set parameters
          if (ix === 0) {
            this.text = childData.text;
            this.style = childData.style;
            this.type = childData.type as EditorV3TextBlockType;
            this.isLocked = childData.isLocked;
            this.lineStartPosition = childData.lineStartPosition ?? 0;
          } else {
            if (childData.type !== this.type) errors.push("Multiple types in fragment");
            if (childData.style !== this.style) errors.push("Multiple styles in fragment");
            if (childData.isLocked !== this.isLocked) errors.push("Multiple isLocked in fragment");
            this.text += childData.text;
          }
        } else errors.push("Unknown node type in fragment");
      });
      if (errors.length > 0) throw new Error("EditorV3TextBlock:Constructor:" + errors.join(", "));
    }
    // Span or Text element processing
    else if (arg instanceof HTMLSpanElement || arg instanceof Text) {
      const spanData = this.fromHtml(arg);
      this.text = spanData.text ?? "";
      this.style = spanData.style;
      this.type = (spanData.type ?? "text") as EditorV3TextBlockType;
      this.isLocked = spanData.isLocked;
    }
    // Object processing
    else {
      this.text = arg?.text.replaceAll(/[\r\n\t]/g, "") ?? "";
      this.style = arg?.style;
      this.type = arg?.type ?? "text";
      this.isLocked = arg?.isLocked;
      this.lineStartPosition = arg?.lineStartPosition ?? 0;
    }
    // Forced any parameters
    if (forcedParams) {
      if (forcedParams.style) this.style = forcedParams.style;
      if (forcedParams.isLocked) this.isLocked = forcedParams.isLocked;
      if (forcedParams.lineStartPosition) this.lineStartPosition = forcedParams.lineStartPosition;
    }
    if (this.type === undefined) this.type = "text";
  }

  // Protected functions
  private fromHtml(arg: HTMLSpanElement | Text): IEditorV3TextBlock {
    const text = (arg.textContent ?? "")
      .replaceAll(/\u00a0/g, " ")
      .replaceAll(/[\u2009-\u200f]/g, "");
    const spanData: IEditorV3TextBlock = {
      text,
      style: arg instanceof HTMLSpanElement ? arg.dataset.styleName : undefined,
      type: (arg instanceof HTMLSpanElement ? arg.dataset.type : "text") as EditorV3TextBlockType,
      isLocked:
        arg instanceof HTMLSpanElement && arg.dataset.isLocked === "true" ? true : undefined,
    };
    return spanData;
  }

  // Status updated functions
  public setActive(active: boolean) {
    this.isActive = active;
  }

  // Content returns
  public toHtml(renderProps: EditorV3RenderProps): DocumentFragment {
    const text = this.text === "" ? "\u2009" : this.text.replaceAll(" ", "\u00a0\u200c");
    const ret = new DocumentFragment();
    if (this.type === "at") {
      throw new Error("Use EditorV3AtBlock for at blocks");
    } else {
      const words =
        renderProps.doNotSplitWordSpans || this.isLocked
          ? [text.replaceAll("\u200c", "")]
          : text.split("\u200c");
      words
        .filter((w) => w !== "")
        .forEach((word) => {
          const span = document.createElement("span");
          span.classList.add("aiev3-tb");
          const textNode = document.createTextNode(word);
          span.appendChild(textNode);
          if (this.style) {
            span.classList.add(`editorv3style-${this.style}`);
            span.dataset.styleName = this.style;
          }
          if (this.isLocked) {
            span.classList.add("is-locked");
            span.dataset.isLocked = "true";
            span.contentEditable = "false";
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
}
