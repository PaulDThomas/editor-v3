export const getTextNodeAtOffset = (
  el: Element,
  offset: number,
): { node: Text; offset: number } | null => {
  let currentPos = 0;
  if (el)
    for (let _i = 0; _i < el.childNodes.length && currentPos <= offset; _i++) {
      const currentNode = el.childNodes[_i] as Node;
      // Ignore the high space characters
      if (
        currentPos + (currentNode?.textContent?.replace(/[\u2009-\u200f]/g, "") ?? "").length <
        offset
      ) {
        currentPos += (currentNode?.textContent?.replace(/[\u2009-\u200f]/g, "") ?? "").length;
      }
      // Check for locked block
      else if (
        currentNode instanceof HTMLSpanElement &&
        currentNode.classList.contains("is-locked")
      ) {
        const nextSibling = currentNode.nextSibling;
        if (nextSibling instanceof Text) {
          return { node: nextSibling, offset: 0 };
        } else {
          const newTextNode = document.createTextNode("");
          el.insertBefore(newTextNode, nextSibling);
          return { node: newTextNode, offset: 0 };
        }
      } else if (currentNode instanceof Element) {
        return getTextNodeAtOffset(currentNode, offset - currentPos);
      } else if (currentNode instanceof Text) {
        return {
          node: currentNode,
          offset:
            offset -
            currentPos +
            // Add on 1 for each high space character
            (currentNode?.textContent?.substring(0, offset - currentPos)?.split(/[\u2009-\u200f]/)
              ?.length ?? 0) -
            1,
        };
      }
    }
  return null;
};
