import { EditorV3TextBlock } from "../EditorV3TextBlock";
import { IMarkdownSettings, defaultMarkdownSettings } from "./MarkdownSettings";
import { MarkdownStyleClass } from "./MarkdownStyleClass";

export interface IMarkdownLineClass {
  parts?: (string | MarkdownStyleClass)[];
  line?: string;
  markdownSettings?: IMarkdownSettings;
}

export class MarkdownLineClass {
  protected _parts: (string | MarkdownStyleClass)[] = [];
  protected _markdownSettings: IMarkdownSettings = defaultMarkdownSettings;

  get markdownText(): string {
    return this._parts
      .map((part) => (typeof part === "string" ? part : part.toMarkdown()))
      .join("");
  }

  public toTextBlocks(): EditorV3TextBlock[] {
    return this._parts.map((part) =>
      typeof part === "string" ? new EditorV3TextBlock(part) : part.toTextBlock(),
    );
  }

  get data(): IMarkdownLineClass {
    return {
      parts: this._parts,
      markdownSettings: this._markdownSettings,
    };
  }

  private parseStyle(text: string) {
    const parts: (string | MarkdownStyleClass)[] = [];
    const startTag = this._markdownSettings.styleStartTag;
    const endTag = this._markdownSettings.styleEndTag;
    let start = 0;
    let end = 0;
    while (end < text.length) {
      if (
        end > start &&
        text.substring(start, start + startTag.length) === startTag &&
        text.substring(end, end + endTag.length) === endTag
      ) {
        const newSC = new MarkdownStyleClass({
          text: "",
          startTag: this._markdownSettings.styleStartTag,
          endTag: this._markdownSettings.styleEndTag,
          nameEndTag: this._markdownSettings.styleNameEndTag,
        });
        newSC.fromMarkdown(text.substring(start, end + endTag.length));
        parts.push(newSC);
        start = end + endTag.length;
        end = start;
      } else {
        start = text.indexOf(startTag, end);
        const newEnd = text.indexOf(endTag, start);
        if (start === -1) {
          parts.push(text.substring(end));
          break;
        }
        if (newEnd === -1) {
          parts.push(text.substring(end));
          break;
        } else {
          if (start > end) {
            parts.push(text.substring(end, start));
          }
          end = newEnd;
        }
      }
    }
    return parts;
  }

  public constructor(content?: IMarkdownLineClass) {
    this._markdownSettings = content?.markdownSettings ?? defaultMarkdownSettings;
    this._parts = content?.parts ?? this.parseStyle(content?.line ?? "");
  }
}
