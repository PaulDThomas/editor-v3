import {
  EditorV3AtBlock,
  IEditorV3AtBlock,
  IEditorV3AtBlockOptionalParams,
} from "./EditorV3AtBlock";
import {
  EditorV3TextBlockType,
  EditorV3TextBlock,
  IEditorV3TextBlock,
  IEditorV3TextBlockOptionalParams,
} from "./EditorV3TextBlock";

/**
 *  Factory function to direct text block creation
 * @param arg Block data/element
 * @param forcedParams Parameters to force
 * @returns EditorV3TextBlock | EditorV3AtBlock
 */
export const textBlockFactory = (
  arg:
    | HTMLSpanElement
    | Text
    | EditorV3TextBlock
    | DocumentFragment
    | IEditorV3TextBlock
    | IEditorV3AtBlock
    | string,
  forcedParams?: IEditorV3TextBlockOptionalParams | IEditorV3AtBlockOptionalParams,
): EditorV3TextBlock | EditorV3AtBlock => {
  // Initial
  const factory: {
    text: string;
    style?: string;
    type?: EditorV3TextBlockType;
    isLocked?: true | undefined;
    lineStartPosition?: number;
  } = { text: "" };

  // Text
  if (typeof arg === "string") {
    try {
      const jsonInput = JSON.parse(arg);
      if (jsonInput.text) {
        factory.text = jsonInput.text;
      } else {
        throw "No text in JSON input";
      }
      if (jsonInput.style) factory.style = jsonInput.style;
      if (jsonInput.type) factory.type = jsonInput.type;
      if (jsonInput.isLocked) factory.isLocked = jsonInput.isLocked;
      if (jsonInput.lineStartPosition) factory.lineStartPosition = jsonInput.lineStartPosition;
    } catch {
      factory.text = arg;
    }
  }
  // Span element
  else if (arg instanceof HTMLSpanElement) {
    factory.text = arg.textContent?.replaceAll("\u00A0", " ") ?? "";
    if (arg.classList.contains("aiev3-tb-space")) factory.text = ` ${factory.text}`;
    factory.style = arg.dataset.styleName;
    factory.type = (arg.dataset.type as EditorV3TextBlockType | undefined) ?? "text";
    if (arg.dataset.isLocked) factory.isLocked = true;
  }

  // Document Fragment element
  else if (arg instanceof DocumentFragment) {
    factory.text = "";
    arg.childNodes.forEach((child, ix) => {
      // Set style
      if (child instanceof HTMLSpanElement) {
        factory.text += child.classList.contains("aiev3-tb-space")
          ? ` ${child.textContent}`
          : child.textContent;
        if (factory.style && child.dataset.styleName !== factory.style)
          throw "Multiple styles in fragment";
        else factory.style = child.dataset.styleName;
        // Set type
        if (ix === 0)
          factory.type = (child.dataset.type as EditorV3TextBlockType | undefined) ?? "text";
        // else if (
        //   (child.dataset.type as EditorV3TextBlockType | undefined) &&
        //   child.dataset.type !== factory.type
        // ) {
        //   throw "Multiple types in fragment";
        // }
        // Set isLocked
        if (ix === 0 && child.dataset.isLocked) factory.isLocked = true;
        else if (
          (child.dataset.isLocked && !factory.isLocked) ||
          (factory.isLocked && !child.dataset.isLocked)
        )
          throw "Multiple isLocked in fragment";
      }
    });
    factory.text = factory.text.replaceAll("\u00A0", " ");
  }
  // Text node
  else if (arg instanceof Text) {
    factory.text = arg.textContent?.replaceAll("\u00A0", " ") ?? "";
    factory.type = "text";
    factory.style = undefined;
    factory.isLocked = undefined;
  }
  // Must be object
  else {
    factory.text = arg.text;
    factory.style = arg.style;
    factory.type = arg.type ?? "text";
    factory.isLocked = arg.isLocked;
    factory.lineStartPosition = arg.lineStartPosition ?? 0;
  }

  // Fix characters
  factory.text = factory.text.replace(/[\u2009-\u200F\t\r\n]/g, ""); // Remove undesirable non-printing chars
  if (factory.text.startsWith("@")) factory.type = "at";

  // Return appropriate class
  if (factory.type === "at") {
    return new EditorV3AtBlock(factory, forcedParams as IEditorV3AtBlockOptionalParams);
  } else {
    return new EditorV3TextBlock(factory, forcedParams as IEditorV3TextBlockOptionalParams);
  }
};
