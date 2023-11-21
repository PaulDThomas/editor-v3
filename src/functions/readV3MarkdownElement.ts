import { fromHtml } from "./tofromHtml";
import { EditorV3TextBlock } from "../classes/EditorV3TextBlock";
import { EditorV3Align } from "../classes/interface";
import { MarkdownLineClass } from "../classes/markdown/MarkdownLineClass";
import { IMarkdownSettings } from "../classes/markdown/MarkdownSettings";

export const readV3MarkdownElement = (
  arg: HTMLDivElement,
  markdownSettings: IMarkdownSettings,
): {
  textBlocks: EditorV3TextBlock[];
  decimalAlignPercent: number;
  textAlignment: EditorV3Align;
} => {
  const ret: {
    textBlocks: EditorV3TextBlock[];
    decimalAlignPercent: number;
    textAlignment: EditorV3Align;
  } = {
    textBlocks: new MarkdownLineClass({
      line: fromHtml(arg.innerText ?? arg.textContent ?? ""),
      markdownSettings,
    }).toTextBlocks(),
    decimalAlignPercent: parseFloat(arg.dataset.decimalAlignPercent ?? "60"),
    textAlignment: (arg.dataset.textAlignment as EditorV3Align) ?? EditorV3Align.left,
  };
  // Ensure there is at least something
  if (ret.textBlocks.length === 0) ret.textBlocks = [new EditorV3TextBlock("")];
  return ret;
};
