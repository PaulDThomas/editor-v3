import "./EditorV3AtBlock.css";
import { EditorV3TextBlock, IEditorV3TextBlock } from "./EditorV3TextBlock";
import { EditorV3RenderProps, EditorV3WordPosition } from "./interface";

export interface IEditorV3AtBlock extends IEditorV3TextBlock {
  atListFunction?: (typedString: string) => Promise<string[]>;
  maxAtListLength?: number;
}

export class EditorV3AtBlock extends EditorV3TextBlock implements IEditorV3AtBlock {
  /**
   * Promise function that will return list of string values to display
   * @param typedString Text entered into the block so far
   * @returns Promise of array of strings
   */
  public atListFunction: (typedString: string) => Promise<string[]> = () => new Promise(() => []);
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
      const existingDropdowns = editor.querySelectorAll(".aiev3-at-dropdown");
      existingDropdowns.forEach((dropdown) => dropdown.remove());
    }

    // Add locked status
    if (this.isLocked || !this.isActive) {
      span.classList.add("is-locked");
      span.dataset.isLocked = "true";
    } else if (this.isActive) {
      span.classList.add("is-active");

      // Add in dropdown
      let renderTimeout: NodeJS.Timeout | null = null;
      const renderDropdown = () => {
        // Double check class list
        if (!span.classList.contains("is-locked")) {
          // Create download
          const dropdownDiv = document.createElement("ul");
          // Append to editor
          span.appendChild(dropdownDiv);
          // Set up dropdown internals
          dropdownDiv.classList.add("aiev3-at-dropdown", "skip-read");
          dropdownDiv.contentEditable = "false";
          dropdownDiv.innerHTML = "<li>Loading...</li>";
          // Add event listener
          dropdownDiv.addEventListener("click", (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            // Set long timeout to enable stack to clear
            const atItem = e.target;
            if (
              atItem &&
              atItem instanceof HTMLElement &&
              atItem.dataset.handler === "at-dropdown-list"
            ) {
              const thisText = atItem.textContent;
              span.textContent = thisText;
              span.classList.remove("is-active");
              span.classList.add("is-locked");
              span.dataset.isLocked = "true";
            }
          });
          // Add event listener to document
          const clickHandler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const dropdown = span.querySelector(".aiev3-at-dropdown");
            if (dropdown && !dropdown.contains(target)) {
              dropdown.remove();
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
            dropdownDiv.style.left = `${spanRect.left - offSetRect.left}px`;
            dropdownDiv.style.top = `${spanRect.bottom - offSetRect.top}px`;
          }

          // Add items to dropdown when promise resolves
          const atFunction = renderProps.atListFunction ?? this.atListFunction;
          atFunction(this.text).then((resolvedAtList) => {
            dropdownDiv.innerHTML = "";
            if (resolvedAtList.length === 0) {
              const noItems = document.createElement("li");
              noItems.classList.add("aiev3-at-no-items");
              noItems.textContent = "No items found";
              dropdownDiv.appendChild(noItems);
            } else {
              resolvedAtList.slice(0, this.maxAtListLength).forEach((atItem) => {
                const atSpan = document.createElement("li");
                atSpan.classList.add("aiev3-at-item");
                atSpan.textContent = atItem;
                atSpan.dataset.handler = "at-dropdown-list";
                dropdownDiv.appendChild(atSpan);
              });
              if (resolvedAtList.length >= this.maxAtListLength) {
                const atSpan = document.createElement("li");
                atSpan.classList.add("aiev3-more-items");
                atSpan.textContent = `...${resolvedAtList.length - this.maxAtListLength} more`;
                dropdownDiv.appendChild(atSpan);
              }
            }
          });
          // .catch(() => {
          //   // dropdownDiv.innerHTML = "<li>Error fetching list</li>";
          //   dropdownDiv.innerHTML = "";
          //   const errorItem = document.createElement("li");
          //   errorItem.classList.add("aiev3-at-items-error");
          //   errorItem.textContent = "Error fetching list";
          //   dropdownDiv.appendChild(errorItem);
          // });
        }
      };
      // Throttle render
      if (!renderTimeout) {
        renderTimeout = setTimeout(renderDropdown, 100);
      }
    }
    if (renderProps.currentEl) renderProps.currentEl.append(ret);
    return ret;
  }
}
