// Interfaces
export interface iColourStyles {
  [styleName: string]: React.CSSProperties;
}

export interface iTextBoundary {
  type: string;
  start: number;
  end?: number;
  span?: HTMLSpanElement | Node;
}

export interface iStyleBlock {
  start: number;
  end: number;
  styleName?: string;
}

export interface iColouredLine {
  text: string;
  styles?: iColourStyles;
  styleBlocks?: iStyleBlock[];
}

export enum EditorV3Align {
  'left' = 'left',
  'center' = 'center',
  'decimal' = 'decimal',
  'right' = 'right',
}

export interface AieStyleMap {
  [styleName: string]: { style: React.CSSProperties };
}
export interface AieStyleExcludeMap {
  [styleName: string]: string[];
}
