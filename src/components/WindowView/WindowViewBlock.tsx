import { useContext } from "react";
import { WindowViewContext } from "./WindowView";
import styles from "./WindowView.module.css";
import { WindowViewBlockStyle } from "./WindowViewBlockStyle";
import { WindowViewBlockText } from "./WindowViewBlockText";
import { WindowViewBlockType } from "./WindowViewBlockType";
import { WindowViewSelectOptions } from "./WindowViewSelectOptions";

interface WindowViewBlockProps {
  lineIndex: number;
  blockIndex: number;
}

export const WindowViewBlock = ({ lineIndex, blockIndex }: WindowViewBlockProps) => {
  const wvc = useContext(WindowViewContext);
  const thisLine = wvc?.lines[lineIndex];
  const thisBlock = thisLine?.textBlocks[blockIndex];

  return !wvc || !thisBlock ? (
    <></>
  ) : (
    <>
      <div className={styles.windowViewBlock}>
        <WindowViewBlockType
          lineIndex={lineIndex}
          blockIndex={blockIndex}
        />
        {wvc.contentProps?.styles && Object.keys(wvc.contentProps.styles).length > 0 && (
          <WindowViewBlockStyle
            lineIndex={lineIndex}
            blockIndex={blockIndex}
          />
        )}
        <WindowViewBlockText
          label
          lineIndex={lineIndex}
          blockIndex={blockIndex}
        />
        <WindowViewBlockText
          lineIndex={lineIndex}
          blockIndex={blockIndex}
        />
      </div>

      <WindowViewSelectOptions
        lineIndex={lineIndex}
        blockIndex={blockIndex}
      />
    </>
  );
};

WindowViewBlock.displayName = "WindowViewBlock";
