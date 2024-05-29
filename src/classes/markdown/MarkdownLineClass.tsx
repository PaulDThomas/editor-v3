import { cloneDeep } from "lodash";
import { defaultContentProps } from "../defaultContentProps";
import { EditorV3TextBlock } from "../EditorV3TextBlock";
import { MarkdownAtClass } from "./MarkdownAtClass";
import { IMarkdownSettings, defaultMarkdownSettings } from "./MarkdownSettings";
import { MarkdownStyleClass } from "./MarkdownStyleClass";
import { textBlockFactory } from "../textBlockFactory";

export interface IMarkdownLineClass {
  parts?: (string | MarkdownStyleClass | MarkdownAtClass)[];
  line?: string;
  markdownSettings?: IMarkdownSettings;
}

type MarkdownBlockType = "text" | "style" | "at";

interface TagPosition {
  type: MarkdownBlockType;
  start: number;
  end: number;
  startTag: string;
  endTag: string;
}

export class MarkdownLineClass {
  protected _parts: (string | MarkdownStyleClass | MarkdownAtClass)[] = [];
  protected _markdownSettings: IMarkdownSettings = cloneDeep(defaultContentProps).markdownSettings;

  get markdownText(): string {
    return this._parts
      .map((part) => (typeof part === "string" ? part : part.toMarkdown()))
      .join("");
  }

  public toTextBlocks(): EditorV3TextBlock[] {
    return this._parts.map((part) =>
      typeof part === "string" ? textBlockFactory({ text: part }) : part.toTextBlock(),
    );
  }

  get data(): IMarkdownLineClass {
    return {
      parts: this._parts,
      markdownSettings: this._markdownSettings,
    };
  }

  // Find next start tag
  private nextStartTag = (text: string, position: number): TagPosition | null => {
    const styleStart = text.indexOf(this._markdownSettings.styleStartTag, position);
    const atStart = text.indexOf(this._markdownSettings.atStartTag, position);
    let end = 0;
    // Style next
    if (styleStart > -1 && (atStart === -1 || atStart > styleStart)) {
      // Check end exists
      end = text.indexOf(this._markdownSettings.styleEndTag, styleStart);
      return end === -1
        ? null
        : {
            type: "style",
            start: styleStart,
            startTag: this._markdownSettings.styleStartTag,
            endTag: this._markdownSettings.styleEndTag,
            end,
          };
    }
    // At next
    else if (atStart > -1) {
      // Check end exists
      end = text.indexOf(this._markdownSettings.atEndTag, atStart);
      return end === -1
        ? null
        : {
            type: "at",
            start: atStart,
            startTag: this._markdownSettings.atStartTag,
            endTag: this._markdownSettings.atEndTag,
            end,
          };
    } else {
      return null;
    }
  };

  // Cycle through text and find parts
  private parseParts(text: string) {
    const parts: (string | MarkdownStyleClass | MarkdownAtClass)[] = [];
    let posn = 0;
    let nextBlock: TagPosition | null = null;
    while (posn < text.length) {
      if (nextBlock !== null && posn === nextBlock.start) {
        const newBlock: MarkdownStyleClass | MarkdownAtClass =
          nextBlock.type === "style"
            ? new MarkdownStyleClass({
                text: "",
                startTag: nextBlock.startTag,
                endTag: nextBlock.endTag,
                nameEndTag: this._markdownSettings.styleNameEndTag,
              })
            : new MarkdownAtClass({
                text: "",
                startTag: nextBlock.startTag,
                endTag: nextBlock.endTag,
                nameEndTag: this._markdownSettings.styleNameEndTag,
              });
        newBlock.fromMarkdown(
          text.substring(nextBlock.start, nextBlock.end + nextBlock.endTag.length),
        );
        parts.push(newBlock);
        posn = nextBlock.end + nextBlock.endTag.length;
      } else {
        nextBlock = this.nextStartTag(text, posn);
        if (!nextBlock) {
          parts.push(text.substring(posn));
          break;
        } else {
          if (nextBlock.start > posn) {
            parts.push(text.substring(posn, nextBlock.start));
          }
          posn = nextBlock.start;
        }
      }
    }
    // Return
    return parts;
  }

  public constructor(content?: IMarkdownLineClass) {
    this._markdownSettings = content?.markdownSettings ?? defaultMarkdownSettings;
    this._parts = content?.parts ?? this.parseParts(content?.line ?? "");
  }
}
