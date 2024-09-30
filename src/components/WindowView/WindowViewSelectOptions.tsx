import { useCallback, useContext, useId, useMemo, useState } from "react";
import { EditorV3Content } from "../../classes";
import { EditorV3SelectBlock } from "../../classes/EditorV3SelectBlock";
import { EditorV3DropListItem, IEditorV3 } from "../../classes/interface";
import { joinV3intoBlock } from "../../functions/joinV3intoBlock";
import { BaseEditorV3 } from "../BaseEditorv3";
import { WindowViewContext } from "./WindowView";
import styles from "./WindowView.module.css";
import { UPDATE_BLOCK_OPTIONS } from "./windowViewReducer";

export interface WindowViewSelectOptionsProps extends React.ComponentProps<"div"> {
  lineIndex: number;
  blockIndex: number;
}

export const WindowViewSelectOptions = ({
  lineIndex,
  blockIndex,
}: WindowViewSelectOptionsProps): JSX.Element => {
  const wvc = useContext(WindowViewContext);
  const thisLine = wvc?.lines[lineIndex];
  const thisBlock = thisLine?.textBlocks[blockIndex];
  const selectOptionsId = useId();

  // Holder for available options
  const input: IEditorV3 = useMemo(() => {
    if (thisBlock && thisBlock.type === "select") {
      const availableOptions: EditorV3DropListItem<Record<string, string>>[] = (
        thisBlock as EditorV3SelectBlock
      ).availableOptions;
      return joinV3intoBlock(
        availableOptions.map((o) => ({
          lines: [{ textBlocks: [{ text: o.text, style: o.data?.style }] }],
        })),
      );
    } else return new EditorV3Content().data;
  }, [thisBlock]);

  const [validationText, setValidationText] = useState<string[]>([]);
  const setObject = useCallback(
    (value: IEditorV3) => {
      const validationText: string[] = [];
      if (value.lines.some((l) => l.textBlocks.length > 1))
        validationText.push("Each line must have only one style");
      if (value.lines.some((l) => l.textBlocks.map((tb) => tb.text.trim()).join("") === ""))
        validationText.push("Each line must have at least one character");
      setValidationText(validationText);

      if (validationText.length === 0) {
        wvc?.dispatch({
          operation: UPDATE_BLOCK_OPTIONS,
          lineIndex,
          blockIndex,
          blockOptions: value,
        });
      }
    },
    [blockIndex, lineIndex, wvc],
  );

  return !wvc || !thisLine || !thisBlock ? (
    <></>
  ) : (
    <div
      className={[
        styles.windowViewBlock,
        thisBlock.type !== "select" ? styles.noHeight : styles.height,
      ].join(" ")}
    >
      {thisBlock.type !== "select" ? null : (
        <BaseEditorV3
          id={`available-${selectOptionsId}`}
          label="Available options"
          errorText={validationText.join("\n")}
          allowNewLine
          editable={wvc.editable}
          customStyleMap={wvc.contentProps.styles}
          input={input}
          setObject={setObject}
        />
      )}
    </div>
  );
};

WindowViewSelectOptions.displayName = "WindowViewBlockOptions";
