import { ContextWindow } from "@asup/context-menu";
import { cloneDeep } from "lodash";
import { useCallback, useMemo } from "react";
import { EditorV3Content, IEditorV3 } from "../classes";
import { IEditorV3Line } from "../classes/interface";
import { useDebounceStack } from "../hooks";
import { EditorV3State } from "./EditorV3";
import styles from "./WindowView.module.css";
import { WindowViewLine } from "./WindowViewLine";
import { AddLine } from "./icons/AddLine";
import { RemoveLine } from "./icons/RemoveLine";
import { SaveBtn } from "./icons/SaveBtn";
import { RedoBtn } from "./icons/RedoBtn";
import { UndoBtn } from "./icons/UndoBtn";

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
    currentValue: content,
    setCurrentValue: setContent,
    forceUpdate,
    undo,
    redo,
    stack,
    index: stackIndex,
  } = useDebounceStack<IEditorV3>(
    state.content,
    (value: IEditorV3) => {
      const ret = new EditorV3Content(value);
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
      if (content) {
        const newLines = cloneDeep(content.lines);
        newLines[ix] = line;
        setContent({ contentProps, lines: newLines });
      }
    },
    [content, setContent, contentProps],
  );

  const addLine = useCallback(
    (ix: number) => {
      if (content) {
        const newLines = cloneDeep(content.lines);
        newLines.splice(ix, 0, { textBlocks: [{ type: "text", text: "" }] });
        setContent({ contentProps, lines: newLines });
      }
    },
    [content, setContent, contentProps],
  );

  const removeLine = useCallback(
    (ix: number) => {
      if (content) {
        const newLines = cloneDeep(content.lines);
        newLines.splice(ix, 1);
        setContent({ contentProps, lines: newLines });
      }
    },
    [content, setContent, contentProps],
  );

  return !content ? (
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
        {content.lines.map((line, ix) => (
          <div
            key={ix}
            className={styles.relativeDiv}
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
