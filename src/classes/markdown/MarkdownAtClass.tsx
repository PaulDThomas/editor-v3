import { EditorV3TextBlock } from "../EditorV3TextBlock";
import { defaultMarkdownSettings } from "./MarkdownSettings";

/**
 * Interface for the markdown at section
 */
export interface IMarkdownAt {
  text: string;
  style?: string;
  startTag?: string;
  nameEndTag?: string;
  endTag?: string;
}

/**
 * Class for handling markdown at sections
 */
export class MarkdownAtClass {
  protected _startTag: string;
  protected _nameEndTag: string;
  protected _endTag;

  protected _style?: string;
  get style() {
    return this._style;
  }
  set style(style) {
    this._style = style;
  }

  protected _text = "";
  get text() {
    return this._text;
  }
  set text(content: string) {
    this._text = content;
  }

  /**
   * Returns the data stored in the class
   */
  get data(): IMarkdownAt {
    return {
      text: this._text,
      style: this._style,
      startTag: this._startTag,
      nameEndTag: this._nameEndTag,
      endTag: this._endTag,
    };
  }

  /**
   * Create new MarkdownAtClass, content includes params
   * @param text String
   * @param style? Name of style to use
   * @param startTag Indicates the start of the at, default is "@["
   * @param nameEndTag Indicates the end of the style name, default is "::"
   * @param endTag Indicates the end of the at, default is "@]"
   */
  public constructor(content?: IMarkdownAt) {
    this._text = content?.text ?? "";
    this._style = content?.style;
    this._startTag = content?.startTag ?? defaultMarkdownSettings.atStartTag;
    this._nameEndTag = content?.nameEndTag ?? defaultMarkdownSettings.styleNameEndTag;
    this._endTag = content?.endTag ?? defaultMarkdownSettings.atEndTag;
  }

  public fromMarkdown(markdown: string) {
    const startTagIndex = markdown.indexOf(this._startTag);
    const nameEndTagIndex = markdown.indexOf(this._nameEndTag);
    const endTagIndex = markdown.indexOf(this._endTag);
    const errors: Error[] = [];

    if (startTagIndex === -1 || endTagIndex === -1) {
      errors.push(new Error("MarkdownAtClass.fromMarkdown: Invalid markdown at block"));
    }
    if (startTagIndex > endTagIndex) {
      errors.push(new Error("MarkdownAtClass.fromMarkdown: End tag before start tag"));
    }
    if (startTagIndex !== 0) {
      errors.push(
        new Error("MarkdownAtClass.fromMarkdown: Start tag not at beginning of markdown segment"),
      );
    }
    if (endTagIndex !== markdown.length - this._endTag.length) {
      errors.push(
        new Error("MarkdownAtClass.fromMarkdown: End tag not at end of markdown segment"),
      );
    }
    if (errors.length > 0) {
      throw errors;
    }

    if (nameEndTagIndex > -1) {
      this._style = markdown.substring(startTagIndex + this._startTag.length, nameEndTagIndex);
      this._text = markdown.substring(nameEndTagIndex + this._nameEndTag.length, endTagIndex);
    } else {
      this._style = undefined;
      this._text = markdown.substring(startTagIndex + this._startTag.length, endTagIndex);
    }
  }

  /**
   * Returns the markdown representation of the class
   */
  public toMarkdown(): string {
    return `${this._startTag}${this._style ? this._style + this._nameEndTag : ""}${this.text}${this._endTag}`;
  }

  /**
   * Returns the text representation of the class
   */
  public toTextBlock() {
    return new EditorV3TextBlock({
      type: "at",
      text: this._text,
      style: this._style,
    });
  }
}
