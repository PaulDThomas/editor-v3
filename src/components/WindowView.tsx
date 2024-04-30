import { ContextWindow } from "@asup/context-menu";
import { useCallback } from "react";
import { EditorV3Content, EditorV3Line, IEditorV3 } from "../classes";
import { EditorV3State } from "./EditorV3";
import styles from "./WindowView.module.css";
import { WindowViewLine } from "./WindowViewLine";
import { useDebounceStack } from "../hooks";

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
    (value: IEditorV3) => setState({ content: new EditorV3Content(value), focus: false }),
    null,
  );

  const setLine = useCallback(
    (line: EditorV3Line, ix: number) => {
      if (content) {
        const newLines = [...content.lines];
        newLines[ix] = line;
        const newContent = new EditorV3Content(
          { ...content, lines: newLines },
          content.contentProps,
        );
        setContent(newContent);
      }
    },
    [setContent, content],
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="16"
          viewBox="0 0 24 24"
          width="16"
          className={styles.undoBtn}
          fill={stackIndex > 0 ? "black" : "gray"}
          onClick={() => undo()}
          aria-label="Undo"
        >
          <path
            d="M0 0h24v24H0z"
            fill="none"
          />
          <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="16"
          viewBox="0 0 24 24"
          width="16"
          className={styles.redoBtn}
          fill={stackIndex < (stack?.length ?? 0) - 1 ? "black" : "gray"}
          onClick={() => redo()}
          aria-label="Redo"
        >
          <path
            d="M0 0h24v24H0z"
            fill="none"
          />
          <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
        </svg>
        {content.lines.map((line, ix) => (
          <WindowViewLine
            key={ix}
            content={content}
            lineIndex={ix}
            setLine={(line) => setLine(line, ix)}
          />
        ))}
      </div>
    </ContextWindow>
  );
};
