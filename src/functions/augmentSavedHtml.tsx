export function drawHtmlFromFragment(
  textAlignment: string,
  decimalAlignPercent: number,
  decimal: number | undefined,
  fixedBoundaries: {
    type: string;
    start: number;
    end?: number | undefined;
    span?: Node | HTMLSpanElement | undefined;
  }[],
): DocumentFragment {
  const fragment = new DocumentFragment();

  if (textAlignment === 'decimal') {
    const line = document.createElement('div');
    line.className = 'aiev3-decimal-line';
    fragment.append(line);

    // Set up space before decimal
    const prePoint = document.createElement('span');
    prePoint.className = 'aiev3-span aiev3-span-point';
    prePoint.style.textAlign = 'right';
    prePoint.style.right = `${100 - (decimalAlignPercent ?? 60)}%`;
    line.append(prePoint);

    // Set up space after (and including) decimal
    const postPoint = document.createElement('span');
    postPoint.className = 'aiev3-span aiev3-span-point';
    postPoint.style.textAlign = 'left';
    postPoint.style.left = `${decimalAlignPercent ?? 60}%`;
    line.append(postPoint);

    // Add spans with text if there is no decimal
    if (decimal === null || decimal === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      prePoint.append(...fixedBoundaries.filter((b) => b.span !== undefined).map((b) => b.span!));
    } else {
      const cut = fixedBoundaries.findIndex((b) => b.type === 'decimal');
      prePoint.append(
        ...fixedBoundaries
          .slice(0, cut)
          .filter((b) => b.span !== undefined)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map((b) => b.span!),
      );
      postPoint.append(
        ...fixedBoundaries
          .slice(cut)
          .filter((b) => b.span !== undefined)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map((b) => b.span!),
      );
    }
  } else {
    // Create single span with text
    const innerSpan = document.createElement('span');
    innerSpan.className = 'aiev3-span';
    innerSpan.style.textAlign = textAlignment ?? 'left';
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    innerSpan.append(...fixedBoundaries.filter((b) => b.span !== undefined).map((b) => b.span!));
    fragment.append(innerSpan);
  }
  return fragment;
}
