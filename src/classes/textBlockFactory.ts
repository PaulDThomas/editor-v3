import {
  EditorV3AtBlock,
  IEditorV3AtBlock,
  IEditorV3AtBlockOptionalParams,
} from "./EditorV3AtBlock";
import { EditorV3SelectBlock, IEditorV3SelectBlock } from "./EditorV3SelectBlock";
import {
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
    | DocumentFragment
    | EditorV3TextBlock
    | IEditorV3TextBlock
    | EditorV3AtBlock
    | IEditorV3AtBlock
    | EditorV3SelectBlock
    | IEditorV3SelectBlock,
  forcedParams?: IEditorV3TextBlockOptionalParams | IEditorV3AtBlockOptionalParams,
): EditorV3TextBlock | EditorV3AtBlock | EditorV3SelectBlock => {
  // Span element
  if (arg instanceof HTMLSpanElement) {
    switch (arg.dataset.type) {
      case "at":
        return new EditorV3AtBlock(arg, forcedParams);
      case "select":
        return new EditorV3SelectBlock(arg, forcedParams);
      default:
        return new EditorV3TextBlock(arg, forcedParams);
    }
  }

  // Document Fragment element
  else if (arg instanceof DocumentFragment) {
    if (arg.childNodes.length > 0 && arg.childNodes[0] instanceof HTMLSpanElement) {
      const span = arg.childNodes[0] as HTMLSpanElement;
      switch (span.dataset.type) {
        case "at":
          return new EditorV3AtBlock(arg, forcedParams);
        case "select":
          return new EditorV3SelectBlock(arg, forcedParams);
        default:
          return new EditorV3TextBlock(arg, forcedParams);
      }
    }
    throw new Error("TextBlockFactory:DocumentFragment: Bad contents");
  }
  // Text node
  else if (arg instanceof Text) {
    return new EditorV3TextBlock(
      { text: (arg.textContent ?? "").replaceAll("\u00a0", " ") },
      forcedParams,
    );
  }
  // Must be object
  else {
    switch (arg.type || forcedParams?.type) {
      case "at":
        return new EditorV3AtBlock(arg, forcedParams);
      case "select":
        return new EditorV3SelectBlock(arg, forcedParams);
      default:
        return new EditorV3TextBlock(arg, forcedParams);
    }
  }
};
