import "./EditorV3AtBlock.css";
import { EditorV3TextBlock, IEditorV3TextBlock } from "./EditorV3TextBlock";
import { EditorV3RenderProps, EditorV3WordPosition } from "./interface";

export class EditorV3AtBlock extends EditorV3TextBlock {
  constructor(props: IEditorV3TextBlock) {
    super(props);
    this.type = "at";
  }

  public atList: string[] = [
    "@hello",
    "@world",
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i).repeat(2)).map(
      (letter) => `@${letter}`,
    ),
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i).repeat(4)).map(
      (letter) => `@${letter}`,
    ),
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i).repeat(6)).map(
      (letter) => `@${letter}`,
    ),
  ];
  public maxAtListLength = 10;

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
    const frag = new DocumentFragment();
    if (renderProps.currentEl) renderProps.currentEl.append(frag);
    const span = document.createElement("span");
    frag.appendChild(span);
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

      // Add in dropdown for active element
      if (editor) {
        renderProps.editableEl?.addEventListener("blur", (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("@Span event blur");
        });
        let renderTimeout: NodeJS.Timeout | null = null;
        const renderDropdown = () => {
          // Double check class list
          if (!span.classList.contains("is-locked")) {
            // Create download
            const dropdownDiv = document.createElement("ul");
            dropdownDiv.classList.add("aiev3-at-dropdown", "skip-read");
            dropdownDiv.contentEditable = "false";
            // Add event listener
            dropdownDiv.addEventListener("click", (e: MouseEvent) => {
              console.log("click on dropdown menu");
              e.preventDefault();
              e.stopPropagation();
              // Set long timeout to enable stack to clear
              setTimeout(() => {
                if (
                  e.target instanceof HTMLElement &&
                  e.target.classList.contains("aiev3-at-item")
                ) {
                  const atItem = e.target;
                  const thisText = atItem.textContent;
                  console.log("timed out click on dropdown item", thisText);
                  span.textContent = thisText;
                  span.classList.remove("is-active");
                  span.classList.add("is-locked");
                  span.dataset.isLocked = "true";
                  const existingDropdowns = editor.querySelectorAll(".aiev3-at-dropdown");
                  existingDropdowns.forEach((dropdown) => dropdown.remove());
                }
              }, 0);
            });
            // Append to editor
            editor.appendChild(dropdownDiv);

            // Position dropdown
            const editorRect = editor.getBoundingClientRect();
            const spanRect = span.getBoundingClientRect();
            if (editorRect && spanRect) {
              dropdownDiv.style.left = `${spanRect.left - editorRect.left}px`;
              dropdownDiv.style.top = `${spanRect.bottom - editorRect.top}px`;
            }

            // Ad items to dropdown
            const filteredList = this.atList.filter((atItem) =>
              atItem.toLowerCase().includes(this.text.toLowerCase()),
            );
            if (filteredList.length === 0) {
              const noItems = document.createElement("li");
              noItems.classList.add("aiev3-at-no-items");
              noItems.textContent = "No items found";
              dropdownDiv.appendChild(noItems);
            } else {
              filteredList.slice(0, this.maxAtListLength).forEach((atItem) => {
                const atSpan = document.createElement("li");
                atSpan.classList.add("aiev3-at-item");
                atSpan.textContent = atItem;
                atSpan.dataset.handler = "at-dropdown-list";
                dropdownDiv.appendChild(atSpan);
              });
              if (filteredList.length >= this.maxAtListLength) {
                const atSpan = document.createElement("li");
                atSpan.classList.add("aiev3-more-items");
                atSpan.textContent = `...${filteredList.length - this.maxAtListLength} more`;
                dropdownDiv.appendChild(atSpan);
              }
            }
          }
        };
        renderTimeout = null;
        if (!renderTimeout) {
          renderTimeout = setTimeout(renderDropdown, 100);
        }
      }
    }
    return frag;
  }
}
