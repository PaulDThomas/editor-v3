import { useContext } from "react";
import { WindowViewContext } from "../WindowView/WindowView";
import { REMOVE_LINE } from "../WindowView/windowViewReducer";
import styles from "./IconStyles.module.css";

export const RemoveLine = ({ index }: { index: number }) => {
  const wvc = useContext(WindowViewContext);

  const onClick = () => {
    wvc &&
      wvc.dispatch({
        operation: REMOVE_LINE,
        lineIndex: index,
      });
  };

  return (
    <span onClick={onClick}>
      <svg
        className={styles.removeLineIcon}
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 32 32"
        aria-label="Remove line"
      >
        <path
          fill="currentColor"
          d="M29 26H12a1 1 0 0 1-.707-.293l-9-9a1 1 0 0 1 0-1.414l9-9A1 1 0 0 1 12 6h17a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1m-16.586-2H28V8H12.414l-8 8z"
        />
        <path
          fill="currentColor"
          d="M20.414 16L25 11.414L23.586 10L19 14.586L14.414 10L13 11.414L17.586 16L13 20.586L14.414 22L19 17.414L23.586 22L25 20.586z"
        />
      </svg>
    </span>
  );
};
