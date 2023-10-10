import { EditorV3Content } from "../classes/EditorV3Content";
import { applyStylesToHTML } from "./applyStylesToHTML";

export const redraw = (el: HTMLDivElement, content: EditorV3Content) => {
  el.innerHTML = "";
  el.append(content.el);
  // Update height and styles after render
  [...el.querySelectorAll(".aiev3-line")].forEach((line) => {
    (line as HTMLDivElement).style.height = `${Math.max(
      ...[...line.querySelectorAll("span")].map((el) => (el as HTMLSpanElement).clientHeight),
    )}px`;
    // Apply styles
    applyStylesToHTML(line as HTMLDivElement, content.styles);
  });
};
