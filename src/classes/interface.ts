export enum EditorV3Align {
  'left' = 'left',
  'center' = 'center',
  'decimal' = 'decimal',
  'right' = 'right',
}

export interface EditorV3Line {
  textBlocks: EditorV3TextBlock[];
}

export interface EditorV3Props {
  textAlignment?: EditorV3Align;
  decimalAlignPercent?: number;
  caret?: EditorV3Position;
  styles?: EditorV3Styles;
}

export interface EditorV3Import extends EditorV3Props {
  lines: EditorV3Line[];
}

export interface EditorV3Position {
  line: number;
  block: number;
  character: number;
}

export interface EditorV3Styles {
  [styleName: string]: React.CSSProperties;
}

export interface EditorV3TextBlock {
  text: string;
  style?: string;
}
