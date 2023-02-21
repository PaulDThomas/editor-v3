import { getCaretPosition } from './getCaretPosition';
import { setCaretPosition } from './setCaretPosition';

function lineLength(l: NodeListOf<HTMLDivElement>, line: number): number {
  return line < l.length ? (l[line].textContent?.replace(/\u200b/, '') ?? '').length : 0;
}

export const moveCursor = (divRef: HTMLDivElement, e: React.KeyboardEvent<HTMLDivElement>) => {
  const pos = getCaretPosition(divRef);
  // Left arrow
  if (pos?.isCollapsed) {
    e.preventDefault();
    e.stopPropagation();
    const newPos = { ...pos };
    const lines = divRef.querySelectorAll('div.aiev3-line') as NodeListOf<HTMLDivElement>;
    const thisLineLength = lineLength(lines, pos.startLine);
    switch (e.key) {
      case 'Home':
        newPos.startChar = 0;
        break;
      case 'End':
        newPos.startChar = thisLineLength;
        break;
      case 'ArrowLeft':
        newPos.startLine =
          pos.startChar === 0 && pos.startLine > 0 ? pos.startLine - 1 : pos.startLine;
        newPos.startChar =
          pos.startChar === 0 && pos.startLine > 0
            ? lineLength(lines, pos.startLine - 1)
            : Math.max(0, pos.startChar - 1);
        break;
      case 'ArrowRight':
        newPos.startLine =
          pos.startLine + 1 < lines.length && thisLineLength <= pos.startChar
            ? pos.startLine + 1
            : pos.startLine;
        newPos.startChar = thisLineLength <= pos.startChar ? 0 : pos.startChar + 1;
        break;
      case 'ArrowDown':
        newPos.startLine = Math.min(lines.length - 1, pos.startLine + 1);
        newPos.startChar =
          pos.startLine + 1 < lines.length
            ? Math.min(pos.startChar, lineLength(lines, pos.startLine + 1))
            : thisLineLength;
        break;
      case 'ArrowUp':
        newPos.startLine = Math.max(0, pos.startLine - 1);
        newPos.startChar =
          pos.startLine > 0 ? Math.min(pos.startChar, lineLength(lines, pos.startLine - 1)) : 0;
        break;
      default:
    }
    newPos.endChar = newPos.startChar;
    newPos.endLine = newPos.startLine;
    setCaretPosition(divRef, newPos);
  }
};
