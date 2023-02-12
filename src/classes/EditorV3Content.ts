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

  // Read only attributes
  get el(): DocumentFragment {
    const ret = new DocumentFragment();
    this.lines.forEach((l) => ret.append(l.el));
    return ret;
  }

  get text(): string {
    return this.lines.map((l) => l.textBlocks.map((b) => b.text).join('')).join('\n');
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
      this.copyFrom(jsonInput, props);
    } catch {
      // Establish input as string
      const inputString = input as string;
      // Read in v3 HTML/text
      // console.log('Processing input as text/V3 HTML');
      const r = readV3Html(inputString, this._textAlignment, this._decimalAlignPercent);
      this.copyFrom(r, props);
      return;
    }
  }

  private copyFrom(read: EditorV3Import, props?: EditorV3ContentProps): void {
    this._textAlignment = props?.textAlignment ?? read.textAlignment ?? EditorV3Align.left;
    this._decimalAlignPercent = props?.decimalAlignPercent ?? read.decimalAlignPercent ?? 60;
    this._styles = props?.styles ?? read.styles ?? {};
    this.lines = read.lines;
  }

  private upToPos(line: number, char: number): EditorV3Line[] {
    const ret: EditorV3Line[] = [
      ...this.lines.slice(0, line),
      new EditorV3Line(
        this.lines[line].upToPos(char),
        this.textAlignment,
        this.decimalAlignPercent,
      ),
    ];

    return ret;
  }

  private fromPos(line: number, char: number): EditorV3Line[] {
    const ret: EditorV3Line[] = [];
    if (this.lines.length > line && this.lines[line].fromPos(char).length > 0) {
      ret.push(
        new EditorV3Line(
          this.lines[line].fromPos(char),
          this.textAlignment,
          this.decimalAlignPercent,
        ),
      );
    }
    ret.push(...this.lines.slice(line + 1));
    return ret;
  }

  // Split line in two
  public splitLine(pos: EditorV3Position) {
    // Check it is possible
    if (this.lines.length > pos.startLine && (pos.isCollapsed || pos.endLine === null)) {
      // Split existing line, and get new one
      const newLine = this.lines[pos.startLine].splitLine(pos.startChar);
      // Add new one in
      if (newLine) this.lines.splice(pos.startLine + 1, 0, newLine);
    } else if (pos.endChar && pos.endLine) {
      console.log(`Need to delete lots: ${JSON.stringify(pos)}`);
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
}
