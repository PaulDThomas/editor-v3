import { useEffect, useId, useState } from "react";
import baseStyles from "../BaseInputs.module.css";

interface WindowViewBlockTextProps extends React.ComponentProps<"input"> {
  label: string;
  disabled: boolean;
  text?: string;
  setText: (label: string) => void;
}

export const WindowViewBlockText = ({
  label,
  disabled,
  text,
  setText,
  ...rest
}: WindowViewBlockTextProps) => {
  const thisId = useId();
  const [currentText, setCurrentText] = useState<string>(text ?? "");
  useEffect(() => {
    setCurrentText(text ?? "");
  }, [text]);

  return (
    <div
      className={baseStyles.holder}
      style={{ resize: "horizontal" }}
    >
      <label
        id={`label-${thisId}`}
        className={baseStyles.label}
        htmlFor={thisId}
      >
        {label}
      </label>
      <input
        {...rest}
        aria-labelledby={`label-${thisId}`}
        id={thisId}
        disabled={disabled}
        className={baseStyles.baseInput}
        value={currentText}
        onChange={(e) => setCurrentText(e.currentTarget.value)}
        onBlur={() => setText(currentText)}
      />
    </div>
  );
};