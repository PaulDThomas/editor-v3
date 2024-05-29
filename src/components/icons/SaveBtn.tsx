import styles from "./IconStyles.module.css";

export const SaveBtn = ({ onClick }: { onClick: () => void }) => (
  <svg
    className={styles.saveBtn}
    onClick={() => {
      onClick();
    }}
    xmlns="http://www.w3.org/2000/svg"
    width="1.5em"
    height="1.5em"
    viewBox="0 0 2048 2048"
    aria-label="Save and close window"
  >
    <path
      fill="currentColor"
      d="M1152 768q27 0 50 10t40 27t28 41t10 50v1152H165L0 1883V896q0-27 10-50t27-40t41-28t50-10zM384 896v384h512V896zm512 1024v-256H384v256h128v-128h128v128zm256-1024h-128v512H256V896H128v933l91 91h37v-384h768v384h128zM512 640H384V0h512v128H512zM1920 0v1024h-512V896h384V128h-128V0zm-571 256L1187 93l90-90l318 317l-318 317l-90-90l162-163H768v256H640V256zm65 64l-6-5v10z"
    />
  </svg>
);
