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

export interface IEditorV3SelectBlockOptionalParams extends IEditorV3TextBlockOptionalParams {
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
   * Available options
   */
  private _availableOptions: EditorV3DropListItem<Record<string, string>>[] = [];
  public get availableOptions(): EditorV3DropListItem<Record<string, string>>[] {
    return this._availableOptions;
  }
  private _styleOrNot = (
    o: EditorV3DropListItem<Record<string, string>>,
  ): EditorV3DropListItem<Record<string, string>> => {
    const option: EditorV3DropListItem<Record<string, string>> = {
      text: o.text,
      data: {},
    };
    if (o.data?.style && option.data) option.data.style = o.data.style;
    else if (option.data) option.data.noStyle = "true";
    return option;
  };

  public set availableOptions(value: EditorV3DropListItem<Record<string, string>>[]) {
    this._availableOptions = value.map(this._styleOrNot);
  }

  get data(): IEditorV3SelectBlock {
    const ret: IEditorV3SelectBlock = super.data;
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

  constructor(
    arg: IEditorV3SelectBlock | HTMLSpanElement | DocumentFragment | string,
    forcedParams?: IEditorV3SelectBlockOptionalParams,
  ) {
    // Usual text block constructor
    super(arg, forcedParams);
    // Force type
    this.type = "select";
    this.isLocked = true;
    // Check for at specific information
    if (typeof arg === "string") {
      this.furtherMarkdown(forcedParams?.markdownSettings);
    } else if (arg instanceof HTMLSpanElement) {
      this.furtherHtml(arg);
    } else if (arg instanceof DocumentFragment) {
      if (arg.childNodes.length !== 1)
        throw new Error("EditorV3SelectBlock:Constructor: DocumentFragment must have 1 child node");
      else if (!(arg.childNodes[0] instanceof HTMLSpanElement))
        throw new Error(
          "EditorV3SelectBlock:Constructor: DocumentFragment child node must be HTMLSpanElement",
        );
      // Read element
      this.furtherHtml(arg.childNodes[0] as HTMLSpanElement);
    } else {
      if (arg.availableOptions) this.availableOptions = arg.availableOptions;
    }
    // Force any parameters
    if (forcedParams) {
      if (forcedParams.availableOptions) this.availableOptions = forcedParams.availableOptions;
    }
  }

  // Read extra data from HTML
  private furtherHtml(arg: HTMLSpanElement) {
    // Copy dataset to selectFactory
    if (arg.dataset.availableOptions) {
      this.availableOptions = JSON.parse(arg.dataset.availableOptions);
    }
  }

  // Get markdown information
  private furtherMarkdown(arg?: IMarkdownSettings) {
    const markdownSettings = arg ?? this._defaultContentProps.markdownSettings;
    this.availableOptions = [];
    if (
      this.text.startsWith(markdownSettings.dropDownStartTag) &&
      this.text.endsWith(markdownSettings.dropDownEndTag) &&
      this.text.includes(markdownSettings.dropDownSelectedValueTag)
    ) {
      this.text = this.text.slice(
        markdownSettings.dropDownStartTag.length,
        -markdownSettings.dropDownEndTag.length,
      );
      const dd = this.text.indexOf(markdownSettings.dropDownSelectedValueTag);

      const current = this.text.slice(0, dd);
      const optionsTexts = this.text
        .slice(dd + markdownSettings.dropDownSelectedValueTag.length)
        .split(markdownSettings.dropDownValueSeparator);

      this.markdownStyleLabel(current, markdownSettings);
      this.availableOptions = optionsTexts.map((optionText) => {
        const ret = this.markdownStyleLabel(optionText, markdownSettings, false);
        return {
          text: ret.text,
          data: ret.style ? { style: ret.style } : undefined,
        };
      });
    }
  }

  // Show dropdown
  public showDropdown = () => {
    this.isActive = true;
    this.isSelected = true;
  };

  // Overload html return
  public toHtml(renderProps: EditorV3RenderProps, style?: EditorV3Style): DocumentFragment {
    // Create holder
    const ret = new DocumentFragment();
    const span = document.createElement("span");
    ret.appendChild(span);
    if (renderProps.currentEl) renderProps.currentEl.append(ret);
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

    // Add locked status
    span.classList.add("is-locked");
    span.dataset.isLocked = "true";
    span.contentEditable = "false";
    // Add other data items from the at item
    span.dataset.availableOptions = JSON.stringify(this.availableOptions);

    // Add caret
    const caret = document.createElement("span");
    caret.classList.add("select-block-caret", "skip-read");
    span.prepend(caret);

    // Remove any existing dropdowns
    const previousDropdown = document.querySelectorAll(".aiev3-dropdown-list");
    previousDropdown.forEach((dropdown) => dropdown.remove());

    // Throttle dropdown render
    let renderTimeout: number | null = null;
    if (
      !renderTimeout &&
      this.isSelected &&
      this.availableOptions.length > 0 &&
      renderProps.caretPosition?.isCollapsed === false
    ) {
      span.classList.add("show-dropdown");
      renderTimeout = window.setTimeout(() => {
        renderDropdown(span, this.text, {
          ...renderProps,
          atListFunction: async () => {
            return (
              this.availableOptions.map((option) => {
                const listItem = document.createElement("li");
                const tb = new EditorV3TextBlock({
                  text: option.text,
                  style: option.data?.style,
                });
                tb.toHtml({ currentEl: listItem }, renderProps.styles?.[option.data?.style ?? ""]);
                return {
                  text: option.text,
                  data: option.data,
                  listRender: listItem,
                };
              }) ?? []
            );
          },
          maxAtListLength: Math.max(1, this.availableOptions.length),
        });
      }, 100);
    }
    if (this.isActive) {
      span.classList.add("is-active");
    }

    // Add to current element if specified
    if (renderProps.currentEl) {
      renderProps.currentEl.append(ret);
    }
    // Always return
    return ret;
  }

  public toMarkdown(markdownSettings = this._defaultContentProps.markdownSettings): string {
    let text = markdownSettings.dropDownStartTag;
    text += this.toMarkdownStyleLabel(markdownSettings);
    text +=
      this.text +
      markdownSettings.dropDownSelectedValueTag +
      this._availableOptions
        .map(
          (option) =>
            (option.data?.style ? option.data.style + markdownSettings.styleNameEndTag : "") +
            option.text,
        )
        .join(markdownSettings.dropDownValueSeparator);
    text += markdownSettings.dropDownEndTag;
    return text;
  }
}
