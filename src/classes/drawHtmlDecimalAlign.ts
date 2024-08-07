import { EditorV3BlockClass, EditorV3RenderProps, EditorV3Styles } from "./interface";

export const drawHtmlDecimalAlign = (
  renderProps: EditorV3RenderProps,
  decimalAlignPercent: number,
  lhsContent: EditorV3BlockClass[],
  rhsContent: EditorV3BlockClass[],
  styles?: EditorV3Styles,
) => {
  if (renderProps.currentEl) {
    const prePoint = document.createElement("span");
    prePoint.className = "aiev3-span-point lhs";
    renderProps.currentEl.append(prePoint);
    if (lhsContent.length)
      lhsContent.forEach((tb) =>
        prePoint.append(
          tb.toHtml(
            { ...renderProps, currentEl: prePoint },
            tb.style ? styles?.[tb.style] : undefined,
          ),
        ),
      );
    else prePoint.textContent = "\u2009";

    // Set up space after (excluding) decimal
    const postPoint = document.createElement("span");
    postPoint.className = "aiev3-span-point rhs";
    renderProps.currentEl.append(postPoint);
    if (rhsContent.length)
      rhsContent.forEach((tb) => {
        const tbStyle = tb.style ? styles?.[tb.style] : undefined;
        postPoint.append(tb.toHtml({ ...renderProps, currentEl: postPoint }, tbStyle));
      });
    else postPoint.textContent = "\u2009";

    // Set grid column widths
    renderProps.currentEl.style.gridTemplateColumns = `${decimalAlignPercent}% ${100 - decimalAlignPercent}%`;
  }
};
