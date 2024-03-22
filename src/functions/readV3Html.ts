import { defaultContentProps } from "../classes/defaultContentProps";
import { EditorV3Line } from "../classes/EditorV3Line";
import { EditorV3ContentPropsInput, EditorV3Import } from "../classes/interface";
import { readContentPropsNode } from "./readContentPropsNode";
import { readV3DivElement } from "./readV3DivElement";
import { readV3MarkdownElement } from "./readV3MarkdownElement";

export const readV3Html = (
  text: string,
  contentProps?: EditorV3ContentPropsInput,
): EditorV3Import => {
  const ret: EditorV3Import = {
    lines: [],
    contentProps,
  };

  // Read in v3-html string input
  if (text.match(/^<div class="aiev3-line.*">.*<\/div>$/)) {
    const frag = document.createElement("div");
    frag.innerHTML = text;

    // Read content props node
    ret.contentProps = readContentPropsNode(frag);

    // Read line nodes
    [...frag.querySelectorAll("div.aiev3-line")].forEach((el) => {
      const div = el as HTMLDivElement;
      ret.lines.push(readV3DivElement(div));
    });
  }
  // Read in v3-markdown string input
  else if (text.match(/^<div class="aiev3-markdown-line.*">.*<\/div>$/)) {
    const frag = document.createElement("div");
    frag.innerHTML = text;

    // Read content props node
    ret.contentProps = readContentPropsNode(frag);

    // Read line nodes
    [...frag.querySelectorAll("div.aiev3-markdown-line")].forEach((el) => {
      const div = el as HTMLDivElement;
      const lineRet = readV3MarkdownElement(div, {
        ...defaultContentProps,
        ...ret.contentProps,
        ...contentProps,
      });
      ret.lines.push(lineRet);
    });
  }
  // Everything else is just text(ish)
  else {
    ret.lines = text
      .replace(/[\u2009-\u200F\r\t]/g, "") // Undesirable non-printing chars
      .replaceAll("</div><div", "</div>\n<div")
      .split("\n")
      .map((l) => new EditorV3Line(l, contentProps));
  }

  // Always take contentProps from the input if it exists
  if (contentProps) ret.contentProps = contentProps;
  return ret;
};
