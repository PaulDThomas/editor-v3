import { EditorV3AtBlock, IEditorV3AtBlock } from "./EditorV3AtBlock";
import { EditorV3TextBlock, IEditorV3TextBlock } from "./EditorV3TextBlock";
import { IMarkdownSettings } from "./markdown/MarkdownSettings";

/**
 * Available text alignments
 */
export enum EditorV3Align {
  "left" = "left",
  "center" = "center",
  "decimal" = "decimal",
  "right" = "right",
}

/**
 * Object container for all avaialble styles, name: React.CSSProperties
 */
export interface EditorV3Style extends React.CSSProperties {
  isLocked?: boolean;
}
export interface EditorV3Styles {
  [styleName: string]: EditorV3Style;
}

/**
 * Line object for EditorV3
 */
export interface EditorV3LineProps {
  textBlocks: EditorV3TextBlock[];
}

export interface EditorV3AtListItem<T extends Record<string, string>> {
  text: string;
  data?: T;
  listRender?: HTMLLIElement;
}

/**
 * Text block class objects EditorV3
 */
export type EditorV3BlockClass = EditorV3TextBlock | EditorV3AtBlock;

/**
 * Content object for EditorV3
 * @param textAlignment Alignment of text withing the editor
 * @param decimalAlignPercent Percent of width to align decimal to, 0-100;
 * @param caret Current position of the caret
 * @param styles Available styles
 * @param showMarkdown Print markdown syntax instead of rendering
 * @param markdownSettings Settings for markdown
 */
export interface EditorV3ContentProps {
  allowMarkdown: boolean;
  allowNewLine: boolean;
  decimalAlignPercent: number;
  markdownSettings: IMarkdownSettings;
  showMarkdown: boolean;
  styles?: EditorV3Styles;
  textAlignment: EditorV3Align;
  atListFunction?: (typedString: string) => Promise<EditorV3AtListItem<Record<string, string>>[]>;
  maxAtListLength: number;
}
export interface EditorV3ContentPropsInput {
  allowMarkdown?: boolean;
  allowNewLine?: boolean;
  decimalAlignPercent?: number;
  markdownSettings?: IMarkdownSettings;
  showMarkdown?: boolean;
  styles?: EditorV3Styles;
  textAlignment?: EditorV3Align;
  atListFunction?: (typedString: string) => Promise<EditorV3AtListItem<Record<string, string>>[]>;
  maxAtListLength?: number;
}

/**
 * Line import object for EditorV3
 */
export interface IEditorV3Line {
  textBlocks: (IEditorV3AtBlock | IEditorV3TextBlock)[];
  contentProps?: EditorV3ContentPropsInput;
}

/**
 * Complete import object for EditorV3
 */
export interface IEditorV3 {
  lines: IEditorV3Line[];
  contentProps?: EditorV3ContentPropsInput;
}

/**
 * Cursor position object for EditorV3
 */
export interface EditorV3Position {
  startLine: number;
  startChar: number;
  endLine: number;
  endChar: number;
  isCollapsed?: boolean;
  focusAt?: "start" | "end";
}
export interface EditorV3PositionF {
  initialLine: number;
  initialChar: number;
  focusLine: number;
  focusChar: number;
}
/**
 * Word positions in the content
 */
export interface EditorV3WordPosition {
  line: number;
  startChar: number;
  endChar: number;
  isLocked: boolean;
}

/**
 * Render properties passed down to elements
 */
export interface EditorV3RenderProps {
  editableEl?: HTMLDivElement;
  currentEl?: HTMLDivElement | HTMLSpanElement;
  markdownSettings?: IMarkdownSettings;
  atListFunction?: (typedString: string) => Promise<EditorV3AtListItem<Record<string, string>>[]>;
  doNotSplitWordSpans?: boolean;
  maxAtListLength?: number;
}
