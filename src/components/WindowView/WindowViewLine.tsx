import { cloneDeep } from "lodash";
import { useCallback } from "react";
import { IEditorV3AtBlock } from "../../classes/EditorV3AtBlock";
import { IEditorV3TextBlock } from "../../classes/EditorV3TextBlock";
import { EditorV3ContentPropsInput, IEditorV3Line } from "../../classes/interface";
import styles from "./WindowView.module.css";
import { WindowViewBlock } from "./WindowViewBlock";
import { AddBlock, RemoveBlock } from "../icons";

interface WindowViewLineProps {
  contentProps: EditorV3ContentPropsInput;
  lineIndex: number;
  line: IEditorV3Line;
  setLine: (line: IEditorV3Line) => void;
}

export const WindowViewLine = ({ contentProps, lineIndex, line, setLine }: WindowViewLineProps) => {
  const setTextBlock = useCallback(
    (textBlock: IEditorV3AtBlock | IEditorV3TextBlock, ix: number) => {
      if (line) {
        const newLine = cloneDeep(line);
        newLine.textBlocks[ix] = textBlock;
        setLine(newLine);
      }
    },
    [line, setLine],
  );
  const addBlock = useCallback(
    (ix: number) => {
      if (line) {
        const newLine = cloneDeep(line);
        newLine.textBlocks.splice(ix, 0, { text: "", type: "text" });
        setLine(newLine);
      }
    },
    [line, setLine],
  );
  const removeBlock = useCallback(
    (ix: number) => {
      if (line) {
        const newLine = cloneDeep(line);
        newLine.textBlocks.splice(ix, 1);
        setLine(newLine);
      }
    },
    [line, setLine],
  );

  return (
    <div className={styles.windowViewLine}>
      {contentProps?.allowNewLine && (
        <div className={styles.windowViewLineTitle}>Line {lineIndex + 1}</div>
      )}
      <AddBlock onClick={() => addBlock(0)} />
      {line.textBlocks.map((textBlock, ix) => (
        <div
          key={ix}
          style={{ position: "relative" }}
        >
          <RemoveBlock onClick={() => removeBlock(ix)} />
          <WindowViewBlock
            contentProps={contentProps}
            textBlock={textBlock}
            setTextBlock={(textBlock) => setTextBlock(textBlock, ix)}
          />
          <AddBlock onClick={() => addBlock(ix + 1)} />
        </div>
      ))}
    </div>
  );
};

WindowViewLine.displayName = "WindowViewLine";
