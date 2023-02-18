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

    // Fix and problems
    this._mergeBlocks();
  }

  public subBlocks(startPos: number, endPos?: number): EditorV3TextBlock[] {
    const ret: EditorV3TextBlock[] = [];
    let _counted = 0;
    for (let _i = 0; _i < this.textBlocks.length; _i++) {
      // Block containing startPos
      if (
        _counted <= startPos &&
        _counted + this.textBlocks[_i].text.length >= startPos &&
        this.textBlocks[_i].text.slice(startPos - _counted, (endPos ?? Infinity) - _counted) !== ''
      ) {
        ret.push(
          new EditorV3TextBlock(
            this.textBlocks[_i].text.slice(startPos - _counted, (endPos ?? Infinity) - _counted),
            this.textBlocks[_i].style,
          ),
        );
      }
      // Block after start containing end
      else if (
        _counted > startPos &&
        endPos &&
        _counted + this.textBlocks[_i].text.length >= endPos
      ) {
        ret.push(
          new EditorV3TextBlock(
            this.textBlocks[_i].text.slice(0, endPos - _counted),
            this.textBlocks[_i].style,
          ),
        );
      }
      // Block after start and before end
      else if (
        _counted > startPos &&
        _counted + this.textBlocks[_i].text.length < (endPos ?? Infinity)
      ) {
        ret.push(this.textBlocks[_i]);
      }
      _counted += this.textBlocks[_i].text.length;
      // Stop if the end is reached
      if (_counted >= (endPos ?? Infinity)) break;
    }
    return ret;
  }

  public upToPos(pos: number): EditorV3TextBlock[] {
    return this.subBlocks(0, pos);
  }

  public fromPos(pos: number): EditorV3TextBlock[] {
    return this.subBlocks(pos);
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

  public insertBlocks(newTextBlocks: EditorV3TextBlock[], pos: number) {
    if (pos < this.lineText.length) {
      const pre = this.upToPos(pos);
      const post = this.fromPos(pos);
      this.textBlocks = [...pre, ...newTextBlocks, ...post];
      this._mergeBlocks();
    }
  }

  public removeSection(startPos: number, endPos: number) {
    if (startPos < endPos && startPos < this.lineText.length) {
      const pre = this.upToPos(startPos);
      const post = this.fromPos(endPos);
      this.textBlocks = [...pre, ...post];
      this._mergeBlocks();
    }
  }

  public deleteCharacter(pos: number) {
    this.removeSection(pos, pos + 1);
  }

  public applyStyle(styleName: string, startPos: number, endPos: number) {
    if (startPos < endPos) {
      this.textBlocks = [
        ...this.upToPos(startPos),
        new EditorV3TextBlock(this.lineText.substring(startPos, endPos), styleName),
        ...this.fromPos(endPos),
      ];
      this._mergeBlocks();
    }
  }

  public removeStyle(startPos: number, endPos: number) {
    if (startPos < endPos) {
      this.textBlocks = [
        ...this.upToPos(startPos),
        new EditorV3TextBlock(this.lineText.substring(startPos, endPos)),
        ...this.fromPos(endPos),
      ];
      this._mergeBlocks();
    }
  }

  private _mergeBlocks() {
    if (new Set(this.textBlocks.map((tb) => tb.style)).size < this.textBlocks.length) {
      const mergedBlocks: EditorV3TextBlock[] = [];
      let lastStyle: string | null | undefined = null;
      for (let _i = 0; _i < this.textBlocks.length; _i++) {
        if (this.textBlocks[_i].style === lastStyle && mergedBlocks.length > 0) {
          mergedBlocks[mergedBlocks.length - 1] = new EditorV3TextBlock(
            mergedBlocks[mergedBlocks.length - 1].text + this.textBlocks[_i].text,
            lastStyle,
          );
        } else {
          mergedBlocks.push(this.textBlocks[_i]);
          lastStyle = this.textBlocks[_i].style;
        }
      }
      if (mergedBlocks.length < this.textBlocks.length) {
        this.textBlocks = mergedBlocks;
      }
    }
  }
}
