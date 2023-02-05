export function setCaretPosition(el: Node, position: number): number {
  if ((el.textContent?.length ?? 0) < position) {
    return el.textContent?.length ?? 0;
  } else if (el.nodeName === '#text' && (el.textContent?.length ?? 0) >= position) {
    const range = window.getSelection();
    range?.setPosition(el, position);
    return -1;
  } else {
    let curPos = 0;
    for (let i = 0; i < el.childNodes.length; i++) {
      curPos = setCaretPosition(el.childNodes[i], position - curPos);
      if (curPos === -1) break;
    }
    return curPos;
  }
}
