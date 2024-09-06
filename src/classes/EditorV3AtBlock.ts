import {
  EditorV3TextBlock,
  IEditorV3TextBlock,
  IEditorV3TextBlockOptionalParams,
} from "./EditorV3TextBlock";
import {
  EditorV3DropListItem,
  EditorV3RenderProps,
  EditorV3Style,
  EditorV3WordPosition,
} from "./interface";
import { IMarkdownSettings } from "./defaultMarkdownSettings";
import { renderDropdown } from "./toHtml/renderDropdown";
import { stopDragOnto } from "./toHtml/stopDragOnto";

export interface IEditorV3AtBlockOptionalParams extends IEditorV3TextBlockOptionalParams {
  atListFunction?: (typedString: string) => Promise<EditorV3DropListItem<Record<string, string>>[]>;
  maxAtListLength?: number;
  atData?: Record<string, string>;
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
  ) => Promise<EditorV3DropListItem<Record<string, string>>[]> = () =>
    new Promise((resolve) => resolve([]));
  /**
   * Maximum number of items to display in the returned list
   */
  public maxAtListLength = 10;

  public atData: Record<string, string> = {};

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
    arg: IEditorV3AtBlock | HTMLSpanElement | DocumentFragment | string,
    forcedParams?: IEditorV3AtBlockOptionalParams,
  ) {
    // Usual text block constructor
    super(arg, forcedParams);
    // Force type
    this.type = "at";
    // Check for at specific information
    if (typeof arg === "string") {
      this.furtherMarkdown(forcedParams?.markdownSettings);
    } else if (arg instanceof HTMLSpanElement) {
      this.furtherHtml(arg);
    } else if (arg instanceof DocumentFragment) {
      if (arg.childNodes.length !== 1)
        throw new Error("EditorV3AtBlock:Constructor: DocumentFragment must have 1 child node");
      else if (!(arg.childNodes[0] instanceof HTMLSpanElement))
        throw new Error("EditorV3AtBlock:Constructor: Child node must be HTMLSpanElement");
      // Read element
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

  // Read extra data from HTML
  private furtherHtml(arg: HTMLSpanElement) {
    // Copy dataset to atFactory
    Object.keys(arg.dataset).forEach((key) => {
      if (!["styleName", "isLocked", "type", "text", "lineStartPosition"].includes(key)) {
        this.atData[key] = arg.dataset[key] as string;
      }
    });
  }

  // Get markdown information
  private furtherMarkdown(arg?: IMarkdownSettings) {
    const markdownSettings = arg ?? this._defaultContentProps.markdownSettings;
    this.atData = {};
    if (
      this.text.startsWith(markdownSettings.atStartTag) &&
      this.text.endsWith(markdownSettings.atEndTag)
    ) {
      this.markdownStyleLabel(
        this.text.slice(markdownSettings.atStartTag.length, -markdownSettings.atEndTag.length),
        markdownSettings,
      );
    }
  }

  // Overload html return
  public toHtml(renderProps: EditorV3RenderProps, style?: EditorV3Style): DocumentFragment {
    // Create holder
    const ret = new DocumentFragment();
    if (renderProps.currentEl) renderProps.currentEl.append(ret);
    const span = document.createElement("span");
    ret.appendChild(span);
    span.classList.add("aiev3-tb", "at-block");
    span.dataset.type = "at";

    // Add Text node
    const textNode = document.createTextNode(
      this.text.replaceAll("\u200c", "").replace(/^ /, "\u00a0").replace(/ $/, "\u00a0"),
    );

    span.appendChild(textNode);
    // Add style
    this.applyStyle(span, style);
    // Add label
    if (this.label) span.title = this.label;
    // Delete any existing dropdown on render
    const editor = renderProps.currentEl?.closest(".aiev3") as HTMLDivElement | null;
    if (editor) {
      const existingDropdowns = editor.querySelectorAll("ul.aiev3-dropdown-list");
      existingDropdowns.forEach((dropdown) => dropdown.remove());
    }

    // Remove any existing dropdowns
    const previousDropdown = document.querySelectorAll(".aiev3-dropdown-list");
    previousDropdown.forEach((dropdown) => dropdown.remove());

    // Add locked status
    if (this.isLocked || !this.isActive) {
      span.classList.add("is-locked");
      span.dataset.isLocked = "true";
      stopDragOnto(span);
      // Add any other data items from the at item
      this.atData &&
        Object.keys(this.atData).forEach((key) => {
          span.dataset[key] = this.atData[key] as string;
        });
    } else if (this.isActive) {
      span.classList.add("is-active");

      // Throttle render
      let renderTimeout: number | null = null;
      if (!renderTimeout) {
        span.classList.add("show-dropdown");
        renderTimeout = window.setTimeout(
          () =>
            renderDropdown(span, this.text, {
              ...renderProps,
              atListFunction: renderProps.atListFunction ?? this.atListFunction,
              maxAtListLength: renderProps.maxAtListLength ?? this.maxAtListLength,
            }),
          100,
        );
      }
    }

    // Add to current element if specified
    if (renderProps.currentEl) renderProps.currentEl.append(ret);
    // Always return
    return ret;
  }

  public toMarkdown(markdownSettings = this._defaultContentProps.markdownSettings): string {
    // Set base text
    let text = markdownSettings.atStartTag;
    // Update text with style and label
    text += this.toMarkdownStyleLabel(markdownSettings);
    // Complete tag
    text += this.text + markdownSettings.atEndTag;
    return text;
  }
}
