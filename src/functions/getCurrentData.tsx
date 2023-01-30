export function getCurrentData(
  divRef: React.MutableRefObject<HTMLDivElement | null>,
  // styleName: string,
  // style: React.CSSProperties,
): { html: string; text: string; json: string } {
  // const isr = JSON.stringify([
  //   {
  //     length: divRef.current?.innerText.length ?? 0,
  //     offset: 0,
  //     style: styleName,
  //   },
  // ]);

  // const cssString = Object.entries(style)
  //   .map(([k, v]) => `${k.replace(/[A-Z]/g, '-$&').toLowerCase()}:${v}`)
  //   .join(';');

  // html += `<span${styleName !== '' ? `classname="${styleName}" style="${cssString}"` : ''}>${toHtml(
  //   text.replace(/[\u200B-\u200F\uFEFF]/g, ''),
  // )}</span>`;

  let html = '<div classname="aiev3">';
  html += divRef.current?.innerHTML; // .replace(/[\u200B-\u200F\uFEFF]/g, '');
  html += '</div>';

  let text = '';
  let currentLine = '';
  const jsonObj: string[] = [];
  divRef.current?.childNodes.forEach((el, i, p) => {
    // Add to current line
    currentLine += el.textContent;
    // End current line if not last div
    if (el instanceof HTMLDivElement && i + 1 !== p.length) {
      currentLine + '\n';
      text += currentLine;
      jsonObj.push(currentLine);
    }
    // Output if end
    else if (i + 1 === p.length) {
      text += currentLine;
      jsonObj.push(currentLine);
    }
  });

  return { html, text, json: JSON.stringify(jsonObj) };
}
