import { getCaretPosition } from './getCaretPosition';
import { setCaretPosition } from './setCaretPosition';

export const moveCursor = (divRef: HTMLDivElement, e: React.KeyboardEvent<HTMLDivElement>) => {
  const pos = getCaretPosition(divRef);
  // Left arrow
  if (pos?.isCollapsed) {
    e.preventDefault();
    e.stopPropagation();
    const newPos = { ...pos };
    const thisLine =
      pos.startLine < divRef.querySelectorAll('div.aiev3-line').length
        ? (divRef.querySelectorAll('div.aiev3-line')[pos.startLine] as HTMLDivElement)
        : null;
    switch (e.key) {
      case 'Home':
        newPos.startChar = 0;
        break;
      case 'End':
        newPos.startChar = (thisLine?.textContent ?? '').length;
        break;
      case 'ArrowLeft':
        newPos.startLine =
          pos.startChar === 0 && pos.startLine > 0 ? pos.startLine - 1 : pos.startLine;
        newPos.startChar =
          pos.startChar === 0 && pos.startLine > 0
            ? (
                (divRef.querySelectorAll('div.aiev3-line')[pos.startLine - 1] as HTMLDivElement)
                  .textContent ?? ''
              ).length
            : Math.max(0, pos.startChar - 1);
        break;
      case 'ArrowRight':
        if (pos.startChar + 1 < (thisLine?.textContent ?? '').length) {
          newPos.startChar = pos.startChar + 1;
        } else if (
          thisLine &&
          pos.startChar === (thisLine?.textContent ?? '').length &&
          pos.startLine + 1 < divRef.querySelectorAll('div.aiev3-line').length
        ) {
          newPos.startLine = pos.startLine + 1;
          newPos.startChar = 0;
        }
        newPos.startLine =
          divRef.querySelectorAll('div.aiev3-line').length > pos.startLine + 1 &&
          (
            (divRef.querySelectorAll('div.aiev3-line')[pos.startLine] as HTMLDivElement)
              .textContent ?? ''
          ).length <= pos.startChar
            ? pos.startLine + 1
            : pos.startLine;
        newPos.startChar =
          divRef.querySelectorAll('div.aiev3-line').length > pos.startLine + 1 &&
          (
            (divRef.querySelectorAll('div.aiev3-line')[pos.startLine] as HTMLDivElement)
              .textContent ?? ''
          ).length <= pos.startChar
            ? 0
            : pos.startChar + 1;
        break;
      case 'ArrowDown':
        if (divRef.querySelectorAll('div.aiev3-line').length > pos.startLine + 1) {
          const nextLine = divRef.querySelectorAll('div.aiev3-line')[
            pos.startLine + 1
          ] as HTMLDivElement;
          newPos.startLine = pos.startLine + 1;
          newPos.startChar = Math.min((nextLine.textContent ?? '').length, pos.startChar);
        } else {
          newPos.startChar = (thisLine?.textContent ?? '').length;
        }
        break;
      case 'ArrowUp':
        if (pos.startLine > 0) {
          const nextLine = divRef.querySelectorAll('div.aiev3-line')[
            pos.startLine - 1
          ] as HTMLDivElement;
          newPos.startLine = pos.startLine - 1;
          newPos.startChar = Math.min((nextLine.textContent ?? '').length, pos.startChar);
        } else {
          newPos.startChar = 0;
        }
        break;
      default:
    }
    newPos.endChar = newPos.startChar;
    newPos.endLine = newPos.startLine;
    // console.log(`New pos: ${JSON.stringify(newPos)}`);
    setCaretPosition(divRef, newPos);
  }
};
