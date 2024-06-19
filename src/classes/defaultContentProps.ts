import { EditorV3Align, EditorV3ContentProps } from "./interface";
import { defaultMarkdownSettings } from "./defaultMarkdownSettings";

export const defaultContentProps: EditorV3ContentProps = {
  allowMarkdown: false,
  allowNewLine: false,
  allowWindowView: false,
  decimalAlignPercent: 60,
  markdownSettings: defaultMarkdownSettings,
  showMarkdown: false,
  styles: undefined,
  textAlignment: EditorV3Align.left,
  atListFunction: undefined,
  maxAtListLength: 10,
};
