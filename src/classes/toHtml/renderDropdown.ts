import { EditorV3RenderProps } from "../interface";
import "./EditorV3Drop.css";
import { renderListEmpty } from "./renderListEmpty";
import { renderListError } from "./renderListError";
import { renderListItem } from "./renderListItem";
import { renderMoreItems } from "./renderMoreList";

// Add in dropdown
export const renderDropdown = (
  span: HTMLSpanElement,
  text: string,
  renderProps: EditorV3RenderProps,
) => {
  // Double check class list
  if (span.classList.contains("show-dropdown") && span.offsetParent) {
    // Create download
    const dropdownUl = document.createElement("ul");
    // Append to editor
    document.body.appendChild(dropdownUl);
    // Set up dropdown internals
    dropdownUl.classList.add("aiev3-dropdown-list", "skip-read");
    dropdownUl.contentEditable = "false";
    dropdownUl.innerHTML = "<li>Loading...</li>";
    // Add event listener
    dropdownUl.addEventListener("mousedown", (e: MouseEvent) => {
      // Set long timeout to enable stack to clear
      const dropItem =
        e.target instanceof Element && e.target.classList.contains("aiev3-drop-item")
          ? e.target
          : e.target instanceof Element && e.target.closest(".aiev3-drop-item")
            ? e.target.closest(".aiev3-drop-item")
            : undefined;
      if (dropItem && dropItem instanceof HTMLElement) {
        // Update span
        const thisText = dropItem.textContent;
        span.textContent = dropItem.dataset.text ?? thisText;
        delete span.dataset.styleName;
        span.classList.forEach((className) => {
          if (className.startsWith("editorv3style-")) {
            span.classList.remove(className);
          }
        });
        if (dropItem.dataset.style) {
          span.dataset.styleName = dropItem.dataset.style;
          span.classList.add(`editorv3style-${dropItem.dataset.style}`);
        }
        span.classList.remove("is-active");
        span.classList.add("is-locked");
        span.dataset.isLocked = "true";
        // Copy any other data from the atItem
        if (dropItem.dataset) {
          Object.keys(dropItem.dataset)
            .filter((key) => !["isLocked", "text", "style"].includes(key))
            .forEach((key) => {
              span.dataset[key] = dropItem.dataset[key];
            });
        }
        // Move dropdown to span before removing it
        span.appendChild(dropdownUl);
        // Remove dropdown
        dropdownUl.style.display = "none";
        window.setTimeout(() => {
          dropdownUl.remove();
          // Dispatch refresh event to refresh the editor
          const refreshEvent = new CustomEvent("editorv3refresh", {
            bubbles: true,
            detail: {
              target: span,
            },
          });
          span.dispatchEvent(refreshEvent);
        }, 1);
      }
    });

    // Add event listener to document
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const dropdownUl = document.querySelector(".aiev3-dropdown-list");
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
    dropdownUl.style.left = `${spanRect.left}px`;
    dropdownUl.style.top = `${spanRect.bottom}px`;

    // Add items to dropdown when promise resolves
    if (renderProps.atListFunction) {
      renderProps
        .atListFunction(text)
        .then((resolvedList) => {
          const maxAtListLength = renderProps.maxAtListLength ?? 10;
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
  }
};
