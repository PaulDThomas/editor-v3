import { EditorV3DropListItem } from "../interface";
import "./EditorV3Drop.css";
import { renderListEmpty } from "./renderListEmpty";
import { renderListError } from "./renderListError";
import { renderListItem } from "./renderListItem";
import { renderMoreItems } from "./renderMoreList";

// Add in dropdown
export const renderDropdown = (
  span: HTMLSpanElement,
  listFunction: (typedString: string) => Promise<EditorV3DropListItem<Record<string, string>>[]>,
  maxAtListLength: number,
  text: string,
) => {
  // Double check class list
  if (span.classList.contains("show-dropdown") && span.offsetParent) {
    // Create download
    const dropdownUl = document.createElement("ul");
    // Append to editor
    span.offsetParent.appendChild(dropdownUl);
    dropdownUl.style.zIndex = "1000";
    // Set up dropdown internals
    dropdownUl.classList.add("aiev3-dropdown-list", "skip-read");
    dropdownUl.contentEditable = "false";
    dropdownUl.innerHTML = "<li>Loading...</li>";
    // Add event listener
    dropdownUl.addEventListener("mousedown", (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Set long timeout to enable stack to clear
      const dropItem = e.target;
      if (
        dropItem &&
        dropItem instanceof HTMLElement &&
        dropItem.classList.contains("aiev3-drop-item")
      ) {
        // Update span
        const thisText = dropItem.textContent;
        span.textContent = dropItem.dataset.text ?? thisText;
        if (dropItem.dataset.style) {
          span.dataset.styleName = dropItem.dataset.style;
          span.classList.add(`editorv3style-${dropItem.dataset.style}`);
        }
        if (dropItem.dataset.noStyle) {
          delete span.dataset.styleName;
          Array.from(span.classList).forEach((className) => {
            if (className.startsWith("editorv3style-")) {
              span.classList.remove(className);
            }
          });
        }
        span.classList.remove("is-active");
        span.classList.add("is-locked");
        span.dataset.isLocked = "true";
        // Copy any other data from the atItem
        if (dropItem.dataset) {
          Object.keys(dropItem.dataset)
            .filter((key) => !["isLocked", "text"].includes(key))
            .forEach((key) => {
              span.dataset[key] = dropItem.dataset[key];
            });
        }
        // Remove dropdown
        dropdownUl.remove();
        // Move cursor to end of span
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStartAfter(span);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });

    // Add event listener to document
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const dropdownUl =
        span.offsetParent?.querySelector(".aiev3-dropdown-list") ??
        span.querySelector(".aiev3-dropdown-list");
      if (dropdownUl && !dropdownUl.contains(target)) {
        dropdownUl.remove();
        span.classList.remove("is-active");
        span.classList.add("is-locked");
        span.dataset.isLocked = "true";
      }
      document.removeEventListener("mousedown", clickHandler);
    };
    document.addEventListener("mousedown", clickHandler);

    // Position dropdown
    const spanRect = span.getBoundingClientRect();
    const offSetRect = span.offsetParent?.getBoundingClientRect();
    if (offSetRect && spanRect) {
      dropdownUl.style.left = `${spanRect.left - offSetRect.left}px`;
      dropdownUl.style.top = `${spanRect.bottom - offSetRect.top}px`;
    }

    // Add items to dropdown when promise resolves
    listFunction(text)
      .then((resolvedList) => {
        dropdownUl.innerHTML = "";
        if (resolvedList.length === 0) {
          renderListEmpty(dropdownUl);
        } else {
          resolvedList
            .slice(0, maxAtListLength)
            .forEach((atItem) => renderListItem(dropdownUl, atItem));
          // Add in more items list item
          if (resolvedList.length > maxAtListLength) {
            renderMoreItems(dropdownUl, resolvedList.length - maxAtListLength);
          }
        }
      })
      .catch(() => {
        renderListError(dropdownUl);
      });
  }
};
