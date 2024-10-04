import { useContext, useId, useMemo } from "react";
import { EditorV3Styles } from "../../classes";
import { BaseSelect } from "../ObjectEditor/BaseSelect";
import { WindowViewContext } from "./WindowView";
import { UPDATE_BLOCK_STYLE } from "./windowViewReducer";

interface WindowViewBlockStyleProps {
  lineIndex: number;
  blockIndex: number;
}

export const WindowViewBlockStyle = ({ lineIndex, blockIndex }: WindowViewBlockStyleProps) => {
  const wvc = useContext(WindowViewContext);
  const thisLine = wvc?.lines[lineIndex];
  const thisBlock = thisLine?.textBlocks[blockIndex];
  const selectStyleId = useId();

  const availableOptions = useMemo(() => {
    const ret: { label: string; value: string | undefined; disabled?: boolean }[] = [
      { label: "None", value: undefined },
    ];
    if (wvc && wvc.contentProps.styles) {
      ret.push(
        ...Object.keys(wvc.contentProps.styles).map((sn) => ({
          label: sn,
          value: sn,
          disabled: (wvc.contentProps.styles as EditorV3Styles)[sn].isNotAvailable,
        })),
      );
    }
    return ret;
  }, [wvc]);

  return !wvc || !thisBlock ? (
    <></>
  ) : (
    <BaseSelect
      id={selectStyleId}
      label="Style"
      value={thisBlock.style}
      availableOptions={availableOptions}
      disabled={!wvc.editable}
      change={(ret) => {
        wvc.dispatch({
          operation: UPDATE_BLOCK_STYLE,
          lineIndex,
          blockIndex,
          blockStyle: ret as string,
        });
      }}
    />
  );
};

WindowViewBlockStyle.displayName = "WindowViewBlockStyle";
