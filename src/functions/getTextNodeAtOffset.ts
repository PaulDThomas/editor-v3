export const getTextNodeAtOffset = (
  el: Element,
  offset: number,
): { node: Text; offset: number } | null => {
  let currentPos = 0;
  if (el)
    for (let _i = 0; _i < el.childNodes.length && currentPos <= offset; _i++) {
      const currentNode = el.childNodes[_i] as Node;
      if (currentPos + (currentNode?.textContent ?? '').length < offset) {
        currentPos += (currentNode?.textContent ?? '').length;
      } else if (currentNode instanceof Element) {
        return getTextNodeAtOffset(currentNode, offset - currentPos);
      } else if (currentNode instanceof Text) {
        return { node: currentNode, offset: offset - currentPos };
      }
    }
  return null;
};
