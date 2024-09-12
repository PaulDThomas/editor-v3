import { ContextWindow } from "@asup/context-menu";
import { cloneDeep, isEqual } from "lodash";
import { useCallback } from "react";
import { EditorV3Content, EditorV3Line } from "../../classes";
import { useDebounceStack } from "../../hooks";
import { EditorV3State } from "../EditorV3";
import { AddLine, RedoBtn, RemoveLine, UndoBtn } from "../icons";
import iconStyles from "../icons/IconStyles.module.css";
import styles from "./WindowView.module.css";
import { WindowViewLine } from "./WindowViewLine";

interface WindowViewProps {
  id: string;
  showWindowView: boolean;
  setShowWindowView: (show: boolean) => void;
  state: EditorV3State;
  setState: (state: EditorV3State) => void;
}

export const WindowView = ({
  id,
  showWindowView,
  setShowWindowView,
  state,
  setState,
}: WindowViewProps) => {
  const {
    currentValue,
    setCurrentValue,
    forceUpdate,
    undo,
    redo,
    stack,
    index: stackIndex,
  } = useDebounceStack<EditorV3Line[]>(
    state.content.lines.map((line) => new EditorV3Line(line)),
    (value: EditorV3Line[]) => {
      const ret = new EditorV3Content({ lines: value }, state.content.contentProps);
      if (
        !isEqual(
          ret.lines.map((l) => l.data),
          state.content.lines.map((l) => l.data),
        )
      ) {
        setState({ content: ret, focus: false, editable: state.editable });
      }
    },
    null,
  );

  const setLine = useCallback(
    (line: EditorV3Line, ix: number) => {
      if (currentValue) {
        const newLines = cloneDeep(currentValue);
        newLines[ix] = line;
        if (!isEqual(newLines, currentValue)) setCurrentValue(newLines);
      }
    },
    [currentValue, setCurrentValue],
  );

  const addLine = useCallback(
    (ix: number) => {
      if (currentValue) {
        const newLines = cloneDeep(currentValue);
        newLines.splice(ix, 0, new EditorV3Line({ textBlocks: [{ type: "text", text: "" }] }));
        setCurrentValue(newLines);
      }
    },
    [currentValue, setCurrentValue],
  );

  const removeLine = useCallback(
    (ix: number) => {
      if (currentValue) {
        const newLines = cloneDeep(currentValue);
        newLines.splice(ix, 1);
        setCurrentValue(newLines);
      }
    },
    [currentValue, setCurrentValue],
  );

  return !currentValue ? (
    <></>
  ) : (
    <ContextWindow
      id={id}
      visible={showWindowView}
      title={"Editor contents"}
      titleElement={
        <>
          Editor contents
          <UndoBtn
            fill={stackIndex > 0 ? "black" : "gray"}
            onClick={() => undo()}
          />
          <RedoBtn
            fill={stackIndex < (stack?.length ?? 0) - 1 ? "black" : "gray"}
            onClick={() => redo()}
          />
        </>
      }
      style={{
        height: "400px",
        width: "700px",
        maxHeight: "80vh",
        maxWidth: "90vw",
      }}
      onClose={() => {
        forceUpdate();
        setShowWindowView(false);
      }}
    >
      <div className={styles.windowViewBody}>
        {state.editable && (state.content.contentProps ?? {}).allowNewLine && (
          <AddLine onClick={() => addLine(0)} />
        )}
        {currentValue.map((line, ix) => (
          <div
            key={ix}
            className={iconStyles.relativeDiv}
          >
            {state.editable && <RemoveLine onClick={() => removeLine(ix)} />}
            <WindowViewLine
              key={ix}
              contentProps={state.content.contentProps ?? {}}
              lineIndex={ix}
              line={line}
              editable={state.editable}
              setLine={(line) => setLine(line, ix)}
            />
            {state.editable && (state.content.contentProps ?? {}).allowNewLine && (
              <AddLine onClick={() => addLine(ix + 1)} />
            )}
          </div>
        ))}
      </div>
    </ContextWindow>
  );
};

WindowView.displayName = "WindowView";
