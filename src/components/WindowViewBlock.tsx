import { useCallback } from "react";
import { IEditorV3AtBlock } from "../classes/EditorV3AtBlock";
import { IEditorV3TextBlock } from "../classes/EditorV3TextBlock";
import { EditorV3BlockClass, IEditorV3 } from "../classes/interface";
import { textBlockFactory } from "../classes/textBlockFactory";
import styles from "./WindowView.module.css";
import { WindowViewBlockStyle } from "./WindowViewBlockStyle";
import { WindowViewBlockText } from "./WindowViewBlockText";
import { WindowViewBlockType } from "./WindowViewBlockType";

interface WindowViewBlockProps {
  content: IEditorV3;
  lineIndex: number;
  blockIndex: number;
  setTextBlock: (textBlock: EditorV3BlockClass) => void;
}

export const WindowViewBlock = ({
  content,
  lineIndex,
  blockIndex,
  setTextBlock,
}: WindowViewBlockProps) => {
  const textBlock =
    lineIndex < content.lines.length && blockIndex < content.lines[lineIndex].textBlocks.length
      ? textBlockFactory(content.lines[lineIndex].textBlocks[blockIndex])
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
      {content.contentProps?.atListFunction && (
        <WindowViewBlockType
          type={textBlock.type}
          setType={(type) => setBlock({ ...textBlock.data, type })}
        />
      )}
      {content.contentProps?.styles && Object.keys(content.contentProps.styles).length > 0 && (
        <WindowViewBlockStyle
          styles={content.contentProps.styles}
          styleName={textBlock.style}
          setStyleName={(style) =>
            setBlock({ ...textBlock.data, style: style === "" ? undefined : style })
          }
        />
      )}{" "}
      <WindowViewBlockText
        label="Label"
        disabled={false}
        text={textBlock.label}
        setText={(text) => setBlock({ ...textBlock.data, label: text === "" ? undefined : text })}
      />
      <WindowViewBlockText
        label="Text"
        disabled={textBlock.type === "at" || (textBlock.isLocked ?? false)}
        text={textBlock.text}
        setText={(text) => {
          setBlock({ ...textBlock.data, text });
        }}
      />
    </div>
  );
};
