import { EditorV3Align, EditorV3ContentProps } from "./interface";
import { defaultMarkdownSettings } from "./markdown/MarkdownSettings";

export const defaultContentProps: EditorV3ContentProps = {
  allowMarkdown: false,
  allowNewLine: false,
  decimalAlignPercent: 60,
  markdownSettings: defaultMarkdownSettings,
  showMarkdown: false,
  styles: undefined,
  textAlignment: EditorV3Align.left,
  atListFunction: undefined,
  maxAtListLength: 10,
};
