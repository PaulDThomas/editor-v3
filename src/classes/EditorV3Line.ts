import { drawHtmlDecimalAlign } from './drawHtmlDecimalAlign';
import { EditorV3TextBlock } from './EditorV3TextBlock';
import { EditorV3Align } from './interface';
import { readV3DivElement } from './readV3DivElement';

export class EditorV3Line {
  public textBlocks: EditorV3TextBlock[];
  public textAlignment: EditorV3Align;
  public decimalAlignPercent: number;

  // Read only variables
  get el(): HTMLDivElement {
    const h = document.createElement('div');
    h.className = `aiev3-line ${this.textAlignment}`;
    if (this.textAlignment === EditorV3Align.decimal) {
      drawHtmlDecimalAlign(h, this.lineText, this.decimalAlignPercent);
    } else {
      this.textBlocks.forEach((tb) => h.append(tb.el));
    }
    return h;
  }

  get lineText(): string {
    return this.textBlocks.map((tb) => tb.text).join('');
  }

  get jsonString(): string {
    return JSON.stringify(this, [
      'textBlocks',
      'textAlignment',
      'decimalAlignPercent',
      'text',
      'style',
    ]);
  }

  // Constructor
  constructor(
    arg: string | HTMLDivElement | EditorV3TextBlock[],
    textAlignment?: EditorV3Align,
    decimalAlignPercent?: number,
  ) {
    // Set defaults
    this.textBlocks = [];
    this.decimalAlignPercent = 60;
    this.textAlignment = EditorV3Align.left;
    // Text
    if (typeof arg === 'string') {
      // Decimal html string
      if (arg.match(/^<div class="aiev3-line .*">.*<\/div>$/)) {
        const h = document.createElement('template');
        h.innerHTML = arg;
        const d = h.content.children[0] as HTMLDivElement;
        const ret = readV3DivElement(d);
        this.textBlocks = ret.textBlocks;
        this.decimalAlignPercent = ret.decimalAlignPercent;
        this.textAlignment = ret.textAlignment;
      }
      // Standard or JSON text
      else {
        try {
          const jsonInput = JSON.parse(arg);
          if (jsonInput.textBlocks) {
            this.textBlocks = jsonInput.textBlocks.map(
              (tb: string | { text: string; style?: string }) => new EditorV3TextBlock(tb),
            );
          } else {
            throw 'No blocks';
          }
          if (jsonInput.decimalAlignPercent)
            this.decimalAlignPercent = jsonInput.decimalAlignPercent;
          if (jsonInput.textAlignment) this.textAlignment = jsonInput.textAlignment;
        } catch {
          this.textBlocks = [new EditorV3TextBlock(arg)];
        }
      }
    } else if (Array.isArray(arg)) {
      this.textBlocks = arg;
    }
    // HTMLDivElement
    else {
      const ret = readV3DivElement(arg);
      this.textBlocks = ret.textBlocks;
      this.decimalAlignPercent = ret.decimalAlignPercent;
      this.textAlignment = ret.textAlignment;
    }

    // Always take these if provided
    if (decimalAlignPercent) this.decimalAlignPercent = decimalAlignPercent;
    if (textAlignment) this.textAlignment = textAlignment;
  }

  public upToPos(pos: number): EditorV3TextBlock[] {
    const ret: EditorV3TextBlock[] = [];
    let _counted = 0;
    for (let _i = 0; _i < this.textBlocks.length; _i++) {
      if (_counted + this.textBlocks[_i].text.length < pos) {
        _counted += this.textBlocks[_i].text.length;
        ret.push(this.textBlocks[_i]);
      } else if (_counted + this.textBlocks[_i].text.length >= pos) {
        ret.push(
          new EditorV3TextBlock(
            this.textBlocks[_i].text.slice(0, pos - _counted),
            this.textBlocks[_i].style,
          ),
        );
        break;
      }
    }
    return ret;
  }

  public fromPos(pos: number): EditorV3TextBlock[] {
    const ret: EditorV3TextBlock[] = [];
    let _counted = 0;
    for (let _i = 0; _i < this.textBlocks.length; _i++) {
      if (_counted + this.textBlocks[_i].text.length < pos) {
        _counted += this.textBlocks[_i].text.length;
      } else if (_counted > pos) {
        ret.push(this.textBlocks[_i]);
        _counted += this.textBlocks[_i].text.length;
      } else if (_counted + this.textBlocks[_i].text.length >= pos) {
        if (this.textBlocks[_i].text.slice(pos - _counted) !== '')
          ret.push(
            new EditorV3TextBlock(
              this.textBlocks[_i].text.slice(pos - _counted),
              this.textBlocks[_i].style,
            ),
          );
        _counted += this.textBlocks[_i].text.length;
      }
    }
    return ret;
  }

  public splitLine(pos: number): EditorV3Line | null {
    if (pos === this.lineText.length) {
      return new EditorV3Line('', this.textAlignment, this.decimalAlignPercent);
    } else if (pos < this.lineText.length) {
      const preSplit = this.upToPos(pos);
      const postSplit = this.fromPos(pos);
      this.textBlocks = preSplit;
      return new EditorV3Line(postSplit, this.textAlignment, this.decimalAlignPercent);
    }
    return null;
  }

  public deleteCharacter(pos: number) {
    const pre = this.upToPos(pos);
    const post = this.fromPos(pos + 1);
    this.textBlocks = [...pre, ...post];
  }

  // applyStyle(styleName: string, start: number, end: number) {
  //   this.styleBlocks = explodeLine(
  //     [
  //       { styleName, start, end },
  //       ...this.styleBlocks // Add existing styleBlocks
  //         .filter((b) => b.start < start || b.end > end), // Remove any covered styleBlcoks
  //     ],
  //     this.text.length,
  //   );
  // }

  // removeStyle(start: number, end: number) {
  //   this.styleBlocks = explodeLine(
  //     [
  //       { start, end },
  //       ...this.styleBlocks // Add existing styleBlocks
  //         .filter((b) => b.start < start || b.end > end), // Remove any covered styleBlcoks
  //     ],
  //     this.text.length,
  //   );
  // }
}
