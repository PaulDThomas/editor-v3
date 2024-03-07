import { EditorV3Position } from "../classes/interface";
import { getCaretPosition } from "./getCaretPosition";
import { getTextNodeAtOffset } from "./getTextNodeAtOffset";

export function setCaretPosition(el: Node, pos: EditorV3Position): EditorV3Position | null {
  // Go to a lower line if required
  const lines = el instanceof Element ? el.querySelectorAll("div.aiev3-line") : null;
  if (lines && pos.startLine < lines.length) {
    const f = getTextNodeAtOffset(lines[pos.startLine], pos.startChar);
    const l = getTextNodeAtOffset(lines[pos.endLine], pos.endChar);
    if (f) {
      const range = document.createRange();
      range.setStart(f.node, f.offset);
      if (l) {
        range.setEnd(l.node, l.offset);
      }
      const sel = window.getSelection();
      if (sel && document.contains(range.startContainer) && document.contains(range.endContainer)) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    const ret = el instanceof HTMLDivElement ? getCaretPosition(el) : null;
    return ret;
  }
  return null;
}
