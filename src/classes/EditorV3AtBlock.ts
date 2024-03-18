import "./EditorV3AtBlock.css";
import { EditorV3TextBlock, IEditorV3TextBlock } from "./EditorV3TextBlock";
import { EditorV3AtListItem, EditorV3RenderProps, EditorV3WordPosition } from "./interface";

export interface IEditorV3AtBlock extends IEditorV3TextBlock {
  atListFunction?: (typedString: string) => Promise<EditorV3AtListItem<unknown>[]>;
  maxAtListLength?: number;
}

export class EditorV3AtBlock extends EditorV3TextBlock implements IEditorV3AtBlock {
  /**
   * Promise function that will return list of string values to display
   * @param typedString Text entered into the block so far
   * @returns Promise of array of strings
   */
  public atListFunction: (typedString: string) => Promise<EditorV3AtListItem<unknown>[]> = () =>
    new Promise((resolve) => resolve([]));
  /**
   * Maximum number of items to display in the returned list
   */
  public maxAtListLength = 10;

  constructor(props: IEditorV3AtBlock) {
    super(props);
    this.type = "at";
    if (props.atListFunction) this.atListFunction = props.atListFunction;
    if (props.maxAtListLength) this.maxAtListLength = props.maxAtListLength;
  }

  get wordPositions(): EditorV3WordPosition[] {
    return [
      {
        line: -1,
        startChar: this.lineStartPosition,
        endChar: this.lineStartPosition + this.text.length,
        isLocked: this.isLocked === true,
      },
    ];
  }

  // Overload html return
  public toHtml(renderProps: EditorV3RenderProps): DocumentFragment {
    // Create holder
    const ret = new DocumentFragment();
    if (renderProps.currentEl) renderProps.currentEl.append(ret);
    const span = document.createElement("span");
    ret.appendChild(span);
    span.classList.add("aiev3-tb", "at-block");
    span.dataset.type = "at";

    // Add Text node
    const textNode = document.createTextNode(
      this.text.replaceAll("\uFEFF", "").replace(/^ /, "\u00A0").replace(/ $/, "\u00A0"),
    );

    span.appendChild(textNode);
    // Add style
    if (this.style) {
      span.classList.add(`editorv3style-${this.style}`);
      span.dataset.styleName = this.style;
    }

    // Delete any existing dropdown on render
    const editor = renderProps.editableEl?.closest(".aiev3") as HTMLDivElement | null;
    if (editor) {
      const existingDropdowns = editor.querySelectorAll(".aiev3-at-item");
      existingDropdowns.forEach((dropdown) => dropdown.remove());
    }

    // Add locked status
    if (this.isLocked || !this.isActive) {
      span.classList.add("is-locked");
      span.dataset.isLocked = "true";
    } else if (this.isActive) {
      span.classList.add("is-active");

      // Add in dropdown
      const renderDropdown = () => {
        // Double check class list
        if (!span.classList.contains("is-locked")) {
          // Create download
          const dropdownUl = document.createElement("ul");
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
            if (
              atItem &&
              atItem instanceof HTMLElement &&
              atItem.classList.contains("aiev3-at-item")
            ) {
              const thisText = atItem.textContent;
              span.textContent = atItem.dataset.text ?? thisText;
              span.classList.remove("is-active");
              span.classList.add("is-locked");
              span.dataset.isLocked = "true";
              dropdownUl.remove();
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
          const atFunction = renderProps.atListFunction ?? this.atListFunction;
          atFunction(this.text)
            .then((resolvedAtList) => {
              dropdownUl.innerHTML = "";
              if (resolvedAtList.length === 0) {
                const noItems = document.createElement("li");
                noItems.classList.add("aiev3-at-no-items");
                noItems.textContent = "No items found";
                dropdownUl.appendChild(noItems);
              } else {
                resolvedAtList.slice(0, this.maxAtListLength).forEach((atItem) => {
                  const atSpan = atItem.listRender ?? document.createElement("li");
                  if (!atSpan.classList.contains("aiev3-at-item"))
                    atSpan.classList.add("aiev3-at-item");
                  if (!atSpan.dataset.text) atSpan.dataset.text = atItem.text;
                  if (atSpan.textContent === "" || !atSpan.textContent)
                    atSpan.textContent = atItem.text;
                  atSpan.dataset.text = atItem.text;
                  dropdownUl.appendChild(atSpan);
                });
                if (resolvedAtList.length >= this.maxAtListLength) {
                  const atSpan = document.createElement("li");
                  atSpan.classList.add("aiev3-more-items");
                  atSpan.textContent = `...${resolvedAtList.length - this.maxAtListLength} more`;
                  dropdownUl.appendChild(atSpan);
                }
              }
            })
            .catch(() => {
              dropdownUl.innerHTML = "";
              const errorItem = document.createElement("li");
              errorItem.classList.add("aiev3-at-items-error");
              errorItem.textContent = "Error fetching list";
              errorItem.style.color = "red";
              dropdownUl.appendChild(errorItem);
            });
        }
      };

      // Throttle render
      let renderTimeout: number | null = null;
      if (!renderTimeout) {
        renderTimeout = window.setTimeout(renderDropdown, 100);
      }
    }
    if (renderProps.currentEl) renderProps.currentEl.append(ret);
    return ret;
  }
}
