import { EditorV3Position } from "../classes/interface";

const getItemPosition = (
  containerEl: HTMLDivElement,
  targetNode: Node,
  offset: number,
  targetRange: Range,
) => {
  // Retrieve the target element (move up in the DOM is the elment is a Text node)
  //  then find the line div
  const line = (
    targetNode instanceof Element ? targetNode : (targetNode.parentElement as Element)
  ).closest("div.aiev3-line, div.aiev3-markdown-line");
  // Get the line number by checking the siblings
  const lineIndex =
    line && containerEl.contains(line) && line.parentElement
      ? [...line.parentElement.querySelectorAll("div.aiev3-line, div.aiev3-markdown-line")].indexOf(
          line,
        )
      : null;
  // Stop if not found
  if (lineIndex === null || !line) return null;
  // Get the character number by checking the text content
  targetRange.selectNodeContents(line);
  targetRange.setEnd(targetNode, offset);
  const charIndex = targetRange.toString().replace(/[\u2009-\u200F]/, "").length;
  return { lineIndex, charIndex };
};

/**
 * Get the current caret position in the editor
 * @param element Editor element to check against
 * @returns Position of the caret
 */
export function getCaretPosition(element: HTMLDivElement): EditorV3Position | null {
  // Check a selection is present
  let range: Range;
  let preCaretRange: Range;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    range = sel.getRangeAt(0);
    preCaretRange = range.cloneRange();
  } else {
    return null;
  }

  /**
   * Get the start line and character of the caret
   */
  const start = getItemPosition(element, range.startContainer, range.startOffset, preCaretRange);
  if (!start) return null;
  const { lineIndex: startLine, charIndex: startChar } = start;

  /**
   * Get the end line and character of the caret
   */
  const end = getItemPosition(element, range.endContainer, range.endOffset, preCaretRange);
  if (!end) return null;
  const { lineIndex: endLine, charIndex: endChar } = end;

  /**
   * Return the position
   */
  return {
    startLine,
    startChar,
    endLine,
    endChar,
    isCollapsed: startLine === endLine && startChar === endChar,
  };
}
