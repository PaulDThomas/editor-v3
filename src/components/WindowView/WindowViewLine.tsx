import { cloneDeep } from "lodash";
import { useCallback } from "react";
import { EditorV3AtBlock } from "../../classes/EditorV3AtBlock";
import { EditorV3Line } from "../../classes/EditorV3Line";
import { EditorV3TextBlock } from "../../classes/EditorV3TextBlock";
import { EditorV3ContentPropsInput } from "../../classes/interface";
import { AddBlock, RemoveBlock } from "../icons";
import styles from "./WindowView.module.css";
import { WindowViewBlock } from "./WindowViewBlock";

interface WindowViewLineProps {
  contentProps: EditorV3ContentPropsInput;
  lineIndex: number;
  line: EditorV3Line;
  editable: boolean;
  setLine: (line: EditorV3Line) => void;
}

export const WindowViewLine = ({
  contentProps,
  lineIndex,
  line,
  editable,
  setLine,
}: WindowViewLineProps) => {
  const setTextBlock = useCallback(
    (textBlock: EditorV3AtBlock | EditorV3TextBlock, ix: number) => {
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
        newLine.textBlocks.splice(ix, 0, new EditorV3TextBlock());
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
      {editable && <AddBlock onClick={() => addBlock(0)} />}
      {line.textBlocks.map((textBlock, ix) => (
        <div
          key={ix}
          style={{ position: "relative" }}
        >
          {editable && <RemoveBlock onClick={() => removeBlock(ix)} />}
          <WindowViewBlock
            contentProps={contentProps}
            textBlock={textBlock}
            editable={editable}
            setTextBlock={(textBlock) => setTextBlock(textBlock, ix)}
          />
          {editable && <AddBlock onClick={() => addBlock(ix + 1)} />}
        </div>
      ))}
    </div>
  );
};

WindowViewLine.displayName = "WindowViewLine";
