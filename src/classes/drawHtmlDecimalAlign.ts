import { EditorV3TextBlock } from "./EditorV3TextBlock";

export const drawHtmlDecimalAlign = (
  line: HTMLDivElement,
  decimalAlignPercent: number,
  lhsContent: EditorV3TextBlock[],
  rhsContent: EditorV3TextBlock[],
) => {
  const prePoint = document.createElement("span");
  prePoint.className = "aiev3-span-point lhs";
  line.append(prePoint);
  if (lhsContent.length) lhsContent.forEach((tb) => prePoint.append(tb.toHtml()));
  else prePoint.textContent = "\u2009";

  // Set up space after (excluding) decimal
  const postPoint = document.createElement("span");
  postPoint.className = "aiev3-span-point rhs";
  line.append(postPoint);
  if (rhsContent.length) rhsContent.forEach((tb) => postPoint.append(tb.toHtml()));
  else postPoint.textContent = "\u2009";

  // Set grid column widths
  line.style.gridTemplateColumns = `${decimalAlignPercent}% ${100 - decimalAlignPercent}%`;
};
