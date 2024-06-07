import { EditorV3DropListItem } from "../interface";

export const renderListItem = (
  dropdownUl: HTMLUListElement,
  dropItem: EditorV3DropListItem<Record<string, string>>,
) => {
  const dropSpan = dropItem.listRender ?? document.createElement("li");
  if (!dropSpan.classList.contains("aiev3-drop-item")) dropSpan.classList.add("aiev3-drop-item");
  if (!dropSpan.dataset.text) dropSpan.dataset.text = dropItem.text;
  if (dropSpan.textContent === "" || !dropSpan.textContent) dropSpan.textContent = dropItem.text;
  dropSpan.dataset.text = dropItem.text;
  // Add in data from atItem
  dropItem.data &&
    Object.keys(dropItem.data).forEach((key) => {
      if (dropItem.data) dropSpan.dataset[key] = dropItem.data[key];
    });
  dropdownUl.appendChild(dropSpan);
};
