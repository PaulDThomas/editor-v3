import { EditorV3Position } from '../classes/interface';

export function getCaretPosition(element: HTMLDivElement): EditorV3Position | null {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();

    if (!sel.anchorNode || !sel.focusNode) return null;

    const firstNode =
      sel.anchorNode.compareDocumentPosition(sel.focusNode) & Node.DOCUMENT_POSITION_FOLLOWING
        ? sel.anchorNode
        : sel.focusNode;
    const lastNode =
      sel.anchorNode.compareDocumentPosition(sel.focusNode) & Node.DOCUMENT_POSITION_FOLLOWING
        ? sel.focusNode
        : sel.anchorNode;
    // Get anchor node position (should be the same as focusNode as collapsed)
    const f = firstNode.parentElement?.closest('div.aiev3-line');
    const startLine =
      f && element.contains(f) && f.parentElement
        ? [...f.parentElement.querySelectorAll('div.aiev3-line')].indexOf(f)
        : null;
    if (startLine === null || !f) return null;
    preCaretRange.selectNodeContents(f);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const startChar = preCaretRange.toString().replace(/\u200b/, '').length;

    const l = lastNode.parentElement?.closest('div.aiev3-line');
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
      isCollapsed: sel.isCollapsed ?? false,
    };
  }
  return null;
}
