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
import { renderDropdown } from "./toHtml/renderDropdown";

export interface IEditorV3SelectBlockOptionalParams extends IEditorV3TextBlockOptionalParams {
  selectedOption?: string;
  availableOptions?: EditorV3DropListItem<Record<string, string>>[];
}

export interface IEditorV3SelectBlock
  extends IEditorV3TextBlock,
    IEditorV3SelectBlockOptionalParams {}

/**
 * EditorV3SelectBlock - text block that can be one among a list of options
 */
export class EditorV3SelectBlock extends EditorV3TextBlock implements IEditorV3SelectBlock {
  /**
   * Currently selected option
   */
  public selectedOption: string | undefined;

  /**
   * Available options
   */
  public availableOptions: EditorV3DropListItem<Record<string, string>>[] = [];

  get data(): IEditorV3SelectBlock {
    const ret: IEditorV3SelectBlock = super.data;
    ret.selectedOption = this.selectedOption;
    ret.availableOptions = this.availableOptions;
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

  private _styleOrNot = (
    o: EditorV3DropListItem<Record<string, string>>,
  ): EditorV3DropListItem<Record<string, string>> => {
    const option: EditorV3DropListItem<Record<string, string>> = {
      text: o.text,
      data: { text: o.text },
    };
    if (o.data?.style && option.data) option.data.style = o.data.style;
    else if (option.data) option.data.noStyle = "true";
    return option;
  };

  constructor(
    arg: IEditorV3SelectBlock | HTMLSpanElement | DocumentFragment,
    forcedParams?: IEditorV3SelectBlockOptionalParams,
  ) {
    // Usual text block constructor
    super(arg, forcedParams);
    // Force type
    this.type = "select";
    // Check for at specific information
    if (arg instanceof HTMLSpanElement) {
      this.furtherHtml(arg);
    } else if (arg instanceof DocumentFragment) {
      if (arg.childNodes.length !== 1)
        throw new Error("EditorV3SelectBlock:Constructor: DocumentFragment must have 1 child node");
      else if (!(arg.childNodes[0] instanceof HTMLSpanElement))
        throw new Error(
          "EditorV3SelectBlock:Constructor: DocumentFragment child node must be HTMLSpanElement",
        );
      this.furtherHtml(arg.childNodes[0] as HTMLSpanElement);
    } else {
      if (arg.selectedOption) this.selectedOption = arg.selectedOption;
      if (arg.availableOptions) this.availableOptions = arg.availableOptions.map(this._styleOrNot);
    }
    // Force any parameters
    if (forcedParams) {
      if (forcedParams.selectedOption) this.selectedOption = forcedParams.selectedOption;
      if (forcedParams.availableOptions)
        this.availableOptions = forcedParams.availableOptions.map(this._styleOrNot);
    }
  }

  // Read extra data from HTML
  private furtherHtml(arg: HTMLSpanElement) {
    // Copy dataset to selectFactory
    if (arg.dataset.selectedOption) this.selectedOption = arg.dataset.selectedOption;
    if (arg.dataset.availableOptions) {
      this.availableOptions = JSON.parse(arg.dataset.availableOptions);
    }
  }

  // Show dropdown
  public showDropdown = () => {
    this.isSelected = true;
  };

  // Overload html return
  public toHtml(renderProps: EditorV3RenderProps, style?: EditorV3Style): DocumentFragment {
    // Create holder
    const ret = new DocumentFragment();
    if (renderProps.currentEl) renderProps.currentEl.append(ret);
    const span = document.createElement("span");
    ret.appendChild(span);
    span.classList.add("aiev3-tb", "select-block");
    span.dataset.type = "select";

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
    const editor = renderProps.editableEl?.closest(".aiev3") as HTMLDivElement | null;
    if (editor) {
      const existingDropdowns = editor.querySelectorAll("ul.aiev3-dropdown-list");
      existingDropdowns.forEach((dropdown) => dropdown.remove());
    }

    // Add locked status
    if (this.isLocked || !this.isActive) {
      span.classList.add("is-locked");
      span.dataset.isLocked = "true";
      span.contentEditable = "false";
      // Add other data items from the at item
      span.dataset.availableOptions = JSON.stringify(this.availableOptions);
      if (this.selectedOption) span.dataset.selectedOption = this.selectedOption ?? "";

      // Throttle dropdown render
      let renderTimeout: number | null = null;
      if (!renderTimeout && this.isSelected && this.availableOptions.length > 0) {
        span.classList.add("show-dropdown");
        renderTimeout = window.setTimeout(() => {
          renderDropdown(
            span,
            async () => {
              return (
                this.availableOptions.map((option) => {
                  const listItem = document.createElement("li");
                  const tb = new EditorV3TextBlock({
                    text: option.text,
                    style: option.data?.style,
                  });
                  tb.toHtml(
                    { currentEl: listItem },
                    renderProps.styles?.[option.data?.style ?? ""],
                  );
                  return {
                    text: option.text,
                    data: option.data,
                    listRender: listItem,
                  };
                }) ?? []
              );
            },
            Math.max(1, this.availableOptions.length),
            this.text,
          );
        }, 100);
      }
    } else if (this.isActive) {
      span.classList.add("is-active");
    }

    // Add to current element if specified
    if (renderProps.currentEl) {
      renderProps.currentEl.append(ret);
    }
    // Always return
    return ret;
  }
}
