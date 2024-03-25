import { cloneDeep } from "lodash";
import { defaultContentProps } from "../defaultContentProps";
import { EditorV3TextBlock } from "../EditorV3TextBlock";

/**
 * Interface for the markdown style section
 */
export interface IMarkdownStyle {
  text: string;
  style?: string;
  isDefault?: boolean;
  startTag?: string;
  nameEndTag?: string;
  endTag?: string;
}

/**
 * Class for handling markdown style sections
 */
export class MarkdownStyleClass {
  private _defaultMarkdownSettings = cloneDeep(defaultContentProps).markdownSettings;
  protected _startTag: string;
  protected _nameEndTag: string;
  protected _endTag: string;

  protected _style: string;
  protected _isDefault: boolean;
  get style() {
    return this._style;
  }
  set style(style) {
    this._style = style;
    this._isDefault = false;
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
  get data(): IMarkdownStyle {
    return {
      style: this._style,
      text: this._text,
      isDefault: this._isDefault,
      startTag: this._startTag,
      nameEndTag: this._nameEndTag,
      endTag: this._endTag,
    };
  }

  /**
   * Create new MarkdownStyleClass, content includes params
   * @param text String or MarkdownClass
   * @param style Name of style to use, default is "defaultStyle"
   * @param isDefault Indicates whethe to include the style name in the markdown, default is true
   * @param startTag Indicates the start of the style, default is "<<"
   * @param nameEndTag Indicates the end of the style name, default is "::"
   * @param endTag Indicates the end of the style, default is ">>"
   */
  public constructor(content?: IMarkdownStyle) {
    this._text = content?.text ?? "";
    this._style = content?.style ?? this._defaultMarkdownSettings.defaultStyle;
    this._isDefault =
      content?.isDefault ?? this._style === this._defaultMarkdownSettings.defaultStyle;
    this._startTag = content?.startTag ?? this._defaultMarkdownSettings.styleStartTag;
    this._nameEndTag = content?.nameEndTag ?? this._defaultMarkdownSettings.styleNameEndTag;
    this._endTag = content?.endTag ?? this._defaultMarkdownSettings.styleEndTag;
  }
  /**
   * Interprets markdown and sets the data in the class
   * @param markdown Input text
   */
  public fromMarkdown(markdown: string) {
    const startTagIndex = markdown.indexOf(this._startTag);
    const nameEndTagIndex = markdown.indexOf(this._nameEndTag);
    const endTagIndex = markdown.indexOf(this._endTag);
    const errors: Error[] = [];
    if (startTagIndex === -1 || endTagIndex === -1) {
      errors.push(new Error("MarkdownStyleClass.fromMarkdown: Invalid markdown style"));
    }
    if (startTagIndex > endTagIndex) {
      errors.push(new Error("MarkdownStyleClass.fromMarkdown: End tag before start tag"));
    }
    if (startTagIndex !== 0) {
      errors.push(
        new Error(
          "MarkdownStyleClass.fromMarkdown: Start tag not at beginning of markdown segment",
        ),
      );
    }
    if (endTagIndex !== markdown.length - this._endTag.length) {
      errors.push(
        new Error("MarkdownStyleClass.fromMarkdown: End tag not at end of markdown segment"),
      );
    }
    if (errors.length > 0) {
      throw errors;
    }
    if (nameEndTagIndex > -1) {
      this._style = markdown.substring(startTagIndex + this._startTag.length, nameEndTagIndex);
      this._isDefault = false;
      this._text = markdown.substring(nameEndTagIndex + this._nameEndTag.length, endTagIndex);
    } else {
      this._style = this._defaultMarkdownSettings.defaultStyle;
      this._isDefault = true;
      this._text = markdown.substring(startTagIndex + this._startTag.length, endTagIndex);
    }
  }

  /**
   * Returns the markdown representation of the class
   */
  public toMarkdown() {
    return `${this._startTag}${this._isDefault ? "" : `${this._style}${this._nameEndTag}`}${
      this.text
    }${this._endTag}`;
  }

  /**
   * Returns the text block representation of the class
   */
  public toTextBlock() {
    return new EditorV3TextBlock({
      text: this._text,
      style: this._style,
      type: "text",
    });
  }
}
