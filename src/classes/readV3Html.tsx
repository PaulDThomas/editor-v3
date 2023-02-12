import { EditorV3Line } from './EditorV3Line';
import { EditorV3Align, EditorV3Import } from './interface';

export const readV3Html = (
  text: string,
  textAlignment: EditorV3Align,
  decimalAlignPercent: number,
): EditorV3Import => {
  const ret: EditorV3Import = {
    lines: [],
  };

  // Read in v3-html string input
  if (text.match(/^<div class="aiev3-line.*">.*<\/div>$/)) {
    const frag = document.createElement('div');
    frag.innerHTML = text;

    // Loop through children in fragment
    [...frag.childNodes].forEach((el) => {
      ret.lines.push(new EditorV3Line(el.textContent ?? '', textAlignment, decimalAlignPercent));
    });
  }
  // Everything else is just text
  else {
    ret.lines = text
      .replace(/[\u200B-\u200F\uFEFF\r\t]/g, '') // Undesirable non-printing chars
      .replace(/[\u202F|\u00A0]/g, ' ') // Spaces are spaces
      .split('\n')
      .map((l) => new EditorV3Line(l, textAlignment, decimalAlignPercent));
  }
  return ret;
};
