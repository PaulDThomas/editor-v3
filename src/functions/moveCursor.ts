import { EditorV3Content } from "../classes";
import { EditorV3Position } from "../classes/interface";

export const moveCursor = (
  content: EditorV3Content,
  pos: EditorV3Position,
  e: React.KeyboardEvent<HTMLDivElement>,
): EditorV3Position => {
  e.preventDefault();
  e.stopPropagation();

  const lines = content.lines;
  const newPos = { ...pos };
  if (pos.endChar > -1) {
    const lastLineLength = lines[pos.endLine].lineLength;
    switch (e.key) {
      case "Home":
        if (e.ctrlKey) {
          newPos.startLine = 0;
          newPos.startChar = 0;
        } else if (newPos.startChar === 0) {
          newPos.startLine = 0;
        } else newPos.startChar = 0;
        if (!e.shiftKey) {
          newPos.endLine = newPos.startLine;
          newPos.endChar = newPos.startChar;
        }
        break;
      case "End":
        if (e.ctrlKey) {
          newPos.endLine = lines.length - 1;
          newPos.endChar = lines[lines.length - 1].lineLength;
        } else if (newPos.endChar === lastLineLength) {
          newPos.endLine = lines.length - 1;
          newPos.endChar = lines[lines.length - 1].lineLength;
        } else newPos.endChar = lastLineLength;
        if (!e.shiftKey) {
          newPos.startLine = newPos.endLine;
          newPos.startChar = newPos.endChar;
        }
        break;
      case "ArrowLeft":
        newPos.startLine =
          pos.startChar === 0 && pos.startLine > 0 ? pos.startLine - 1 : pos.startLine;
        newPos.startChar =
          pos.startChar === 0 && pos.startLine > 0
            ? lines[pos.startLine - 1].lineLength
            : Math.max(0, e.ctrlKey ? 0 : pos.startChar - 1);
        if (!e.shiftKey) {
          newPos.endLine = newPos.startLine;
          newPos.endChar = newPos.startChar;
        }
        break;
      case "ArrowRight":
        if (lastLineLength >= newPos.endChar) {
          newPos.endChar =
            e.ctrlKey && lastLineLength > newPos.endChar ? lastLineLength : pos.endChar + 1;
        }
        if (lastLineLength < newPos.endChar && pos.endLine + 1 < lines.length) {
          newPos.endLine = newPos.endLine + 1;
          newPos.endChar = 0;
        }
        if (!e.shiftKey) {
          newPos.startLine = newPos.endLine;
          newPos.startChar = newPos.endChar;
        }
        break;
      case "ArrowUp":
        newPos.startLine = Math.max(0, e.ctrlKey ? 0 : newPos.startLine - 1);
        newPos.startChar =
          pos.startLine > 0 ? Math.min(newPos.startChar, lines[newPos.startLine].lineLength) : 0;
        if (!e.shiftKey) {
          newPos.endLine = newPos.startLine;
          newPos.endChar = newPos.startChar;
        }
        break;
      case "ArrowDown":
        newPos.endLine = Math.min(
          lines.length - 1,
          e.ctrlKey ? lines.length - 1 : newPos.endLine + 1,
        );
        newPos.endChar =
          pos.endLine < lines.length - 1
            ? Math.min(newPos.endChar, lines[newPos.endLine].lineLength)
            : lastLineLength;
        if (!e.shiftKey) {
          newPos.startLine = newPos.endLine;
          newPos.startChar = newPos.endChar;
        }
        break;
      default:
    }
    newPos.isCollapsed = newPos.startLine === newPos.endLine && newPos.startChar === newPos.endChar;
  }
  return newPos;
};
