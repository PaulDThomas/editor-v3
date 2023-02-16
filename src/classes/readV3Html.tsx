import { EditorV3Line } from './EditorV3Line';
import { EditorV3Align, EditorV3Import } from './interface';
import { readV3DivElement } from './readV3DivElement';

export const readV3Html = (
  text: string,
  textAlignment?: EditorV3Align,
  decimalAlignPercent?: number,
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
      const div = el as HTMLDivElement;
      // Read style node
      if (div.classList.contains('style-info')) {
        ret.styles = JSON.parse(div.dataset.style ?? '');
      }
      // Read line nodes
      else ret.lines.push(readV3DivElement(div));
    });

    // Get alignment from second classname
    const firstLine =
      [...frag.children].filter((el) => !el.classList.contains('style-info')).length > 0
        ? [...frag.children].filter((el) => !el.classList.contains('style-info'))[0]
        : (null as HTMLDivElement | null);
    if (firstLine) {
      if (firstLine.classList.length > 1) {
        ret.textAlignment = firstLine.classList[1].toString() as EditorV3Align;
      }
      if (ret.textAlignment === EditorV3Align.decimal && firstLine.children.length === 2) {
        ret.decimalAlignPercent = parseFloat(
          (firstLine.children[0] as HTMLSpanElement).style.minWidth,
        );
      }
    }
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
