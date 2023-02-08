import { EditorV3Content } from '../classes/EditorV3Content';

export function updateInnerHtml(el: HTMLDivElement, content: EditorV3Content): void {
  // Clear exisiting inner
  el.innerHTML = '';
  //  Add in HTML from content
  const frag = content.innerHtml();
  el.appendChild(frag);
}
