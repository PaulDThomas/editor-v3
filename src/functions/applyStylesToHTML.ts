import { EditorV3Styles } from '../classes';

export const applyStylesToHTML = (line: HTMLDivElement, styles: EditorV3Styles) => {
  [...line.querySelectorAll('span[data-style-name')].forEach((el) => {
    const span = el as HTMLSpanElement;
    if (span.dataset.styleName && styles && styles[span.dataset.styleName] !== undefined) {
      Object.entries(styles[span.dataset.styleName]).forEach(([k, v]) => {
        span.style.setProperty(
          k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()),
          v,
        );
      });
    }
  });
  return line;
};
