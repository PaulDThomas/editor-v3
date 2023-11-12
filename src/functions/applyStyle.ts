import { EditorV3Content } from "../classes/EditorV3Content";
import { getCaretPosition } from "./getCaretPosition";
import { redraw } from "./redraw";
import { setCaretPosition } from "./setCaretPosition";

export const applyStyle = (style: string | null, div: HTMLDivElement, target?: Range | null) => {
  if (target) {
    const pos = getCaretPosition(div, target);
    if (pos) {
      const content = new EditorV3Content(div.innerHTML);
      redraw(div, style ? content.applyStyle(style, pos) : content.removeStyle(pos));
      setCaretPosition(div, {
        startLine: pos.startLine,
        startChar: pos.startChar,
        isCollapsed: true,
        endLine: pos.startLine,
        endChar: pos.startChar,
      });
    }
  }
};
