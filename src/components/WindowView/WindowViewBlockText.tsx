import { useContext, useId } from "react";
import { BaseInput } from "../ObjectEditor/BaseInput";
import { WindowViewContext } from "./WindowView";
import { UPDATE_BLOCK_LABEL, UPDATE_BLOCK_TEXT } from "./windowViewReducer";

interface WindowViewBlockTextProps {
  lineIndex: number;
  blockIndex: number;
  label?: boolean;
}

export const WindowViewBlockText = ({
  lineIndex,
  blockIndex,
  label = false,
}: WindowViewBlockTextProps) => {
  const wvc = useContext(WindowViewContext);
  const thisLine = wvc?.lines[lineIndex];
  const thisBlock = thisLine?.textBlocks[blockIndex];
  const thisId = useId();

  return !wvc || !thisBlock ? (
    <></>
  ) : (
    <BaseInput
      id={thisId}
      label={label ? "Label" : "Text"}
      value={label ? thisBlock.label : thisBlock.text}
      disabled={!wvc.editable}
      change={(ret) => {
        if (wvc && typeof ret === "string") {
          if (label) {
            wvc.dispatch({
              operation: UPDATE_BLOCK_LABEL,
              lineIndex,
              blockIndex,
              blockLabel: ret,
            });
          } else {
            wvc.dispatch({
              operation: UPDATE_BLOCK_TEXT,
              lineIndex,
              blockIndex,
              blockText: ret,
            });
          }
        }
      }}
    />
  );
};

WindowViewBlockText.displayName = "WindowViewBlockText";
