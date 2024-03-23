import { EditorV3TextBlock } from "../classes";
import { EditorV3PositionClass } from "../classes/EditorV3Position";
import { EditorV3PositionF } from "../classes/interface";
import { getCaretPosition } from "./getCaretPosition";
import { getTextNodeAtOffset } from "./getTextNodeAtOffset";

export function setCaretPosition(el: Node, pos: EditorV3PositionClass): EditorV3PositionF | null {
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
        // First character on the line needs to be before a locked section
        if (
          range.startContainer === range.endContainer &&
          range.startOffset === 0 &&
          range.endOffset === 0 &&
          range.startContainer instanceof Text &&
          range.startContainer.parentElement instanceof HTMLSpanElement &&
          range.startContainer.parentElement.classList.contains("is-locked")
        ) {
          const emptyTextBlock = new EditorV3TextBlock({ text: "\u200d" });
          const newSpan = emptyTextBlock.toHtml({}).childNodes[0] as HTMLSpanElement;
          // Add newTextNode before the locked span
          range.startContainer.parentElement.before(newSpan);
          range.setStart(newSpan, 0);
          range.setEnd(newSpan, 0);
        }
        // Backwards selection
        if (pos.data.focusAt === "start") {
          sel.setBaseAndExtent(
            range.endContainer,
            range.endOffset,
            range.startContainer,
            range.startOffset,
          );
        }
        // Normal selection
        else {
          sel.addRange(range);
        }
      }
    }
    const ret = el instanceof HTMLDivElement ? getCaretPosition(el) : null;
    return ret;
  }
  return null;
}
