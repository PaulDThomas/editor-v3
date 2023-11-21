import { EditorV3Line } from "../classes/EditorV3Line";
import { EditorV3Align, EditorV3Import } from "../classes/interface";
import { IMarkdownSettings, defaultMarkdownSettings } from "../classes/markdown/MarkdownSettings";
import { readV3DivElement } from "./readV3DivElement";
import { readV3MarkdownElement } from "./readV3MarkdownElement";

export const readV3Html = (
  text: string,
  textAlignment = EditorV3Align.left,
  decimalAlignPercent = 60,
  markdownSettings: IMarkdownSettings = defaultMarkdownSettings,
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
    });

    // Read style node
    const styleNode = frag.querySelector("div.aiev3-style-info");
    if (styleNode && (styleNode as HTMLDivElement).dataset.style !== "") {
      ret.styles = JSON.parse((styleNode as HTMLDivElement).dataset.style ?? "");
    }
  }
  // Read in v3-markdown string input
  else if (text.match(/^<div class="aiev3-markdown-line.*">.*<\/div>$/)) {
    const frag = document.createElement("div");
    frag.innerHTML = text;

    // Read line nodes
    [...frag.querySelectorAll("div.aiev3-markdown-line")].forEach((el) => {
      const div = el as HTMLDivElement;
      const lineRet = readV3MarkdownElement(div, markdownSettings);
      ret.lines.push(lineRet);
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
      .replace(/[\u2009-\u200F\uFEFF\r\t]/g, "") // Undesirable non-printing chars
      .replaceAll("</div><div", "</div>\n<div")
      .split("\n")
      .map((l) => new EditorV3Line(l, textAlignment, decimalAlignPercent));
  }
  return ret;
};
