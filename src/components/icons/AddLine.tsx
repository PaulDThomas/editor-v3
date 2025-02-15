import { useContext } from "react";
import { WindowViewContext } from "../WindowView/WindowView";
import { ADD_LINE } from "../WindowView/windowViewReducer";
import styles from "./IconStyles.module.css";

export const AddLine = ({ index }: { index: number }) => {
  const wvc = useContext(WindowViewContext);

  const onClick = () => {
    wvc &&
      wvc.dispatch({
        operation: ADD_LINE,
        lineIndex: index,
      });
  };

  return (
    <div
      className={styles.addDiv}
      onClick={onClick}
    >
      <svg
        className={styles.addIcon}
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 32 32"
        aria-label="Add line"
      >
        <path
          fill="currentColor"
          d="M26 30h-2V20H12v10h-2V20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2zM5.17 16L2 19.17l1.411 1.419L8 16l-4.58-4.58L2 12.83zM24 14H12a2 2 0 0 1-2-2V2h2v10h12V2h2v10a2 2 0 0 1-2 2"
        />
      </svg>
    </div>
  );
};
