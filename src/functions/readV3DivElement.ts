import { EditorV3AtBlock } from "../classes/EditorV3AtBlock";
import { EditorV3SelectBlock } from "../classes/EditorV3SelectBlock";
import { EditorV3TextBlock } from "../classes/EditorV3TextBlock";
import { EditorV3Align, EditorV3BlockClass } from "../classes/interface";
import { textBlockFactory } from "../classes/textBlockFactory";

export const readV3DivElement = (
  arg: HTMLDivElement,
): {
  textBlocks: EditorV3BlockClass[];
  decimalAlignPercent: number;
  textAlignment: EditorV3Align;
} => {
  const ret: {
    textBlocks: (EditorV3TextBlock | EditorV3AtBlock | EditorV3SelectBlock)[];
    decimalAlignPercent: number;
    textAlignment: EditorV3Align;
  } = {
    textBlocks: [],
    decimalAlignPercent: 60,
    textAlignment: EditorV3Align.left,
  };
  // Remove skip-read elements
  const skipRead = arg.querySelectorAll(".skip-read");
  skipRead.forEach((el) => el.remove());
  // Decimal aligned
  if (arg.classList.contains("aiev3-line")) {
    if (arg.classList.contains("decimal")) {
      ret.textAlignment = EditorV3Align.decimal;
      ret.decimalAlignPercent =
        arg.children.length === 2 && arg.style.gridTemplateColumns
          ? parseFloat(arg.style.gridTemplateColumns.split("%")[0])
          : 60;
      // This will skip the inner offcanvas span
      ret.textBlocks =
        arg.firstChild instanceof HTMLSpanElement &&
        arg.lastChild instanceof HTMLSpanElement &&
        arg.firstChild.classList.contains("lhs") &&
        arg.lastChild.classList.contains("rhs")
          ? [
              ...[...(arg.firstChild as HTMLSpanElement).childNodes].map((el) =>
                textBlockFactory(
                  el instanceof HTMLSpanElement || el instanceof Text ? el : { text: "" },
                ),
              ),
              ...[...(arg.lastChild as HTMLSpanElement).childNodes].map((el) =>
                textBlockFactory(
                  el instanceof HTMLSpanElement || el instanceof Text ? el : { text: "" },
                ),
              ),
            ].filter((tb) => tb.text !== "" && tb.text !== "\u200b")
          : [
              ...[...arg.childNodes].map((el) =>
                textBlockFactory(
                  el instanceof HTMLSpanElement || el instanceof Text ? el : { text: "" },
                ),
              ),
            ].filter((tb) => tb.text !== "" && tb.text !== "\u200b");
    }
    // Standard alignment
    else {
      ret.textBlocks = [
        ...[...arg.childNodes].map((el) =>
          textBlockFactory(el instanceof HTMLSpanElement || el instanceof Text ? el : { text: "" }),
        ),
      ].filter((tb) => tb.text !== "" && tb.text !== "\u200b");
      ret.textAlignment = ["left", "center", "right"].includes(arg.classList[1])
        ? (arg.classList[1] as EditorV3Align)
        : EditorV3Align.left;
    }
  }
  // Ensure there is at least something
  if (ret.textBlocks.length === 0) ret.textBlocks = [new EditorV3TextBlock()];
  return ret;
};
