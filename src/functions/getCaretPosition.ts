import { EditorV3PositionF } from "../classes/interface";

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
  const charIndex = targetRange.toString().replace(/[\u2009-\u200f]/g, "").length;
  return { lineIndex, charIndex };
};

/**
 * Get the current caret position in the editor
 * @param element Editor element to check against
 * @returns Position of the caret
 */
export function getCaretPosition(element: HTMLDivElement): EditorV3PositionF | null {
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
   * Get the anchor line and character of the caret
   */
  const anchor =
    (sel.anchorNode && getItemPosition(element, sel.anchorNode, sel.anchorOffset, preCaretRange)) ??
    null;

  /**
   * Get the end line and character of the caret
   */
  const focus =
    (sel.focusNode && getItemPosition(element, sel.focusNode, sel.focusOffset, preCaretRange)) ??
    null;

  /**
   * Return the position
   */
  return anchor && focus
    ? {
        initialLine: anchor.lineIndex,
        initialChar: anchor.charIndex,
        focusLine: focus.lineIndex,
        focusChar: focus.charIndex,
      }
    : null;
}
