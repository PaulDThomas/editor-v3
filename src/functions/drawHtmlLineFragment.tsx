import { EditorV3Align } from './interface';

export function drawHtmlLineFragment(
  textAlignment: EditorV3Align,
  decimalAlignPercent: number,
  fullText: string,
): DocumentFragment {
  const fragment = new DocumentFragment();
  if (fullText === '') {
    fullText = '\u200B';
  }

  if (textAlignment === EditorV3Align.decimal) {
    const line = document.createElement('div');
    line.className = 'aiev3-decimal-line';
    fragment.append(line);

    // Set up space before decimal
    const prePoint = document.createElement('span');
    prePoint.className = 'aiev3-span aiev3-span-point';
    prePoint.style.textAlign = 'right';
    prePoint.style.right = `${100 - (decimalAlignPercent ?? 60)}%`;
    prePoint.style.minWidth = `${decimalAlignPercent ?? 60}%`;
    line.append(prePoint);

    // Set up space after (excluding) decimal
    const postPoint = document.createElement('span');
    postPoint.className = 'aiev3-span aiev3-span-point';
    postPoint.style.textAlign = 'left';
    postPoint.style.left = `${decimalAlignPercent ?? 60}%`;
    postPoint.style.minWidth = `${100 - (decimalAlignPercent ?? 60)}%`;
    line.append(postPoint);

    // Add spans with text if there is no decimal
    const decimalPosition = fullText.match(/\./)?.index;
    if (decimalPosition !== undefined) {
      prePoint.textContent = fullText.slice(0, decimalPosition + 1);
      postPoint.textContent = fullText.slice(decimalPosition + 1);
    } else {
      prePoint.textContent = fullText;
    }
  } else {
    // Create single span with text
    const innerSpan = document.createElement('span');
    innerSpan.className = 'aiev3-span';
    innerSpan.style.textAlign = textAlignment.toString() ?? 'left';
    innerSpan.textContent = fullText;
    fragment.append(innerSpan);
  }
  return fragment;
}
