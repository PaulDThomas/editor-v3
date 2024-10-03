import { cloneDeep } from "lodash";
import { defaultContentProps } from "./defaultContentProps";
import { IMarkdownSettings } from "./defaultMarkdownSettings";
import { EditorV3RenderProps, EditorV3Style, EditorV3WordPosition } from "./interface";

export type EditorV3TextBlockType = "text" | "at" | "select";
export interface IEditorV3TextBlockOptionalParams {
  label?: string;
  style?: string;
  type?: EditorV3TextBlockType;
  isLocked?: true | undefined;
  lineStartPosition?: number;
  markdownSettings?: IMarkdownSettings;
}
export interface IEditorV3TextBlock extends IEditorV3TextBlockOptionalParams {
  text: string;
}

// Class
export class EditorV3TextBlock implements IEditorV3TextBlock {
  protected _defaultContentProps = cloneDeep(defaultContentProps);
  // Variables
  public text: string = "";
  public label?: string;
  public style?: string;
  public type: EditorV3TextBlockType = "text";
  public isActive: boolean = false;
  public isSelected: boolean = false;
  public isLocked: true | undefined;
  public lineStartPosition: number = 0;
  get lineEndPosition() {
    return this.lineStartPosition + this.text.replaceAll("\u200c", "").length;
  }

  get mergeKey(): string {
    return `${this.isLocked ? this.lineStartPosition : "-"}:${this.type}:${this.style ?? ""}:${this.label ?? ""}`;
  }

  // Read only variables
  get data(): IEditorV3TextBlock {
    return {
      text: this.text,
      label: this.label,
      style: this.style,
      type: this.type,
      isLocked: this.isLocked,
    };
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
    arg?: IEditorV3TextBlock | HTMLSpanElement | DocumentFragment | string,
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
            this.label = childData.label;
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
    // Markdown processing for string
    else if (typeof arg === "string") {
      this.fromMarkdown(
        arg,
        forcedParams?.markdownSettings ?? this._defaultContentProps.markdownSettings,
      );
    }
    // Span or Text element processing
    else if (arg instanceof HTMLSpanElement || arg instanceof Text) {
      const spanData = this.fromHtml(arg);
      this.text = spanData.text ?? "";
      this.label = spanData.label;
      this.style = spanData.style;
      this.type = (spanData.type ?? "text") as EditorV3TextBlockType;
      this.isLocked = spanData.isLocked;
      this.lineStartPosition = spanData.lineStartPosition ?? 0;
    }
    // Object processing
    else {
      this.text = arg?.text.replaceAll(/[\r\n\t]/g, "") ?? "";
      this.label = arg?.label;
      this.style = arg?.style;
      this.type = arg?.type ?? "text";
      this.isLocked = arg?.isLocked;
      this.lineStartPosition = arg?.lineStartPosition ?? 0;
    }
    // Forced any parameters
    if (forcedParams) {
      if (forcedParams.label) this.label = forcedParams.label;
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
      lineStartPosition:
        arg instanceof HTMLSpanElement && arg.dataset.lineStartPosition
          ? parseInt(arg.dataset.lineStartPosition)
          : 0,
      label: arg instanceof HTMLSpanElement && arg.title !== "" ? arg.title : undefined,
      style: arg instanceof HTMLSpanElement ? arg.dataset.styleName : undefined,
      type: (arg instanceof HTMLSpanElement ? arg.dataset.type : "text") as EditorV3TextBlockType,
      isLocked:
        arg instanceof HTMLSpanElement && arg.dataset.isLocked === "true" ? true : undefined,
    };
    return spanData;
  }

  protected markdownStyleLabel(
    markdownText: string,
    markdownSettings: IMarkdownSettings,
    set = true,
  ): { style: string | undefined; label: string | undefined; text: string } {
    const styleTag = markdownText.indexOf(markdownSettings.styleNameEndTag);

    let style: string | undefined = undefined;
    let label: string | undefined = undefined;
    let text: string | undefined = undefined;
    // No style tag, return text
    if (styleTag === -1) {
      text = markdownText;
    } else {
      const labelTag = markdownText.indexOf(
        markdownSettings.styleNameEndTag,
        styleTag + markdownSettings.styleNameEndTag.length,
      );
      // No label tag, return text
      if (labelTag === -1) {
        style = markdownText.slice(0, styleTag);
        text = markdownText.slice(styleTag + markdownSettings.styleNameEndTag.length);
      } else {
        // Style and label tags found
        if (styleTag > 0) {
          style = markdownText.slice(0, styleTag);
        }
        if (labelTag > styleTag + markdownSettings.styleNameEndTag.length) {
          label = markdownText.slice(styleTag + markdownSettings.styleNameEndTag.length, labelTag);
        }
        text = markdownText.slice(labelTag + markdownSettings.styleNameEndTag.length);
      }
    }
    // Set if required
    if (set) {
      this.style = style;
      this.label = label;
      this.text = text;
    }
    // Return results
    return { style, label, text };
  }

  private fromMarkdown(markdown: string, arg?: IMarkdownSettings) {
    const markdownSettings = arg ?? this._defaultContentProps.markdownSettings;
    this.isLocked = undefined;
    this.style = undefined;
    this.label = undefined;
    this.text = markdown.replaceAll(/u00a0/g, " ").replaceAll(/[\u2009-\u200f]/g, "");
    if (
      this.text.startsWith(markdownSettings.styleStartTag) &&
      this.text.endsWith(markdownSettings.styleEndTag)
    ) {
      this.text = this.text.slice(
        markdownSettings.styleStartTag.length,
        -markdownSettings.styleEndTag.length,
      );
      // Only time default style is used
      const defaultStyle = !this.text.includes(markdownSettings.styleNameEndTag);
      // Read style and label
      this.markdownStyleLabel(this.text, markdownSettings);
      // Update default style if required
      if (defaultStyle) this.style = markdownSettings.defaultStyle;
    }
  }

  // Status updated functions
  public setActive(active: boolean) {
    this.isActive = active;
  }

  protected applyStyle(span: HTMLSpanElement, style?: EditorV3Style) {
    if (this.style) {
      span.classList.add(`editorv3style-${this.style}`);
      span.dataset.styleName = this.style;
      Object.entries(style ?? {}).forEach(([k, v]) => {
        if (k === "isLocked" && style?.isLocked) span.dataset.isLocked = v ? "true" : undefined;
        else
          span.style.setProperty(
            k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()),
            v,
          );
      });
    }
  }

  // Content returns
  public toHtml(renderProps: EditorV3RenderProps, style?: EditorV3Style): DocumentFragment {
    const text = this.text === "" ? "\u2009" : this.text.replaceAll(" ", "\u00a0\u200c");
    const ret = new DocumentFragment();
    if (this.type !== "text") {
      throw new Error("Use correct class for non-text blocks");
    } else {
      const words = renderProps.doNotSplitWordSpans
        ? [text.replaceAll("\u200c", "")]
        : text.split("\u200c");
      words
        .filter((w) => w !== "")
        .forEach((word) => {
          const span = document.createElement("span");
          span.classList.add("aiev3-tb");
          span.dataset.lineStartPosition = this.lineStartPosition.toString();
          const textNode = document.createTextNode(word);
          span.appendChild(textNode);
          // Add label
          if (this.label) span.title = this.label;
          // Apply lock
          if (this.isLocked && style?.isLocked) {
            span.classList.add("is-locked");
            span.dataset.isLocked = "true";
            span.contentEditable = "false";
          }
          if (this.isActive) span.classList.add("is-active");
          // Apply style
          this.applyStyle(span, style);
          // Append to return
          ret.append(span);
        });
    }
    if (renderProps.currentEl) renderProps.currentEl.append(ret);
    return ret;
  }

  protected toMarkdownStyleLabel(markdownSettings: IMarkdownSettings): string {
    if (this.label) {
      return (
        (this.style ?? "") +
        markdownSettings.styleNameEndTag +
        (this.label ?? "") +
        markdownSettings.styleNameEndTag
      );
    } else if (this.style && this.style !== markdownSettings.defaultStyle) {
      return this.style + markdownSettings.styleNameEndTag;
    } else return "";
  }

  public toMarkdown(markdownSettings = this._defaultContentProps.markdownSettings): string {
    // Set base text
    let text = this.text;
    // Update text with style and label
    if (this.style || this.label) {
      text = markdownSettings.styleStartTag;
      text += this.toMarkdownStyleLabel(markdownSettings);
      text += this.text;
      text += markdownSettings.styleEndTag;
    }
    return text;
  }
}
