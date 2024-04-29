import { useCallback } from "react";
import { EditorV3Line } from "../classes/EditorV3Line";
import { EditorV3BlockClass } from "../classes/interface";
import { EditorV3State } from "./EditorV3";
import { WindowViewBlock } from "./WindowViewBlock";
import styles from "./WindowView.module.css";

interface WindowViewLineProps {
  state: EditorV3State;
  lineIndex: number;
  setLine: (line: EditorV3Line) => void;
}

export const WindowViewLine = ({ state, lineIndex, setLine }: WindowViewLineProps) => {
  const line = state.content?.lines[lineIndex];
  const setTextBlock = useCallback(
    (textBlock: EditorV3BlockClass, ix: number) => {
      const newLine = new EditorV3Line(line);
      newLine.textBlocks[ix] = textBlock;
      setLine(newLine);
    },
    [line, setLine],
  );

  return !line ? (
    <></>
  ) : (
    <div className={styles.windowViewLine}>
      {state.content.allowNewLine && (
        <div className={styles.windowViewLineTitle}>Line {lineIndex + 1}</div>
      )}
      {line.textBlocks.map((_, ix) => (
        <WindowViewBlock
          key={ix}
          state={state}
          lineIndex={lineIndex}
          blockIndex={ix}
          setTextBlock={(textBlock) => setTextBlock(textBlock, ix)}
        />
      ))}
    </div>
  );
};
