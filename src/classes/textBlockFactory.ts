import {
  EditorV3AtBlock,
  IEditorV3AtBlock,
  IEditorV3AtBlockOptionalParams,
} from "./EditorV3AtBlock";
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
    | EditorV3TextBlock
    | DocumentFragment
    | IEditorV3TextBlock
    | IEditorV3AtBlock
    | string,
  forcedParams?: IEditorV3TextBlockOptionalParams | IEditorV3AtBlockOptionalParams,
): EditorV3TextBlock | EditorV3AtBlock => {
  // Span element
  if (arg instanceof HTMLSpanElement) {
    return arg.dataset.type === "at" || forcedParams?.type === "at"
      ? new EditorV3AtBlock(arg, forcedParams)
      : new EditorV3TextBlock(arg, forcedParams);
  }

  // Document Fragment element
  else if (arg instanceof DocumentFragment) {
    return arg.childNodes.length > 0 &&
      arg.childNodes[0] instanceof HTMLSpanElement &&
      (arg.childNodes[0].dataset.type === "at" || forcedParams?.type === "at")
      ? new EditorV3AtBlock(arg, forcedParams)
      : new EditorV3TextBlock(arg, forcedParams);
  }
  // Text node
  else if (arg instanceof Text) {
    return new EditorV3TextBlock(
      { text: (arg.textContent ?? "").replaceAll("\u00A0", " ") },
      forcedParams,
    );
  }
  // Text
  else if (typeof arg === "string") {
    try {
      const jsonInput = JSON.parse(arg);
      return jsonInput.type === "at" || forcedParams?.type === "at"
        ? new EditorV3AtBlock(jsonInput, forcedParams)
        : typeof jsonInput !== "object"
          ? new EditorV3TextBlock({ text: `${jsonInput}` }, forcedParams)
          : new EditorV3TextBlock(jsonInput, forcedParams);
    } catch {
      return new EditorV3TextBlock({ text: arg }, forcedParams);
    }
  }
  // Must be object
  else {
    return arg.type === "at" || forcedParams?.type === "at"
      ? new EditorV3AtBlock(arg, forcedParams)
      : new EditorV3TextBlock(arg, forcedParams);
  }
};
