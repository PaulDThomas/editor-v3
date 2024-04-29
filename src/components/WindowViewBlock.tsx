import { useCallback, useId } from "react";
import { EditorV3BlockClass } from "../classes/interface";
import { EditorV3State } from "./EditorV3";
import styles from "./WindowView.module.css";
import { EditorV3AtBlock, EditorV3TextBlock } from "../classes";
import { IEditorV3AtBlock } from "../classes/EditorV3AtBlock";
import { EditorV3TextBlockType } from "../classes/EditorV3TextBlock";

interface WindowViewBlockProps {
  state: EditorV3State;
  lineIndex: number;
  blockIndex: number;
  setTextBlock: (textBlock: EditorV3BlockClass) => void;
}

export const WindowViewBlock = ({
  state,
  lineIndex,
  blockIndex,
  setTextBlock,
}: WindowViewBlockProps) => {
  const textBlock = state.content?.lines[lineIndex]?.textBlocks[blockIndex];
  const selectTypeId = useId();
  const selectStyleId = useId();
  const textId = useId();
  const setBlock = useCallback(
    (newValues: { newText?: string; newStyle?: string; newType?: EditorV3TextBlockType }) => {
      switch (newValues.newType ?? textBlock.type) {
        case "at": {
          const newAtBlockProps: IEditorV3AtBlock = {
            ...textBlock.data,
            text: newValues.newText ?? textBlock.text,
            style: newValues.newStyle ?? textBlock.style,
          };
          const newAtBlock = new EditorV3AtBlock(newAtBlockProps);
          setTextBlock(newAtBlock);
          break;
        }
        case "text":
        default: {
          const newTextBlock = new EditorV3TextBlock({
            text: newValues.newText ?? textBlock.text,
            style: newValues.newStyle ?? textBlock.style,
          });
          setTextBlock(newTextBlock);
        }
      }
    },
    [setTextBlock, textBlock.data, textBlock.style, textBlock.text, textBlock.type],
  );
  return !textBlock ? (
    <></>
  ) : (
    <div className={styles.windowViewBlock}>
      <select
        id={selectTypeId}
        value={textBlock.type}
        onChange={(e) => setBlock({ newType: e.currentTarget.value as "text" | "at" })}
      >
        <option value="text">Text</option>
        <option value="at">At</option>
      </select>
      <select
        id={selectStyleId}
        value={textBlock.style}
        onChange={(e) => setBlock({ newStyle: e.currentTarget.value })}
      >
        <option value="">None</option>
        {Object.keys(state.content.contentProps.styles ?? []).map((style, ix) => (
          <option
            key={ix}
            value={style}
          >
            {style}
          </option>
        ))}
      </select>
      <input
        type="text"
        id={textId}
        value={textBlock.text}
        onChange={(e) => setBlock({ newText: e.currentTarget.value })}
      />
    </div>
  );
};
