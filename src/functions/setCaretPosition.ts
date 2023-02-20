import { EditorV3Position } from '../classes/interface';

export function setCaretPosition(el: Node, position: EditorV3Position): number {
  // Go to a lower line if required
  if (
    position.startLine > 0 &&
    el instanceof Element &&
    position.startLine <= el.querySelectorAll('.aiev3-line').length
  ) {
    return setCaretPosition(el.querySelectorAll('div.aiev3-line')[position.startLine], {
      startLine: 0,
      startChar: position.startChar,
      isCollapsed: true,
      endLine: 0,
      endChar: position.startChar,
    });
  }
  // Must be on the current line, just use startChar
  if ((el?.textContent?.length ?? 0) < position.startChar) {
    return el?.textContent?.length ?? 0;
  }
  // No text node to enter
  else if ((el?.textContent?.length ?? 0) === 0 && position.startChar === 0) {
    const range = window.getSelection();
    range?.setPosition(el, 0);
    return -1;
  }
  // Standard set position
  else if (el.nodeName === '#text' && (el.textContent?.length ?? 0) >= position.startChar) {
    const range = window.getSelection();
    range?.setPosition(el, position.startChar);
    return -1;
  } else {
    let curPos = 0;
    for (let i = 0; i < el.childNodes.length; i++) {
      curPos = setCaretPosition(el.childNodes[i], {
        startLine: 0,
        startChar: position.startChar - curPos,
        isCollapsed: true,
        endLine: 0,
        endChar: position.startChar - curPos,
      });
      if (curPos === -1) break;
    }
    return curPos;
  }
}
