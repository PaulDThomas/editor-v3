import { useCallback } from "react";
import { IEditorV3AtBlock } from "../classes/EditorV3AtBlock";
import { IEditorV3TextBlock } from "../classes/EditorV3TextBlock";
import { EditorV3BlockClass } from "../classes/interface";
import { textBlockFactory } from "../classes/textBlockFactory";
import { EditorV3State } from "./EditorV3";
import styles from "./WindowView.module.css";
import { WindowViewBlockStyle } from "./WindowViewBlockStyle";
import { WindowViewBlockText } from "./WindowViewBlockText";
import { WindowViewBlockType } from "./WindowViewBlockType";

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
  const textBlock =
    lineIndex < state.content.lines.length &&
    blockIndex < state.content.lines[lineIndex].textBlocks.length
      ? state.content.lines[lineIndex].textBlocks[blockIndex]
      : undefined;
  const setBlock = useCallback(
    (newValues: IEditorV3AtBlock | IEditorV3TextBlock) => {
      setTextBlock(textBlockFactory(newValues));
    },
    [setTextBlock],
  );
  return !textBlock ? (
    <></>
  ) : (
    <div className={styles.windowViewBlock}>
      <WindowViewBlockType
        state={state}
        type={textBlock.type}
        setType={(type) => setBlock({ ...textBlock.data, type })}
      />
      <WindowViewBlockStyle
        state={state}
        styleName={textBlock.style}
        setStyleName={(style) =>
          setBlock({ ...textBlock.data, style: style === "" ? undefined : style })
        }
      />
      <WindowViewBlockText
        label="Label"
        disabled={false}
        text={textBlock.label}
        setText={(text) => setBlock({ ...textBlock.data, label: text === "" ? undefined : text })}
      />
      <WindowViewBlockText
        label="Text"
        disabled={textBlock.type === "at"}
        text={textBlock.text}
        setText={(text) => {
          setBlock({ ...textBlock.data, text });
        }}
      />
    </div>
  );
};
