import "./EditorV3AtBlock.css";
import {
  EditorV3TextBlock,
  IEditorV3TextBlock,
  IEditorV3TextBlockOptionalParams,
} from "./EditorV3TextBlock";
import { EditorV3AtListItem, EditorV3RenderProps, EditorV3WordPosition } from "./interface";

export interface IEditorV3AtBlockOptionalParams extends IEditorV3TextBlockOptionalParams {
  atListFunction?: (
    typedString: string,
  ) => Promise<EditorV3AtListItem<{ [key: string]: string }>[]>;
  maxAtListLength?: number;
  atData?: { [key: string]: string };
}

export interface IEditorV3AtBlock extends IEditorV3TextBlock, IEditorV3AtBlockOptionalParams {}

export class EditorV3AtBlock extends EditorV3TextBlock implements IEditorV3AtBlock {
  /**
   * Promise function that will return list of string values to display
   * @param typedString Text entered into the block so far
   * @returns Promise of array of strings
   */
  public atListFunction: (
    typedString: string,
  ) => Promise<EditorV3AtListItem<{ [key: string]: string }>[]> = () =>
    new Promise((resolve) => resolve([]));
  /**
   * Maximum number of items to display in the returned list
   */
  public maxAtListLength = 10;

  public atData: { [key: string]: string } = {};

  get data(): IEditorV3AtBlock {
    const ret: IEditorV3AtBlock = super.data;
    if (Object.keys(this.atData).length > 0) {
      ret.atData = this.atData;
    }
    return ret;
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

  constructor(
    arg: IEditorV3AtBlock | HTMLSpanElement | DocumentFragment,
    forcedParams?: IEditorV3AtBlockOptionalParams,
  ) {
    // Usual text block constructor
    super(arg, forcedParams);
    // Force type
    this.type = "at";
    // Check for at specific information
    if (arg instanceof HTMLSpanElement) {
      this.furtherHtml(arg);
    } else if (arg instanceof DocumentFragment) {
      if (arg.childNodes.length !== 1)
        throw new Error("EditorV3AtBlock:Constructor: DocumentFragment must have 1 child node");
      else if (!(arg.childNodes[0] instanceof HTMLSpanElement))
        throw new Error(
          "EditorV3AtBlock:Constructor: DocumentFragment child node must be HTMLSpanElement",
        );
      this.furtherHtml(arg.childNodes[0] as HTMLSpanElement);
    } else {
      if (arg.atListFunction) this.atListFunction = arg.atListFunction;
      if (arg.maxAtListLength) this.maxAtListLength = arg.maxAtListLength;
      if (arg.atData) {
        this.atData = arg.atData;
      }
    }
    // Force any parameters
    if (forcedParams) {
      if (forcedParams.atListFunction) this.atListFunction = forcedParams.atListFunction;
      if (forcedParams.maxAtListLength) this.maxAtListLength = forcedParams.maxAtListLength;
      if (forcedParams.atData) this.atData = forcedParams.atData;
    }
  }

  private furtherHtml(arg: HTMLSpanElement) {
    // Copy dataset to atFactory
    Object.keys(arg.dataset).forEach((key) => {
      if (!["styleName", "isLocked", "type", "text", "lineStartPosition"].includes(key)) {
        this.atData[key] = arg.dataset[key] as string;
      }
    });
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
      this.text.replaceAll("\u200c", "").replace(/^ /, "\u00A0").replace(/ $/, "\u00A0"),
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
      const existingDropdowns = editor.querySelectorAll("ul.aiev3-at-dropdown-list");
      existingDropdowns.forEach((dropdown) => dropdown.remove());
    }

    // Add locked status
    if (this.isLocked || !this.isActive) {
      span.classList.add("is-locked");
      span.dataset.isLocked = "true";
      // Add any other data items from the at item
      this.atData &&
        Object.keys(this.atData).forEach((key) => {
          span.dataset[key] = (this.atData as { [key: string]: string })[key] as string;
        });
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
                  // Add in data from atItem
                  if (atItem.data) {
                    Object.keys(atItem.data).forEach((key) => {
                      if (
                        typeof (atItem.data as { [key: string]: string })[
                          key as keyof typeof atItem.data
                        ] === "string"
                      )
                        atSpan.dataset[key] = (atItem.data as { [key: string]: string })[
                          key as keyof typeof atItem.data
                        ] as string;
                    });
                  }
                  dropdownUl.appendChild(atSpan);
                });
                // Add in more items list item
                if (resolvedAtList.length > this.maxAtListLength) {
                  const atSpan = document.createElement("li");
                  atSpan.classList.add("aiev3-more-items");
                  atSpan.textContent = `...${resolvedAtList.length - this.maxAtListLength} more`;
                  dropdownUl.appendChild(atSpan);
                }
              }
            })
            .catch(() => {
              // For when something goes wrong
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
    // Add to current element if specified
    if (renderProps.currentEl) renderProps.currentEl.append(ret);
    // Always return
    return ret;
  }
}
