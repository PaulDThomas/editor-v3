import { cloneDeep } from "lodash";
import { defaultContentProps } from "../classes/defaultContentProps";
import { EditorV3Align, EditorV3ContentProps } from "../classes/interface";

export const readContentPropsNode = (node: HTMLDivElement): EditorV3ContentProps | undefined => {
  let ret: EditorV3ContentProps | undefined;
  const cpn = node.querySelector("div.aiev3-contents-info");
  if (cpn && cpn instanceof HTMLDivElement) {
    const dataset = cpn.dataset;
    ret = cloneDeep(defaultContentProps);
    if (dataset.allowMarkdown) ret.allowMarkdown = JSON.parse(dataset.allowMarkdown);
    if (dataset.allowNewLine) ret.allowNewLine = JSON.parse(dataset.allowNewLine);
    if (dataset.allowWindowView) ret.allowWindowView = JSON.parse(dataset.allowWindowView);
    if (dataset.decimalAlignPercent)
      ret.decimalAlignPercent = JSON.parse(dataset.decimalAlignPercent);
    if (dataset.markdownSettings) ret.markdownSettings = JSON.parse(dataset.markdownSettings);
    if (dataset.showMarkdown) ret.showMarkdown = JSON.parse(dataset.showMarkdown);
    if (dataset.styles) ret.styles = JSON.parse(dataset.styles);
    if (dataset.textAlignment)
      ret.textAlignment = JSON.parse(dataset.textAlignment) as EditorV3Align;
  }
  return ret;
};
