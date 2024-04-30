import { cloneDeep } from "lodash";
import { useCallback } from "react";
import { IEditorV3AtBlock } from "../classes/EditorV3AtBlock";
import { IEditorV3TextBlock } from "../classes/EditorV3TextBlock";
import { EditorV3ContentPropsInput, IEditorV3Line } from "../classes/interface";
import { textBlockFactory } from "../classes/textBlockFactory";
import styles from "./WindowView.module.css";
import { WindowViewBlock } from "./WindowViewBlock";

interface WindowViewLineProps {
  contentProps: EditorV3ContentPropsInput;
  lineIndex: number;
  line: IEditorV3Line;
  setLine: (line: IEditorV3Line) => void;
}

const AddBlock = ({ onClick }: { onClick: () => void }) => (
  <div
    className={styles.addDiv}
    onClick={onClick}
  >
    <svg
      className={styles.addIcon}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
    >
      <path
        fill="currentColor"
        d="M28 12H10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M10 4v6h18V4zm18 26H10a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2m-18-8v6h18v-6zm-1-6l-5.586-5.586L2 11.828L6.172 16L2 20.172l1.414 1.414z"
      />
    </svg>
  </div>
);
const RemoveBlock = ({ onClick }: { onClick: () => void }) => (
  <span onClick={onClick}>
    <svg
      className={styles.removeIcon}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      fill="red"
    >
      <path
        fill="currentColor"
        d="M24 30H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M4 22h-.002L4 28h20v-6zM30 3.41L28.59 2L25 5.59L21.41 2L20 3.41L23.59 7L20 10.59L21.41 12L25 8.41L28.59 12L30 10.59L26.41 7z"
      />
      <path
        fill="currentColor"
        d="M4 14V8h14V6H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h22v-2Z"
      />
    </svg>
  </span>
);

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
        newLine.textBlocks.splice(ix, 0, textBlockFactory({ text: "" }));
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
