import { EditorV3AtBlock } from "../classes/EditorV3AtBlock";
import { EditorV3TextBlock } from "../classes/EditorV3TextBlock";
import { EditorV3Align, EditorV3ContentProps } from "../classes/interface";
import { MarkdownLineClass } from "../classes/markdown/MarkdownLineClass";
import { textBlockFactory } from "../classes/textBlockFactory";
import { fromHtml } from "./tofromHtml";

export const readV3MarkdownElement = (
  el: HTMLDivElement,
  contentProps: EditorV3ContentProps,
): {
  textBlocks: (EditorV3TextBlock | EditorV3AtBlock)[];
  decimalAlignPercent: number;
  textAlignment: EditorV3Align;
} => {
  const ret: {
    textBlocks: (EditorV3TextBlock | EditorV3AtBlock)[];
    decimalAlignPercent: number;
    textAlignment: EditorV3Align;
  } = {
    textBlocks: new MarkdownLineClass({
      line: fromHtml(el.innerText ?? el.textContent ?? ""),
      markdownSettings: contentProps.markdownSettings,
    }).toTextBlocks(),
    decimalAlignPercent: contentProps.decimalAlignPercent,
    textAlignment: contentProps.textAlignment,
  };
  // Ensure there is at least something
  if (ret.textBlocks.length === 0) ret.textBlocks = [textBlockFactory("")];
  return ret;
};
