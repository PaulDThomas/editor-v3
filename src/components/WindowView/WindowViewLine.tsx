import { useCallback, useContext } from "react";
import { AddBlock, RemoveBlock } from "../icons";
import { WindowViewContext } from "./WindowView";
import styles from "./WindowView.module.css";
import { WindowViewBlock } from "./WindowViewBlock";
import { ADD_BLOCK, REMOVE_BLOCK } from "./windowViewReducer";

interface WindowViewLineProps {
  lineIndex: number;
}

export const WindowViewLine = ({ lineIndex }: WindowViewLineProps) => {
  const wvc = useContext(WindowViewContext);
  const thisLine = wvc?.lines[lineIndex];

  const addBlock = useCallback(
    (ix: number) => {
      wvc &&
        wvc.dispatch({
          operation: ADD_BLOCK,
          lineIndex,
          blockIndex: ix,
        });
    },
    [lineIndex, wvc],
  );
  const removeBlock = useCallback(
    (ix: number) => {
      wvc && wvc.dispatch({ operation: REMOVE_BLOCK, lineIndex, blockIndex: ix });
    },
    [lineIndex, wvc],
  );

  return !wvc || !thisLine ? (
    <></>
  ) : (
    <div className={styles.windowViewLine}>
      {wvc.contentProps.allowNewLine && (
        <div className={styles.windowViewLineTitle}>Line {lineIndex + 1}</div>
      )}
      {wvc.editable && <AddBlock onClick={() => addBlock(0)} />}
      {wvc.lines[lineIndex].textBlocks.map((textBlock, ix) => (
        <div
          key={ix}
          style={{ position: "relative" }}
        >
          {wvc.editable && <RemoveBlock onClick={() => removeBlock(ix)} />}
          <WindowViewBlock
            lineIndex={lineIndex}
            blockIndex={ix}
          />
          {wvc.editable && <AddBlock onClick={() => addBlock(ix + 1)} />}
        </div>
      ))}
    </div>
  );
};

WindowViewLine.displayName = "WindowViewLine";
