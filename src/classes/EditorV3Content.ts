import { EditorV3Line } from './EditorV3Line';
import {
  EditorV3Align,
  EditorV3ContentProps,
  EditorV3Import,
  EditorV3Position,
  EditorV3Styles,
} from './interface';
import { readV3Html } from './readV3Html';

export class EditorV3Content {
  // Standard attributes
  private _textAlignment: EditorV3Align = EditorV3Align.left;
  get textAlignment() {
    return this._textAlignment;
  }
  set textAlignment(newTa: EditorV3Align) {
    if (newTa !== this._textAlignment) {
      this.lines.forEach((l) => (l.textAlignment = newTa));
      this._textAlignment = newTa;
    }
  }

  private _decimalAlignPercent = 60;
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
  get styles() {
    return this._styles;
  }
  set styles(newStyles: EditorV3Styles) {
    this._styles = newStyles;
  }

  public lines: EditorV3Line[] = [];

  private _styleNode(): HTMLDivElement {
    const sn = document.createElement('div');
    sn.className = 'aiev3-line style-info';
    sn.dataset.style = JSON.stringify(this._styles);
    return sn;
  }

  // Read only attributes
  get el(): DocumentFragment {
    const ret = new DocumentFragment();
    if (Object.keys(this._styles).length > 0) ret.append(this._styleNode());
    this.lines.forEach((l) => ret.append(l.el));
    return ret;
  }

  get text(): string {
    return this.lines.map((l) => l.textBlocks.map((b) => b.text).join('')).join('\n');
  }

  get jsonString(): string {
    return JSON.stringify({
      lines: this.lines,
      textAlignment: this._textAlignment,
      decimalAlignPercent: this._decimalAlignPercent,
      styles: this._styles,
    });
  }

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
      if (!Array.isArray(jsonInput.lines)) throw 'No lines';
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
    this._textAlignment = props?.textAlignment ?? read.textAlignment ?? EditorV3Align.left;
    this._decimalAlignPercent = props?.decimalAlignPercent ?? read.decimalAlignPercent ?? 60;
    this._styles = props?.styles ?? read.styles ?? {};
    this.lines = read.lines.map((l) =>
      l instanceof EditorV3Line
        ? l
        : new EditorV3Line(JSON.stringify(l), this._textAlignment, this._decimalAlignPercent),
    );
  }

  public subLines(pos: EditorV3Position) {
    let ret: EditorV3Line[] = [];
    if (pos.startLine < this.lines.length && pos.startLine <= pos.endLine) {
      ret = [
        ...(pos.startLine === pos.endLine
          ? [
              new EditorV3Line(
                this.lines[pos.startLine].subBlocks(pos.startChar, pos.endChar),
                this._textAlignment,
                this._decimalAlignPercent,
              ),
            ]
          : [
              new EditorV3Line(
                this.lines[pos.startLine].subBlocks(pos.startChar),
                this._textAlignment,
                this._decimalAlignPercent,
              ),
              ...this.lines.slice(pos.startLine + 1, pos.endLine),
            ]),
        ...(pos.endLine > pos.startLine && pos.endLine < this.lines.length
          ? [
              new EditorV3Line(
                this.lines[pos.endLine].subBlocks(0, pos.endChar),
                this._textAlignment,
                this._decimalAlignPercent,
              ),
            ]
          : []),
      ];
    }
    return ret;
  }

  public upToPos(endLine: number, endChar: number): EditorV3Line[] {
    return this.subLines({ startLine: 0, startChar: 0, endLine, endChar });
  }

  public fromPos(startLine: number, startChar: number): EditorV3Line[] {
    return this.subLines({ startLine, startChar, endLine: Infinity, endChar: Infinity });
  }

  // Split line in two
  public splitLine(pos: EditorV3Position) {
    // Check it is possible
    if (this.lines.length > pos.startLine && pos.isCollapsed) {
      // Split existing line, and get new one
      const newLine = this.lines[pos.startLine].splitLine(pos.startChar);
      // Add new one in
      if (newLine) this.lines.splice(pos.startLine + 1, 0, newLine);
    } else if (this.lines.length > pos.startLine) {
      const newLines = [
        ...this.upToPos(pos.startLine, pos.startChar),
        ...this.fromPos(pos.endLine, pos.endChar),
      ];
      this.lines = newLines;
    }
  }

  // Merge line with next line
  public mergeLines(line: number) {
    if (this.lines.length > line + 1) {
      this.lines[line].textBlocks.push(...this.lines[line + 1].textBlocks);
      this.lines.splice(line + 1, 1);
    }
  }

  public deleteCharacter(pos: EditorV3Position) {
    if (this.lines.length > pos.startLine) this.lines[pos.startLine].deleteCharacter(pos.startChar);
  }

  public removeSection(pos: EditorV3Position): EditorV3Line[] {
    const ret: EditorV3Line[] = this.subLines(pos);
    this.lines = [
      ...this.upToPos(pos.startLine, pos.startChar),
      ...this.fromPos(pos.endLine, pos.endChar),
    ];
    this.mergeLines(pos.startLine);
    return ret;
  }
}
