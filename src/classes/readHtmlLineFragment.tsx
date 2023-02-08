import { EditorV3Line } from './interface';

export function readHtmlLineFragment(el: Element): EditorV3Line {
  const text = el.textContent ?? '';
  return { textBlocks: [{ text }] };
}
