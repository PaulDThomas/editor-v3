import { ContextWindow } from "@asup/context-menu";
import { cloneDeep } from "lodash";
import { useCallback, useMemo } from "react";
import { EditorV3Content, EditorV3Line } from "../../classes";
import { IEditorV3Line } from "../../classes/interface";
import { useDebounceStack } from "../../hooks";
import { EditorV3State } from "../EditorV3";
import styles from "./WindowView.module.css";
import iconStyles from "../icons/IconStyles.module.css";
import { WindowViewLine } from "./WindowViewLine";
import { AddLine, RedoBtn, RemoveLine, SaveBtn, UndoBtn } from "../icons";

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
    currentValue: lines,
    setCurrentValue: setLines,
    forceUpdate,
    undo,
    redo,
    stack,
    index: stackIndex,
  } = useDebounceStack<IEditorV3Line[]>(
    state.content.lines.map((line) => (line instanceof EditorV3Line ? line.data : line)),
    (value: IEditorV3Line[]) => {
      const ret = new EditorV3Content({ lines: value }, state.content.contentProps);
      setState({ content: ret, focus: false });
    },
    null,
  );

  const contentProps = useMemo(
    () => state.content.contentProps ?? {},
    [state.content.contentProps],
  );

  const setLine = useCallback(
    (line: IEditorV3Line, ix: number) => {
      if (lines) {
        const newLines = cloneDeep(lines);
        newLines[ix] = line;
        setLines(newLines);
      }
    },
    [lines, setLines],
  );

  const addLine = useCallback(
    (ix: number) => {
      if (lines) {
        const newLines = cloneDeep(lines);
        newLines.splice(ix, 0, { textBlocks: [{ type: "text", text: "" }] });
        setLines(newLines);
      }
    },
    [lines, setLines],
  );

  const removeLine = useCallback(
    (ix: number) => {
      if (lines) {
        const newLines = cloneDeep(lines);
        newLines.splice(ix, 1);
        setLines(newLines);
      }
    },
    [lines, setLines],
  );

  return !lines ? (
    <></>
  ) : (
    <ContextWindow
      id={id}
      visible={showWindowView}
      title={"Editor contents"}
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
        <SaveBtn
          onClick={() => {
            forceUpdate();
            setShowWindowView(false);
          }}
        />
        <UndoBtn
          fill={stackIndex > 0 ? "black" : "gray"}
          onClick={() => undo()}
        />
        <RedoBtn
          fill={stackIndex < (stack?.length ?? 0) - 1 ? "black" : "gray"}
          onClick={() => redo()}
        />

        {contentProps.allowNewLine && <AddLine onClick={() => addLine(0)} />}
        {lines.map((line, ix) => (
          <div
            key={ix}
            className={iconStyles.relativeDiv}
          >
            <RemoveLine onClick={() => removeLine(ix)} />
            <WindowViewLine
              key={ix}
              contentProps={contentProps}
              lineIndex={ix}
              line={line}
              setLine={(line) => setLine(line, ix)}
            />
            {contentProps.allowNewLine && <AddLine onClick={() => addLine(ix + 1)} />}
          </div>
        ))}
      </div>
    </ContextWindow>
  );
};
