import { EditorV3TextBlock } from "./EditorV3TextBlock";

export const drawHtmlDecimalAlign = (
  line: HTMLDivElement,
  decimalAlignPercent: number,
  lhsContent: EditorV3TextBlock[],
  rhsContent: EditorV3TextBlock[],
) => {
  const prePoint = document.createElement("span");
  prePoint.className = "aiev3-span-point lhs";
  prePoint.style.right = `${100 - decimalAlignPercent}%`;
  prePoint.style.minWidth = `${decimalAlignPercent}%`;
  line.append(prePoint);
  if (lhsContent.length) lhsContent.forEach((tb) => prePoint.append(tb.toHtml()));
  else prePoint.textContent = "\u2009";

  // Set up space after (excluding) decimal
  const postPoint = document.createElement("span");
  postPoint.className = "aiev3-span-point rhs";
  postPoint.style.left = `${decimalAlignPercent}%`;
  postPoint.style.minWidth = `${100 - decimalAlignPercent}%`;
  line.append(postPoint);
  if (rhsContent.length) rhsContent.forEach((tb) => postPoint.append(tb.toHtml()));
  else postPoint.textContent = "\u2009";
};
