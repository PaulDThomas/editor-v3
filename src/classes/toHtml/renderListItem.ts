import { EditorV3AtListItem } from "../interface";

export const renderListItem = (
  dropdownUl: HTMLUListElement,
  atItem: EditorV3AtListItem<Record<string, string>>,
) => {
  const atSpan = atItem.listRender ?? document.createElement("li");
  if (!atSpan.classList.contains("aiev3-at-item")) atSpan.classList.add("aiev3-at-item");
  if (!atSpan.dataset.text) atSpan.dataset.text = atItem.text;
  if (atSpan.textContent === "" || !atSpan.textContent) atSpan.textContent = atItem.text;
  atSpan.dataset.text = atItem.text;
  // Add in data from atItem
  atItem.data &&
    Object.keys(atItem.data).forEach((key) => {
      if (atItem.data) atSpan.dataset[key] = atItem.data[key];
    });
  dropdownUl.appendChild(atSpan);
};
