import { useCallback } from "react";
import { EditorV3Line } from "../classes/EditorV3Line";
import { EditorV3BlockClass, IEditorV3 } from "../classes/interface";
import styles from "./WindowView.module.css";
import { WindowViewBlock } from "./WindowViewBlock";

interface WindowViewLineProps {
  content: IEditorV3;
  lineIndex: number;
  setLine: (line: EditorV3Line) => void;
}

export const WindowViewLine = ({ content, lineIndex, setLine }: WindowViewLineProps) => {
  const line = lineIndex < content.lines.length ? content.lines[lineIndex] : undefined;
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
      {content.contentProps?.allowNewLine && (
        <div className={styles.windowViewLineTitle}>Line {lineIndex + 1}</div>
      )}
      {line.textBlocks.map((_, ix) => (
        <WindowViewBlock
          key={ix}
          content={content}
          lineIndex={lineIndex}
          blockIndex={ix}
          setTextBlock={(textBlock) => setTextBlock(textBlock, ix)}
        />
      ))}
    </div>
  );
};
