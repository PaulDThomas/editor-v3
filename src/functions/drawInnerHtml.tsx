import { drawHtmlLineFragment } from './drawHtmlLineFragment';
import { EditorV3Align } from './interface';
import { setCaretPosition } from './setCaretPosition';

export function drawInnerHtml(
  divRef: React.MutableRefObject<HTMLDivElement | null>,
  getCaretPosition: (element: HTMLDivElement) => { start: number; end: number },
  textAlignment: EditorV3Align,
  decimalAlignPercent: number,
  initialText?: string,
  e?: React.KeyboardEvent<HTMLDivElement>,
  range?: Range,
): string {
  if (divRef.current) {
    // Decode any HTML here too... we are going to set textContent so this is safe
    let fullText = (initialText !== undefined ? initialText : divRef.current.textContent ?? '')
      .replace(/[\u202F|\u00A0]/g, ' ')
      .trim();
    // Get cursor position
    const caretPosn = getCaretPosition(divRef.current);
    let decimal = fullText.match(/\./)?.index;
    // Modification because of the key pressed
    if (e !== undefined) {
      if (e.key === 'Home') caretPosn.end = 0;
      else if (e.key === 'End') caretPosn.end = fullText.length;
      else if (e.key === 'Delete' && caretPosn.end === decimal) {
        decimal = undefined;
        fullText = fullText.replace(/\./, '');
      } else if (e.key === 'Enter') {
        // Add the line split here
        fullText = fullText.slice(0, caretPosn.end) + '\n' + fullText.slice(caretPosn.end);
      } else {
        // console.log(`${e.key} pressed at position ${JSON.stringify(caretPosn)}`);
      }
    }

    // Get document fragment from text
    const fragment = drawHtmlLineFragment(textAlignment, decimalAlignPercent, fullText);
    divRef.current.innerHTML = '';
    divRef.current.appendChild(fragment);

    // Update height after being added to divRef for decimal lines
    (
      Array.from(divRef.current.getElementsByClassName('aiev3-decimal-line')) as HTMLDivElement[]
    ).forEach((el) => {
      el.style.height = `${Math.max(
        ...(Array.from(el.getElementsByClassName('aiev3-span')) as HTMLSpanElement[]).map(
          (el) => el.clientHeight,
        ),
      )}px`;
    });

    // Update cursor position and live happily ever after
    if (range !== undefined && divRef.current) {
      setCaretPosition(divRef.current, caretPosn.end);
    }
  }
  if (e !== undefined) {
    e.stopPropagation();
    e.preventDefault();
  }
  return divRef.current?.innerHTML ?? '';
}
