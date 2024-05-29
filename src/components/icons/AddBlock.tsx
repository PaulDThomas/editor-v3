import styles from "./IconStyles.module.css";

export const AddBlock = ({ onClick }: { onClick: () => void }) => (
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
      aria-label="Add text block"
    >
      <path
        fill="currentColor"
        d="M28 12H10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M10 4v6h18V4zm18 26H10a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2m-18-8v6h18v-6zm-1-6l-5.586-5.586L2 11.828L6.172 16L2 20.172l1.414 1.414z"
      />
    </svg>
  </div>
);
