import { EditorV3Line } from "./EditorV3Line";
import { EditorV3Align, EditorV3Import } from "./interface";
import { readV3DivElement } from "./readV3DivElement";

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
    const frag = document.createElement("div");
    frag.innerHTML = text;

    // Read line nodes
    [...frag.querySelectorAll("div.aiev3-line")].forEach((el) => {
      const div = el as HTMLDivElement;
      ret.lines.push(readV3DivElement(div));
      // Get alignment from second classname
      if (!ret.textAlignment && div.classList.length > 1) {
        ret.textAlignment = el.classList[1].toString() as EditorV3Align;
      }
      // Get decimal align percent from mid width
      if (ret.textAlignment === EditorV3Align.decimal && el.children.length === 2) {
        ret.decimalAlignPercent = parseFloat((el.children[0] as HTMLSpanElement).style.minWidth);
      }
    });

    // Read style node
    const styleNode = frag.querySelector("div.aiev3-style-info");
    if (styleNode && (styleNode as HTMLDivElement).dataset.style !== "") {
      ret.styles = JSON.parse((styleNode as HTMLDivElement).dataset.style ?? "");
    }
  }
  // Everything else is just text(ish)
  else {
    ret.lines = text
      .replace(/[\u200B-\u200F\uFEFF\r\t]/g, "") // Undesirable non-printing chars
      .replace(/[\u202F|\u00A0]/g, " ") // Spaces are spaces
      .replaceAll("</div><div", "</div>\n<div")
      .replaceAll("&nbsp;", " ")
      .split("\n")
      .map((l) => new EditorV3Line(l, textAlignment, decimalAlignPercent));
  }
  return ret;
};
