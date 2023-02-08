import { EditorV3Import } from './interface';
import { readHtmlLineFragment } from './readHtmlLineFragment';

export const readV3Html = (text: string): EditorV3Import => {
  const ret: EditorV3Import = {
    lines: [],
  };

  // Do nothing if there is nothing to do
  if (!text.startsWith('<div class="aiev3-line')) {
    ret.lines = [
      {
        textBlocks: text
          .replace(/[\u200B-\u200F\uFEFF\r]/g, '') // Undesirable non-printing chars
          .replace(/[\u202F|\u00A0]/g, ' ') // Spaces are spaces
          .replace(/\u200B/g, '') // Zero width space
          .split('\n')
          .map((l) => {
            return {
              text: l,
            };
          }),
      },
    ];
  }
  // Create fragment to work with HTML
  else {
    const frag = document.createElement('div');
    frag.innerHTML = text;

    // Loop through children in fragment
    [...frag.children].forEach((el) => {
      ret.lines.push(readHtmlLineFragment(el));
    });

    // // Create element so you can read the things
    // // Any style info will have been in the first child dataset
    // if ((frag.children[0] as HTMLDivElement).dataset.inlineStyleRanges) {
    //   // Get the inline style range, but only interested in the style name
    //   const isr = JSON.parse((frag.children[0] as HTMLDivElement).dataset.inlineStyleRanges ?? '[]');
    //   // Add the style name
    // }
  }
  return ret;
};
