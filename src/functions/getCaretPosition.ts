import { EditorV3Position } from '../classes/interface';

export function getCaretPosition(
  element: HTMLDivElement,
  target?: Range | null,
): EditorV3Position | null {
  let range: Range;
  let preCaretRange: Range;
  if (!target) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
      preCaretRange = range.cloneRange();
    } else {
      return null;
    }
  } else {
    range = target;
    preCaretRange = target.cloneRange();
  }
  const f = (
    range.startContainer instanceof Element
      ? range.startContainer
      : (range.startContainer.parentElement as Element)
  ).closest('div.aiev3-line');
  const startLine =
    f && element.contains(f) && f.parentElement
      ? [...f.parentElement.querySelectorAll('div.aiev3-line')].indexOf(f)
      : null;
  if (startLine === null || !f) return null;
  preCaretRange.selectNodeContents(f);
  preCaretRange.setEnd(range.startContainer, range.startOffset);
  const startChar = preCaretRange.toString().replace(/\u200b/, '').length;

  const l = (
    range.endContainer instanceof Element
      ? range.endContainer
      : (range.endContainer.parentElement as Element)
  ).closest('div.aiev3-line');
  const endLine =
    l && element.contains(l) && l.parentElement ? [...l.parentElement.children].indexOf(l) : -1;
  let endChar: number;
  if (l) {
    preCaretRange.selectNodeContents(l);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    endChar = preCaretRange.toString().replace(/\u200b/, '').length;
  } else {
    endChar = -1;
  }

  return {
    startLine,
    startChar,
    endLine,
    endChar,
    isCollapsed: startLine === endLine && startChar === endChar,
  };
}
