import { cloneDeep } from "lodash";
import { IEditorV3AtBlock } from "../../classes/EditorV3AtBlock";
import { EditorV3Line } from "../../classes/EditorV3Line";
import { IEditorV3SelectBlock } from "../../classes/EditorV3SelectBlock";
import { EditorV3TextBlock, IEditorV3TextBlock } from "../../classes/EditorV3TextBlock";
import { EditorV3DropListItem, IEditorV3, IEditorV3Line } from "../../classes/interface";
import { textBlockFactory } from "../../classes/textBlockFactory";
import { splitV3intoLines } from "../../functions";

export const ADD_LINE = "ADD_LINE";
export const REMOVE_LINE = "REMOVE_LINE";
export const UPDATE_LINE = "UPDATE_LINE";
export const ADD_BLOCK = "ADD_BLOCK";
export const REMOVE_BLOCK = "REMOVE_BLOCK";
export const UPDATE_BLOCK = "UPDATE_BLOCK";
export const UPDATE_BLOCK_TYPE = "UPDATE_BLOCK_TYPE";
export const UPDATE_BLOCK_STYLE = "UPDATE_BLOCK_STYLE";
export const UPDATE_BLOCK_LABEL = "UPDATE_BLOCK_LABEL";
export const UPDATE_BLOCK_TEXT = "UPDATE_BLOCK_TEXT";
export const UPDATE_BLOCK_OPTIONS = "UPDATE_BLOCK_OPTIONS";

export type WindowViewOperation =
  | "ADD_LINE"
  | "REMOVE_LINE"
  | "UPDATE_LINE"
  | "ADD_BLOCK"
  | "REMOVE_BLOCK"
  | "UPDATE_BLOCK"
  | "UPDATE_BLOCK_TYPE"
  | "UPDATE_BLOCK_STYLE"
  | "UPDATE_BLOCK_LABEL"
  | "UPDATE_BLOCK_TEXT"
  | "UPDATE_BLOCK_OPTIONS";

export interface WindowViewAction {
  operation: WindowViewOperation;
  lineIndex?: number;
  blockIndex?: number;
  line?: IEditorV3Line;
  block?: IEditorV3TextBlock | IEditorV3AtBlock | IEditorV3SelectBlock;
  blockType?: "text" | "at" | "select";
  blockStyle?: string;
  blockLabel?: string;
  blockText?: string;
  blockOptions?: IEditorV3;
}

export const windowViewReducer = (
  lines: IEditorV3Line[],
  action: WindowViewAction,
): IEditorV3Line[] => {
  const newLines = cloneDeep(lines);

  switch (action.operation) {
    case ADD_LINE: {
      const newLine = action.line ?? new EditorV3Line().data;
      if (
        action.lineIndex !== undefined &&
        action.lineIndex >= 0 &&
        action.lineIndex <= newLines.length
      )
        newLines.splice(action.lineIndex, 0, newLine);
      break;
    }
    case REMOVE_LINE: {
      if (
        action.lineIndex !== undefined &&
        action.lineIndex >= 0 &&
        action.lineIndex < newLines.length
      )
        newLines.splice(action.lineIndex, 1);
      break;
    }
    case UPDATE_LINE: {
      if (
        action.lineIndex !== undefined &&
        action.lineIndex !== undefined &&
        action.lineIndex >= 0 &&
        action.lineIndex < newLines.length &&
        action.line
      )
        newLines[action.lineIndex] = action.line;
      break;
    }
    case ADD_BLOCK: {
      const newBlock = action.block ?? new EditorV3TextBlock().data;
      if (
        action.lineIndex !== undefined &&
        action.lineIndex >= 0 &&
        action.lineIndex < newLines.length &&
        action.blockIndex !== undefined &&
        action.blockIndex >= 0 &&
        action.blockIndex <= newLines[action.lineIndex].textBlocks.length
      )
        newLines[action.lineIndex].textBlocks.splice(action.blockIndex, 0, newBlock);
      break;
    }
    case REMOVE_BLOCK: {
      if (
        action.lineIndex !== undefined &&
        action.lineIndex >= 0 &&
        action.lineIndex < newLines.length &&
        action.blockIndex !== undefined &&
        action.blockIndex >= 0 &&
        action.blockIndex < newLines[action.lineIndex].textBlocks.length
      )
        newLines[action.lineIndex].textBlocks.splice(action.blockIndex, 1);
      break;
    }
    case UPDATE_BLOCK: {
      if (
        action.lineIndex !== undefined &&
        action.lineIndex >= 0 &&
        action.lineIndex < newLines.length &&
        action.blockIndex !== undefined &&
        action.blockIndex >= 0 &&
        action.blockIndex < newLines[action.lineIndex].textBlocks.length &&
        action.block
      )
        newLines[action.lineIndex].textBlocks[action.blockIndex] = action.block;
      break;
    }
    case UPDATE_BLOCK_TYPE: {
      if (
        action.lineIndex !== undefined &&
        action.lineIndex >= 0 &&
        action.lineIndex < newLines.length &&
        action.blockIndex !== undefined &&
        action.blockIndex >= 0 &&
        action.blockIndex < newLines[action.lineIndex].textBlocks.length &&
        action.blockType !== newLines[action.lineIndex].textBlocks[action.blockIndex].type
      ) {
        const currentBlock = { ...newLines[action.lineIndex].textBlocks[action.blockIndex] };
        const newBlock = textBlockFactory({
          ...currentBlock,
          type: action.blockType,
          isLocked: ["at", "select"].includes(action.blockType ?? "") ? true : undefined,
        }).data;
        newLines[action.lineIndex].textBlocks[action.blockIndex] = newBlock;
      }
      break;
    }
    case UPDATE_BLOCK_STYLE: {
      if (
        action.lineIndex !== undefined &&
        action.lineIndex >= 0 &&
        action.lineIndex < newLines.length &&
        action.blockIndex !== undefined &&
        action.blockIndex >= 0 &&
        action.blockIndex < newLines[action.lineIndex].textBlocks.length &&
        action.blockStyle !== newLines[action.lineIndex].textBlocks[action.blockIndex].style
      ) {
        newLines[action.lineIndex].textBlocks[action.blockIndex].style =
          action.blockStyle === "" ? undefined : action.blockStyle;
      }
      break;
    }
    case UPDATE_BLOCK_LABEL: {
      if (
        action.lineIndex !== undefined &&
        action.lineIndex >= 0 &&
        action.lineIndex < newLines.length &&
        action.blockIndex !== undefined &&
        action.blockIndex >= 0 &&
        action.blockIndex < newLines[action.lineIndex].textBlocks.length &&
        action.blockLabel !== newLines[action.lineIndex].textBlocks[action.blockIndex].label
      ) {
        newLines[action.lineIndex].textBlocks[action.blockIndex].label =
          action.blockLabel === "" ? undefined : action.blockLabel;
      }
      break;
    }
    case UPDATE_BLOCK_TEXT: {
      if (
        action.lineIndex !== undefined &&
        action.lineIndex >= 0 &&
        action.lineIndex < newLines.length &&
        action.blockIndex !== undefined &&
        action.blockIndex >= 0 &&
        action.blockIndex < newLines[action.lineIndex].textBlocks.length &&
        action.blockText !== newLines[action.lineIndex].textBlocks[action.blockIndex].text
      ) {
        newLines[action.lineIndex].textBlocks[action.blockIndex].text = action.blockText ?? "";
      }
      break;
    }
    case UPDATE_BLOCK_OPTIONS: {
      if (
        action.lineIndex !== undefined &&
        action.lineIndex >= 0 &&
        action.lineIndex < newLines.length &&
        action.blockIndex !== undefined &&
        action.blockIndex >= 0 &&
        action.blockIndex < newLines[action.lineIndex].textBlocks.length &&
        newLines[action.lineIndex].textBlocks[action.blockIndex].type === "select" &&
        action.blockOptions
      ) {
        const newBlockOptions: EditorV3DropListItem<Record<string, string>>[] = splitV3intoLines(
          action.blockOptions,
        ).map((l) => {
          const ret: EditorV3DropListItem<Record<string, string>> = {
            text: l.lines[0].textBlocks[0].text,
            data: {},
          };
          if (l.lines[0].textBlocks[0].style) {
            ret.data!.style = l.lines[0].textBlocks[0].style;
          }
          return ret;
        });
        (
          newLines[action.lineIndex].textBlocks[action.blockIndex] as IEditorV3SelectBlock
        ).availableOptions = newBlockOptions;
      }
      break;
    }
  }
  return newLines;
};
