import { EditorV3Content } from '../classes/EditorV3Content';

export const redraw = (el: HTMLDivElement, content: EditorV3Content) => {
  el.innerHTML = '';
  el.append(content.el);
  // Update height and styles after render
  [...el.querySelectorAll('.aiev3-line')].forEach((line) => {
    (line as HTMLDivElement).style.height = `${Math.max(
      ...[...line.querySelectorAll('span')].map((el) => (el as HTMLSpanElement).clientHeight),
    )}px`;
    // Apply styles
    [...line.querySelectorAll('span[data-style-name')].forEach((el) => {
      const span = el as HTMLSpanElement;
      if (
        span.dataset.styleName &&
        content.styles &&
        content.styles[span.dataset.styleName] !== undefined
      ) {
        Object.entries(content.styles[span.dataset.styleName]).forEach(([k, v]) => {
          span.style.setProperty(
            k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()),
            v,
          );
        });
      }
    });
  });
};
