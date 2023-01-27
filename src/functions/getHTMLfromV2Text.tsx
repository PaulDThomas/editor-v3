export function getHTMLfromV2Text(
  divRef: React.MutableRefObject<HTMLDivElement | null>,
  styleName: string,
  style: React.CSSProperties,
): string {
  const isr = JSON.stringify([
    {
      length: divRef.current?.innerText.length ?? 0,
      offset: 0,
      style: styleName,
    },
  ]);

  const cssString = Object.entries(style)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, '-$&').toLowerCase()}:${v}`)
    .join(';');

  let html = `<div classname="aie-text" data-inline-style-ranges='${isr}'>`;

  // html += `<span${styleName !== '' ? `classname="${styleName}" style="${cssString}"` : ''}>${toHtml(
  //   text.replace(/[\u200B-\u200F\uFEFF]/g, ''),
  // )}</span>`;

  html += divRef.current?.innerHTML.replace(/[\u200B-\u200F\uFEFF]/g, '');

  html += '</div>';

  return html;
}
