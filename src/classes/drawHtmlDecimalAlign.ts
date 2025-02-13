import { EditorV3BlockClass, EditorV3ContentProps, EditorV3RenderProps } from "./interface";

export const drawHtmlDecimalAlign = (
  renderProps: EditorV3RenderProps,
  contentProps: EditorV3ContentProps,
  lhsContent: EditorV3BlockClass[],
  rhsContent: EditorV3BlockClass[],
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
            tb.style ? contentProps.styles?.[tb.style] : undefined,
          ),
        ),
      );
    else prePoint.textContent = "\u200b";

    // Set up space after (excluding) decimal
    const postPoint = document.createElement("span");
    postPoint.className = "aiev3-span-point rhs";
    renderProps.currentEl.append(postPoint);
    if (rhsContent.length)
      rhsContent.forEach((tb) => {
        postPoint.append(
          tb.toHtml(
            { ...renderProps, currentEl: postPoint },
            tb.style ? contentProps.styles?.[tb.style] : undefined,
          ),
        );
      });
    else postPoint.textContent = "\u200b";

    // Set grid column widths
    renderProps.currentEl.style.gridTemplateColumns = `${contentProps.decimalAlignPercent}% ${100 - contentProps.decimalAlignPercent}%`;
  }
};
