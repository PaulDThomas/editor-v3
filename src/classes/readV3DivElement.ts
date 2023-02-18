import { EditorV3TextBlock } from './EditorV3TextBlock';
import { EditorV3Align } from './interface';

export const readV3DivElement = (
  arg: HTMLDivElement,
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
    textBlocks: [],
    decimalAlignPercent: 60,
    textAlignment: EditorV3Align.left,
  };
  // Decimal aligned
  if (arg.classList.contains('aiev3-line')) {
    if (arg.classList.contains('decimal')) {
      ret.textAlignment = EditorV3Align.decimal;
      ret.decimalAlignPercent =
        arg.children.length === 2 &&
        arg.children[0] instanceof HTMLSpanElement &&
        arg.children[0].style.minWidth
          ? parseFloat(arg.children[0].style.minWidth)
          : 60;
      ret.textBlocks =
        arg.firstChild instanceof HTMLSpanElement &&
        arg.lastChild instanceof HTMLSpanElement &&
        arg.childNodes.length === 2 &&
        arg.firstChild.classList.contains('lhs') &&
        arg.lastChild.classList.contains('rhs')
          ? [
              ...[...(arg.firstChild as HTMLSpanElement).childNodes].map(
                (el) =>
                  new EditorV3TextBlock(
                    el instanceof HTMLSpanElement || el instanceof Text ? el : '',
                  ),
              ),
              ...[...(arg.lastChild as HTMLSpanElement).childNodes].map(
                (el) =>
                  new EditorV3TextBlock(
                    el instanceof HTMLSpanElement || el instanceof Text ? el : '',
                  ),
              ),
            ]
          : [
              ...[...arg.childNodes].map(
                (el) =>
                  new EditorV3TextBlock(
                    el instanceof HTMLSpanElement || el instanceof Text ? el : '',
                  ),
              ),
            ];
    }
    // Standard alignment
    else if (['left', 'center', 'right'].includes(arg.classList[1])) {
      ret.textBlocks = [
        ...[...arg.childNodes].map(
          (el) =>
            new EditorV3TextBlock(el instanceof HTMLSpanElement || el instanceof Text ? el : ''),
        ),
      ];
      ret.textAlignment = arg.classList[1] as EditorV3Align;
    }
  }
  return ret;
};
