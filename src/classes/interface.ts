import { EditorV3TextBlock, EditorV3TextBlockType } from "./EditorV3TextBlock";
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
}
export interface EditorV3ContentPropsInput {
  allowMarkdown?: boolean;
  allowNewLine?: boolean;
  decimalAlignPercent?: number;
  markdownSettings?: IMarkdownSettings;
  showMarkdown?: boolean;
  styles?: EditorV3Styles;
  textAlignment?: EditorV3Align;
}

/**
 * Line import object for EditorV3
 */
export interface EditorV3LineImport {
  textBlocks: { text: string; style?: string; type: EditorV3TextBlockType }[] | EditorV3TextBlock[];
}

/**
 * Cpmplete import object for EditorV3
 */
export interface EditorV3Import {
  lines: EditorV3LineImport[];
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
}
