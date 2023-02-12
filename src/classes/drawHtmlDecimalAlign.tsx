export const drawHtmlDecimalAlign = (
  line: HTMLDivElement,
  fullText: string,
  decimalAlignPercent: number,
) => {
  const prePoint = document.createElement('span');
  prePoint.className = 'aiev3-span aiev3-span-point lhs';
  prePoint.style.right = `${100 - decimalAlignPercent}%`;
  prePoint.style.minWidth = `${decimalAlignPercent}%`;
  line.append(prePoint);

  // Set up space after (excluding) decimal
  const postPoint = document.createElement('span');
  postPoint.className = 'aiev3-span aiev3-span-point rhs';
  postPoint.style.left = `${decimalAlignPercent}%`;
  postPoint.style.minWidth = `${100 - decimalAlignPercent}%`;
  line.append(postPoint);

  // Add spans with text if there is no decimal
  const decimalPosition = fullText.match(/\./)?.index;
  if (decimalPosition !== undefined) {
    prePoint.textContent = fullText.slice(0, decimalPosition + 1).replace(/ /g, '\u00A0');
    postPoint.textContent = fullText.slice(decimalPosition + 1).replace(/ /g, '\u00A0');
  } else {
    prePoint.textContent = fullText !== '' ? fullText.replace(/ /g, '\u00A0') : '\u200b';
    postPoint.textContent = '\u200b';
  }
};
