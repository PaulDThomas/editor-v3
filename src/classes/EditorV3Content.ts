import { EditorV3Line } from "./EditorV3Line";
import { EditorV3TextBlock } from "./EditorV3TextBlock";
import {
  EditorV3Align,
  EditorV3ContentProps,
  EditorV3Import,
  EditorV3Position,
  EditorV3Styles,
} from "./interface";
import { IMarkdownSettings, defaultMarkdownSettings } from "./markdown/MarkdownSettings";
import { readV3Html } from "../functions/readV3Html";
import { MarkdownLineClass } from "./markdown/MarkdownLineClass";

/**
 * Represents the content of an EditorV3 instance.
 */
export class EditorV3Content {
  // Standard attributes
  private _textAlignment: EditorV3Align = EditorV3Align.left;
  /**
   * Current text alignment
   */
  get textAlignment() {
    return this._textAlignment;
  }
  /**
   * Set text alignment
   * Can be left, center, right, or justify
   */
  set textAlignment(newTa: EditorV3Align) {
    if (newTa !== this._textAlignment) {
      this.lines.forEach((l) => (l.textAlignment = newTa));
      this._textAlignment = newTa;
    }
  }

  private _decimalAlignPercent = 60;
  /**
   * Current decimal alignment percent
   */
  get decimalAlignPercent() {
    return this._decimalAlignPercent;
  }
  set decimalAlignPercent(newDap: number) {
    if (newDap !== this._decimalAlignPercent) {
      this.lines.forEach((l) => (l.decimalAlignPercent = newDap));
      this._decimalAlignPercent = newDap;
    }
  }

  private _styles: EditorV3Styles = {};
  /**
   * Current available styles in the editor
   */
  get styles() {
    return this._styles;
  }
  set styles(newStyles: EditorV3Styles) {
    this._styles = newStyles;
  }

  private _markdownSettings = defaultMarkdownSettings;

  /**
   * Current lines in the editor
   */
  public lines: EditorV3Line[] = [];

  private _styleNode(): HTMLDivElement {
    const sn = document.createElement("div");
    sn.className = "aiev3-style-info";
    sn.dataset.style = JSON.stringify(this._styles);
    return sn;
  }

  // Read only attributes
  /**
   * Element to render
   */
  public toHtml(): DocumentFragment {
    const ret = new DocumentFragment();
    this.lines.forEach((l) => ret.append(l.toHtml()));
    if (Object.keys(this._styles).length > 0) ret.append(this._styleNode());
    return ret;
  }

  /**
   * Render Markdown in an Fragment
   * @param markdownSettings Markdown settings, current settings by default
   * @returns Documentfragment with rendered markdown
   */
  public toMarkdownHtml(
    markdownSettings: IMarkdownSettings = this._markdownSettings,
  ): DocumentFragment {
    const ret = new DocumentFragment();
    this.lines.forEach((line) => {
      const l = document.createElement("div");
      l.classList.add("aiev3-markdown-line");
      l.dataset.textAlignment = this._textAlignment;
      l.dataset.decimalAlignPercent = this._decimalAlignPercent.toString();
      const tn = document.createTextNode(line.toMarkdown(markdownSettings));
      l.append(tn);
      ret.append(l);
    });
    if (Object.keys(this._styles).length > 0) ret.append(this._styleNode());
    return ret;
  }

  /**
   * Text from the element
   */
  get text(): string {
    return this.lines.map((l) => l.textBlocks.map((b) => b.text).join("")).join("\n");
  }

  /**
   * JSON string of the content
   */
  get jsonString(): string {
    return JSON.stringify({
      lines: this.lines,
      textAlignment: this._textAlignment,
      decimalAlignPercent: this._decimalAlignPercent,
      styles: this._styles,
    });
  }

  /**
   * Current content properties
   */
  get contentProps(): EditorV3ContentProps {
    return {
      textAlignment: this._textAlignment,
      decimalAlignPercent: this._decimalAlignPercent,
      styles: this._styles,
    };
  }

  /**
   * Create a new EditorV3Content instance
   * @param input Stringified JSON or HTML/text
   * @param props Optional properties
   * @returns Instance of the object
   */
  constructor(input: string, props?: EditorV3ContentProps) {
    // Defaults
    this._textAlignment = props?.textAlignment ?? EditorV3Align.left;
    this._decimalAlignPercent = props?.decimalAlignPercent ?? 60;
    this._styles = props?.styles ?? {};
    this.lines = [];

    // Process incoming data
    try {
      // Check for stringified class input
      const jsonInput: EditorV3Import = JSON.parse(input);
      if (!Array.isArray(jsonInput.lines)) throw "No lines";
      this.copyImport(jsonInput, props);
    } catch {
      // Establish input as string
      const inputString = input as string;
      // Read in v3 HTML/text
      const r = readV3Html(inputString, this._textAlignment, this._decimalAlignPercent);
      this.copyImport(r, props);
      return;
    }
  }

  private copyImport(read: EditorV3Import, props?: EditorV3ContentProps): void {
    this._textAlignment =
      props?.textAlignment ?? (read.lines[0].textAlignment as EditorV3Align) ?? EditorV3Align.left;
    this._decimalAlignPercent =
      props?.decimalAlignPercent ?? read.lines[0].decimalAlignPercent ?? 60;
    this._styles = {
      ...this._styles,
      ...read.styles,
      ...props?.styles,
    };
    this.lines = read.lines.map((l) =>
      l instanceof EditorV3Line
        ? l
        : new EditorV3Line(JSON.stringify(l), this._textAlignment, this._decimalAlignPercent),
    );
  }

  public subLines(pos: EditorV3Position): EditorV3Line[] {
    const ret: EditorV3Line[] = [];
    if (
      pos.startLine === pos.endLine &&
      pos.startChar === pos.endChar &&
      pos.startLine < this.lines.length
    ) {
      const style = this.lines[pos.startLine].getStyleAt(pos.startChar);
      ret.push(
        new EditorV3Line(
          [new EditorV3TextBlock("", style)],
          this.textAlignment,
          this.decimalAlignPercent,
        ),
      );
    }
    // Check selection contains something
    if (
      pos.startLine < this.lines.length &&
      ((pos.startLine === pos.endLine && pos.startChar < pos.endChar) ||
        pos.startLine < pos.endLine)
    ) {
      // First line
      if (pos.startLine <= pos.endLine) {
        ret.push(
          new EditorV3Line(
            this.lines[pos.startLine].subBlocks(
              pos.startChar,
              pos.startLine === pos.endLine ? pos.endChar : undefined,
            ),
            this._textAlignment,
            this._decimalAlignPercent,
          ),
        );
      }
      // At least one line between
      if (pos.startLine + 1 < pos.endLine) {
        ret.push(...this.lines.slice(pos.startLine + 1, pos.endLine));
      }
      // End line to end character
      if (pos.startLine < pos.endLine && pos.endLine < this.lines.length) {
        ret.push(
          new EditorV3Line(
            this.lines[pos.endLine].upToPos(pos.endChar),
            this._textAlignment,
            this._decimalAlignPercent,
          ),
        );
      }
    }
    return ret;
  }

  public upToPos(endLine: number, endChar: number): EditorV3Line[] {
    return this.subLines({ startLine: 0, startChar: 0, endLine, endChar });
  }

  public fromPos(startLine: number, startChar: number): EditorV3Line[] {
    return this.subLines({
      startLine,
      startChar,
      endLine: this.lines.length - 1,
      endChar: this.lines[this.lines.length - 1].lineLength,
    });
  }

  public getStyleAt(line: number, character: number): string | undefined {
    return line < this.lines.length ? this.lines[line].getStyleAt(character) : undefined;
  }

  // Split line in two
  public splitLine(pos: EditorV3Position): EditorV3Position {
    const u = this.upToPos(pos.startLine, pos.startChar);
    const f = this.fromPos(pos.endLine, pos.endChar);
    const newLines = [...u, ...f];
    this.lines = newLines;
    return {
      isCollapsed: true,
      startLine: pos.startLine + 1,
      startChar: 0,
      endLine: pos.startLine + 1,
      endChar: 0,
    };
  }

  // Merge line with next line
  public mergeLines(line: number) {
    if (this.lines.length > line + 1) {
      this.lines[line].insertBlocks(this.lines[line + 1].textBlocks, this.lines[line].lineLength);
      this.lines.splice(line + 1, 1);
    }
  }

  public deleteCharacter(pos: EditorV3Position, backwards: boolean): EditorV3Position {
    if (this.lines.length > pos.startLine && this.text !== "") {
      const newPos = { ...pos };
      // Move cursor if start and end are the same
      if (pos.startLine === pos.endLine && pos.startChar === pos.endChar) {
        // Backspace at end of line
        if (backwards && pos.startLine > 0 && pos.startChar === 0) {
          newPos.startChar = this.lines[pos.startLine - 1].lineLength;
          newPos.startLine = pos.startLine - 1;
        }
        // Backspace after first character
        else if (backwards && pos.startChar > 0) {
          newPos.startChar = pos.startChar - 1;
        }
        // Delete end line
        else if (pos.endChar >= this.lines[pos.endLine].lineLength) {
          newPos.endChar = 0;
          newPos.endLine = pos.endLine + 1;
        } else if (pos.endChar < this.lines[pos.endLine].lineLength) {
          newPos.endChar = pos.endChar + 1;
        }
      }
      // Remove under selected
      this.splice(newPos);
      if (pos.isCollapsed) {
        newPos.endLine = newPos.startLine;
        newPos.endChar = newPos.startChar;
      }
      return newPos;
    }
    return pos;
  }

  /**
   * Splice, when converting everything to normal text
   * @param pos Position in markdown
   * @param newLines New lines (not markdown)
   * @returns Markdown cut as lines
   */
  private spliceMarkdown(pos: EditorV3Position, newLines?: EditorV3Line[]): EditorV3Line[] {
    const thisMarkdown = new EditorV3Content(
      this.lines.map((l) => l.toMarkdown(this._markdownSettings)).join("\n"),
    );
    const newLinesMarkdown = newLines?.map(
      (l) => new EditorV3Line(l.toMarkdown(this._markdownSettings)),
    );
    if (
      pos.startLine < thisMarkdown.lines.length &&
      pos.startLine <= pos.endLine &&
      !(pos.startLine === pos.endLine && pos.endChar < pos.startChar)
    ) {
      const ret: EditorV3Line[] = thisMarkdown.subLines(pos);
      const u = thisMarkdown.upToPos(pos.startLine, pos.startChar);
      const f = thisMarkdown.fromPos(pos.endLine, pos.endChar);
      thisMarkdown.lines = [...u, ...(newLinesMarkdown ?? []), ...f];
      // Change back from markdown
      this.lines = thisMarkdown.lines.map(
        (l) =>
          new EditorV3Line(
            new MarkdownLineClass({ line: l.lineText }).toTextBlocks(),
            this.textAlignment,
            this.decimalAlignPercent,
          ),
      );
      this.mergeLines(
        pos.startLine +
          (newLines?.length ?? 0) -
          (pos.startChar < this.lines[pos.startLine].lineLength ? 1 : 0),
      );
      newLines?.length && this.mergeLines(pos.startLine);
      return ret;
    }
    return [];
  }

  public splice(
    pos: EditorV3Position,
    newLines?: EditorV3Line[],
    asMarkdown = false,
  ): EditorV3Line[] {
    if (asMarkdown) {
      return this.spliceMarkdown(pos, newLines);
    } else if (
      pos.startLine < this.lines.length &&
      pos.startLine <= pos.endLine &&
      !(pos.startLine === pos.endLine && pos.endChar < pos.startChar)
    ) {
      const ret: EditorV3Line[] = this.subLines(pos);
      const u = this.upToPos(pos.startLine, pos.startChar);
      const f = this.fromPos(pos.endLine, pos.endChar);
      this.lines = [
        ...u,
        ...(newLines ? newLines.map((l) => new EditorV3Line(l.jsonString)) : []),
        ...f,
      ];
      this.mergeLines(
        pos.startLine +
          (newLines?.length ?? 0) -
          (pos.startChar < this.lines[pos.startLine].lineLength ? 1 : 0),
      );
      newLines?.length && this.mergeLines(pos.startLine);
      return ret;
    }
    return [];
  }

  public applyStyle(styleName: string, pos: EditorV3Position) {
    if (pos.startLine < this.lines.length && pos.startLine <= pos.endLine) {
      for (let _i = pos.startLine; _i <= pos.endLine && _i < this.lines.length; _i++) {
        this.lines[_i].applyStyle(
          styleName,
          _i === pos.startLine ? pos.startChar : 0,
          _i === pos.endLine ? pos.endChar : Infinity,
        );
      }
    }
    return this;
  }

  public removeStyle(pos: EditorV3Position) {
    if (pos.startLine < this.lines.length && pos.startLine <= pos.endLine) {
      for (let _i = pos.startLine; _i <= pos.endLine && _i < this.lines.length; _i++) {
        this.lines[_i].removeStyle(
          _i === pos.startLine ? pos.startChar : 0,
          _i === pos.endLine ? pos.endChar : Infinity,
        );
      }
    }
    return this;
  }
}
