// import { drawHtmlDecimalAlign } from './drawHtmlDecimalAlign';
// import { EditorV3Align } from './interface';

// export function drawHtmlLineFragment(
//   textAlignment: EditorV3Align,
//   decimalAlignPercent: number,
//   fullText: string,
// ): DocumentFragment {
//   const fragment = new DocumentFragment();
//   if (fullText === '') {
//     fullText = '\u200B';
//   }

//   if (textAlignment === EditorV3Align.decimal) {
//     const line = document.createElement('div');
//     line.className = 'aiev3-decimal-line';
//     fragment.append(line);

//     // Set up space before decimal
//     drawHtmlDecimalAlign(line, fullText, decimalAlignPercent);
//   } else {
//     // Create single div with text
//     const innerDiv = document.createElement('div');
//     innerDiv.className = 'aiev3-line';
//     innerDiv.style.textAlign = textAlignment.toString() ?? 'left';
//     innerDiv.textContent = fullText;
//     fragment.append(innerDiv);
//   }
//   return fragment;
// }

export default {};
