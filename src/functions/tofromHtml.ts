export const toHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/>/g, "&gt;")
    .replace(/≥/g, "&ge;")
    .replace(/≤/g, "&le;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/\n/g, "<br/>")
    .replace(/\u00a0/g, "&nbsp;");

export const fromHtml = (text: string): string =>
  text
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/<br\/>/g, "\n")
    .replace(/&apos;/g, "'")
    // eslint-disable-next-line quotes
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&le;/g, "≤")
    .replace(/&ge;/g, "≥")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
