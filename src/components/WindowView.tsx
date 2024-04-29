import { ContextWindow } from "@asup/context-menu";
import { useCallback } from "react";
import { EditorV3Content, EditorV3Line } from "../classes";
import { EditorV3State } from "./EditorV3";
import { WindowViewLine } from "./WindowViewLine";
import styles from "./WindowView.module.css";

interface WindowViewProps {
  id: string;
  showWindowView: boolean;
  setShowWindowView: (show: boolean) => void;
  state: EditorV3State;
  setContent: (content: EditorV3Content) => void;
  undo?: () => void;
  redo?: () => void;
}

export const WindowView = ({
  id,
  showWindowView,
  setShowWindowView,
  state,
  setContent,
  undo,
  redo,
}: WindowViewProps) => {
  const setLine = useCallback(
    (line: EditorV3Line, ix: number) => {
      if (state.content) {
        const newContent = new EditorV3Content(state.content, state.content.contentProps);
        newContent.lines[ix] = line;
        setContent(newContent);
      }
    },
    [setContent, state.content],
  );

  return (
    <ContextWindow
      id={id}
      visible={showWindowView}
      title={"Editor contents"}
      style={{
        height: "400px",
        width: "600px",
        maxHeight: "80vh",
        maxWidth: "90vw",
      }}
      onClose={() => setShowWindowView(false)}
    >
      <div className={styles.windowViewBody}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="16"
          viewBox="0 0 24 24"
          width="16"
          className={styles.undoBtn}
          fill={undo ? "black" : "gray"}
          onClick={() => undo && undo()}
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
          fill={redo ? "black" : "gray"}
          onClick={() => redo && redo()}
          aria-label="Undo"
        >
          <path
            d="M0 0h24v24H0z"
            fill="none"
          />
          <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
        </svg>
        {(state.content?.lines ?? []).map((line, ix) => (
          <WindowViewLine
            key={ix}
            state={state}
            lineIndex={ix}
            setLine={(line) => setLine(line, ix)}
          />
        ))}
      </div>
    </ContextWindow>
  );
};
