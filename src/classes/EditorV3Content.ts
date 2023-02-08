import { drawHtmlLineFragment } from './drawHtmlLineFragment';
import {
  EditorV3Align,
  EditorV3Styles,
  EditorV3Line,
  EditorV3Position,
  EditorV3Props,
  EditorV3Import,
} from './interface';
import { readV3Html } from './readV3Html';

export class EditorV3Content {
  textAlignment: EditorV3Align;
  decimalAlignPercent?: number;
  styles?: EditorV3Styles;
  lines: EditorV3Line[];
  caret?: EditorV3Position;

  constructor(input: string, props?: EditorV3Props) {
    // Defaults
    this.textAlignment = EditorV3Align.left;
    this.decimalAlignPercent = 60;
    this.styles = {};
    this.lines = [];

    // Process incoming data
    try {
      // Check for stringified class input
      const jsonInput = JSON.parse(input);
      if (jsonInput instanceof EditorV3Content) {
        this.copyFrom(jsonInput, props);
        return;
      } else {
        throw 'Bad JSON input';
      }
    } catch {
      // Establish input as string
      const inputString = input as string;
      // Read in v3 HTML/text
      console.log('Processing input as text/V3 HTML');
      this.copyFrom(readV3Html(inputString), props);
      return;
    }
  }

  copyFrom(read: EditorV3Import, props?: EditorV3Props): void {
    this.textAlignment = props?.textAlignment ?? read.textAlignment ?? EditorV3Align.left;
    this.decimalAlignPercent = props?.decimalAlignPercent ?? read.decimalAlignPercent;
    this.caret = props?.caret ?? read.caret;
    this.styles = props?.styles ?? read.styles;
    this.lines = read.lines;
  }

  innerHtml(): DocumentFragment {
    const ret = new DocumentFragment();
    this.lines.forEach((l) =>
      ret.appendChild(
        drawHtmlLineFragment(
          this.textAlignment,
          this.decimalAlignPercent ?? 60,
          l.textBlocks.map((b) => b.text).join(''),
        ),
      ),
    );
    return ret;
  }

  text(): string {
    return this.lines.map((l) => l.textBlocks.map((b) => b.text).join('')).join('\n');
  }
}
