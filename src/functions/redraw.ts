import { EditorV3Content } from "../classes/EditorV3Content";
import { applyStylesToHTML } from "./applyStylesToHTML";

export const redraw = (el: HTMLDivElement, content: EditorV3Content, showMarkdown: boolean) => {
  el.innerHTML = "";
  if (showMarkdown) {
    el.append(content.toMarkdownElement());
  } else {
    el.append(content.toHtml());
  }
  // Update height and styles after render
  [...el.querySelectorAll(".aiev3-line")].forEach((line) => {
    (line as HTMLDivElement).style.height = `${Math.max(
      ...[...line.querySelectorAll("span")].map((el) => (el as HTMLSpanElement).clientHeight),
    )}px`;
    // Apply styles
    applyStylesToHTML(line as HTMLDivElement, content.styles);
  });
};
