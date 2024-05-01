import styles from "./IconStyles.module.css";

export const RemoveBlock = ({ onClick }: { onClick: () => void }) => (
  <span onClick={onClick}>
    <svg
      className={styles.removeIcon}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      fill="red"
      aria-label="Remove text block"
    >
      <path
        fill="currentColor"
        d="M24 30H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M4 22h-.002L4 28h20v-6zM30 3.41L28.59 2L25 5.59L21.41 2L20 3.41L23.59 7L20 10.59L21.41 12L25 8.41L28.59 12L30 10.59L26.41 7z"
      />
      <path
        fill="currentColor"
        d="M4 14V8h14V6H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h22v-2Z"
      />
    </svg>
  </span>
);
