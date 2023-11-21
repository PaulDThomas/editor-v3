import { EditorV3TextBlock } from "./EditorV3TextBlock";
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
export interface EditorV3Styles {
  [styleName: string]: React.CSSProperties;
}

/**
 * Line object for EditorV3
 */
export interface EditorV3LineProps {
  textBlocks: EditorV3TextBlock[];
}

/**
 * Content object for EditorV3
 * @param textAlignment Alignment of text withing the editor
 * @param decimalAlignPercent Percent of width to align decimal to, 0-100;
 * @param caret Current position of the caret
 * @param styles Available styles
 * @param showMarkdown Print markdown syntax instead of rendering
 */
export interface EditorV3ContentProps {
  textAlignment?: EditorV3Align;
  decimalAlignPercent?: number;
  caret?: EditorV3Position;
  styles?: EditorV3Styles;
  showMarkdown?: boolean;
  markdownSettings?: IMarkdownSettings;
}

/**
 * Line import object for EditorV3
 */
export interface EditorV3LineImport {
  textBlocks: { text: string; style?: string }[] | EditorV3TextBlock[];
  textAlignment?: string;
  decimalAlignPercent?: number;
}

/**
 * Cpmplete import object for EditorV3
 */
export interface EditorV3Import extends EditorV3ContentProps {
  lines: EditorV3LineImport[];
  styles?: EditorV3Styles;
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
}
