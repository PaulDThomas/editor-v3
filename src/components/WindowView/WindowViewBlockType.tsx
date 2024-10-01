import { useContext, useId, useMemo } from "react";
import { EditorV3TextBlockType } from "../../classes/EditorV3TextBlock";
import { BaseSelect } from "../ObjectEditor/BaseSelect";
import { WindowViewContext } from "./WindowView";
import { UPDATE_BLOCK_TYPE } from "./windowViewReducer";

interface WindowViewBlockTypeProps {
  lineIndex: number;
  blockIndex: number;
}

export const WindowViewBlockType = ({ lineIndex, blockIndex }: WindowViewBlockTypeProps) => {
  const wvc = useContext(WindowViewContext);
  const thisLine = wvc?.lines[lineIndex];
  const thisBlock = thisLine?.textBlocks[blockIndex];
  const selectTypeId = useId();

  const availableOptions = useMemo(() => {
    const ret: { label: string; value: string; disabled?: boolean }[] = [];
    if (wvc) {
      ret.push(
        ...[
          {
            label: "Text",
            value: "text",
          },
          {
            label: "Select",
            value: "select",
          },
        ],
      );
      if (wvc.includeAt)
        ret.push({
          label: "At",
          value: "at",
          disabled: true,
        });
    }
    return ret;
  }, [wvc]);

  return !wvc || !thisBlock ? (
    <></>
  ) : (
    <BaseSelect
      id={selectTypeId}
      label="Type"
      value={thisBlock.type}
      availableOptions={availableOptions}
      disabled={!wvc.editable}
      change={(ret) => {
        wvc.dispatch({
          operation: UPDATE_BLOCK_TYPE,
          lineIndex,
          blockIndex,
          blockType: ret as EditorV3TextBlockType,
        });
      }}
    />
  );
};

WindowViewBlockType.displayName = "WindowViewBlockType";
