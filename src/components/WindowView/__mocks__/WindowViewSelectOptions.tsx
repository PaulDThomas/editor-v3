import { useContext, useId, useState } from "react";
import { EditorV3Content } from "../../../classes";
import { EditorV3SelectBlock } from "../../../classes/EditorV3SelectBlock";
import { WindowViewContext } from "../WindowView";
import { UPDATE_BLOCK_OPTIONS } from "../windowViewReducer";
import { WindowViewSelectOptionsProps } from "../WindowViewSelectOptions";

// Mock text based component with no async behaviour
export const WindowViewSelectOptions = ({
  lineIndex,
  blockIndex,
}: WindowViewSelectOptionsProps): React.ReactNode => {
  const wvc = useContext(WindowViewContext);
  const thisBlock = wvc?.lines[lineIndex].textBlocks[blockIndex];
  const selectOptionsId = useId();

  // Holder for available options
  const [input, setInput] = useState<string>(
    thisBlock && thisBlock.type === "select"
      ? (thisBlock as EditorV3SelectBlock).availableOptions.map((o) => o.text).join("\n")
      : "",
  );

  return thisBlock?.type !== "select" ? (
    <></>
  ) : (
    <>
      <label htmlFor={`available-${selectOptionsId}`}>Available options</label>
      <textarea
        id={`available-${selectOptionsId}`}
        data-testid={`available-${selectOptionsId}`}
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        onBlur={(e) => {
          e.preventDefault();
          e.stopPropagation();
          wvc?.dispatch({
            operation: UPDATE_BLOCK_OPTIONS,
            lineIndex,
            blockIndex,
            blockOptions: new EditorV3Content(e.currentTarget.value),
          });
        }}
      />
    </>
  );
};
