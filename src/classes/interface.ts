import { EditorV3Line } from './EditorV3Line';
import { EditorV3TextBlock } from './EditoryV3TextBlock';

export enum EditorV3Align {
  'left' = 'left',
  'center' = 'center',
  'decimal' = 'decimal',
  'right' = 'right',
}

export interface EditorV3LineProps {
  textBlocks: EditorV3TextBlock[];
}

export interface EditorV3ContentProps {
  textAlignment?: EditorV3Align;
  decimalAlignPercent?: number;
  caret?: EditorV3Position;
  styles?: EditorV3Styles;
}

export interface EditorV3Import extends EditorV3ContentProps {
  lines: EditorV3Line[];
}

export interface EditorV3Position {
  startLine: number;
  startChar: number;
  endLine: number;
  endChar: number;
  isCollapsed: boolean;
}

export interface EditorV3Styles {
  [styleName: string]: React.CSSProperties;
}
