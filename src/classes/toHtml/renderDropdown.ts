import { EditorV3AtListItem } from "../interface";
import { renderListEmpty } from "./renderListEmpty";
import { renderListError } from "./renderListError";
import { renderListItem } from "./renderListItem";
import { renderMoreItems } from "./renderMoreList";

// Add in dropdown
export const renderDropdown = (
  span: HTMLSpanElement,
  listFunction: (typedString: string) => Promise<EditorV3AtListItem<Record<string, string>>[]>,
  maxAtListLength: number,
  text: string,
) => {
  // Double check class list
  if (!span.classList.contains("is-locked")) {
    // Create download
    const dropdownUl = document.createElement("ul");
    dropdownUl.style.zIndex = "1000";
    // Append to editor
    span.appendChild(dropdownUl);
    // Set up dropdown internals
    dropdownUl.classList.add("aiev3-at-dropdown-list", "skip-read");
    dropdownUl.contentEditable = "false";
    dropdownUl.innerHTML = "<li>Loading...</li>";
    // Add event listener
    dropdownUl.addEventListener("click", (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Set long timeout to enable stack to clear
      const atItem = e.target;
      if (atItem && atItem instanceof HTMLElement && atItem.classList.contains("aiev3-at-item")) {
        // Update span
        const thisText = atItem.textContent;
        span.textContent = atItem.dataset.text ?? thisText;
        span.classList.remove("is-active");
        span.classList.add("is-locked");
        span.dataset.isLocked = "true";
        // Copy any other data from the atItem
        if (atItem.dataset) {
          Object.keys(atItem.dataset)
            .filter((key) => !["isLocked", "text"].includes(key))
            .forEach((key) => {
              span.dataset[key] = atItem.dataset[key];
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
      const dropdownUl = span.querySelector(".aiev3-at-dropdown-list");
      if (dropdownUl && !dropdownUl.contains(target)) {
        dropdownUl.remove();
        span.classList.remove("is-active");
        span.classList.add("is-locked");
        span.dataset.isLocked = "true";
      }
      document.removeEventListener("click", clickHandler);
    };

    document.addEventListener("click", clickHandler);

    // Position dropdown
    const spanRect = span.getBoundingClientRect();
    const offSetRect = span.offsetParent?.getBoundingClientRect();
    if (offSetRect && spanRect) {
      dropdownUl.style.left = `${spanRect.left - offSetRect.left}px`;
      dropdownUl.style.top = `${spanRect.bottom - offSetRect.top}px`;
    }

    // Add items to dropdown when promise resolves
    listFunction(text)
      .then((resolvedAtList) => {
        dropdownUl.innerHTML = "";
        if (resolvedAtList.length === 0) {
          renderListEmpty(dropdownUl);
        } else {
          resolvedAtList
            .slice(0, maxAtListLength)
            .forEach((atItem) => renderListItem(dropdownUl, atItem));
          // Add in more items list item
          if (resolvedAtList.length > maxAtListLength) {
            renderMoreItems(dropdownUl, resolvedAtList.length - maxAtListLength);
          }
        }
      })
      .catch(() => {
        renderListError(dropdownUl);
      });
  }
};
