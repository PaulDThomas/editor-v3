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
      ret.textBlocks = [new EditorV3TextBlock(arg.textContent ?? '')];
      ret.textAlignment = EditorV3Align.decimal;
      ret.decimalAlignPercent =
        arg.children.length === 2
          ? parseFloat((arg.children[0] as HTMLSpanElement).style.minWidth) ?? 60
          : 60;
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
