import { drawHtmlDecimalAlign } from './drawHtmlDecimalAlign';
import { EditorV3TextBlock } from './EditoryV3TextBlock';
import { EditorV3Align } from './interface';

export class EditorV3Line {
  public textBlocks: EditorV3TextBlock[];
  public textAlignment: EditorV3Align;
  public decimalAlignPercent: number;

  // Read only variables
  get el(): HTMLDivElement {
    const h = document.createElement('div');
    h.className = `aiev3-line ${this.textAlignment}`;
    if (this.textAlignment === EditorV3Align.decimal) {
      drawHtmlDecimalAlign(h, this.text, this.decimalAlignPercent);
    } else {
      this.textBlocks.forEach((tb) => h.append(tb.el));
    }
    return h;
  }

  get text(): string {
    return this.textBlocks.map((tb) => tb.text).join('');
  }

  // Constructor
  constructor(
    arg: string | EditorV3TextBlock[],
    textAlignment?: EditorV3Align,
    decimalAlignPercent?: number,
  ) {
    this.textBlocks = [];
    this.decimalAlignPercent = decimalAlignPercent ?? 60;
    this.textAlignment = textAlignment ?? EditorV3Align.left;
    if (typeof arg === 'string') {
      // Decimal html string
      if (arg.match(/^<div class="aiev3-decimal-line">.*<\/div>$/)) {
        const h = document.createElement('div');
        h.innerHTML = arg;
        this.textBlocks = [new EditorV3TextBlock(h.textContent ?? '')];
      }
      // Normal line html string
      else if (arg.match(/^<div class="aiev3-line">.*<\/div>$/)) {
        const h = document.createElement('div');
        h.innerHTML = arg;
        this.textBlocks = [
          ...[...h.children[0].childNodes].map(
            (el) =>
              new EditorV3TextBlock(el instanceof HTMLSpanElement || el instanceof Text ? el : ''),
          ),
        ];
      }
      // Standard text
      else {
        this.textBlocks = [new EditorV3TextBlock(arg)];
      }
    } else if (Array.isArray(arg)) {
      this.textBlocks =
        this.textAlignment !== EditorV3Align.decimal
          ? arg.map((l) => (l instanceof EditorV3TextBlock ? l : new EditorV3TextBlock(l)))
          : [new EditorV3TextBlock(arg.map((tb) => tb.text).join(''))];
    }
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
    if (pos === this.text.length) {
      return new EditorV3Line('', this.textAlignment, this.decimalAlignPercent);
    } else if (pos < this.text.length) {
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
