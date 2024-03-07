import { EditorV3Position } from "../classes/interface";

export function getCaretPosition(element: HTMLDivElement): EditorV3Position | null {
  let range: Range;
  let preCaretRange: Range;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    range = sel.getRangeAt(0);
    preCaretRange = range.cloneRange();
  } else {
    return null;
  }

  const f = (
    range.startContainer instanceof Element
      ? range.startContainer
      : (range.startContainer.parentElement as Element)
  ).closest("div.aiev3-line, div.aiev3-markdown-line");
  const startLine =
    f && element.contains(f) && f.parentElement
      ? [...f.parentElement.querySelectorAll("div.aiev3-line, div.aiev3-markdown-line")].indexOf(f)
      : null;
  if (startLine === null || !f) return null;
  preCaretRange.selectNodeContents(f);
  preCaretRange.setEnd(range.startContainer, range.startOffset);
  const startChar = preCaretRange.toString().replace(/[\u2009-\u200F]/, "").length;

  const l = (
    range.endContainer instanceof Element
      ? range.endContainer
      : (range.endContainer.parentElement as Element)
  ).closest("div.aiev3-line, div.aiev3-markdown-line");
  const endLine =
    l && element.contains(l) && l.parentElement ? [...l.parentElement.children].indexOf(l) : -1;
  let endChar = -1;
  if (l) {
    preCaretRange.selectNodeContents(l);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    endChar = preCaretRange.toString().replace(/[\u2009-\u200F]/, "").length;
  }
  return {
    startLine,
    startChar,
    endLine,
    endChar,
    isCollapsed: startLine === endLine && startChar === endChar,
  };
}
